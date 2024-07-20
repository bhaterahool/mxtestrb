import React, { useRef } from 'react'
import { DocumentDownload32, Upload32 } from '@carbon/icons-react'
import { Button, ButtonSet } from 'carbon-components-react'
import XLSX from 'xlsx'
import { useGridCtx } from '../../context/grid-context'
import { useFileCtx } from '../../context/file-context'
import { transformDataForExcel } from './transformDataForExcel'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { verifySpreadsheetData } from './verifySpreadsheetData'
import { updateCustomerTableData, updatePostRows } from '../../context/grid-reducer'
import { colDefs } from '../DataGrid/Columns/colDefs'
import {
  hasEmptyRow as verifySpreadsheetHasEmptyRow,
  removeEmptyRows as removeEmptyRowsFromSpreadsheet
} from '../../../../util'
import { wopricingSearchStatus } from '../../services/wopricingSearchStatus'

export const FileImportExport = () => {
  const fileInputRef = useRef()
  const { gridState, dispatchGrid } = useGridCtx()
  const { customers, manualBillStatus } = gridState

  const { addPersistentErrorToast } = useToast()
  const statuses = wopricingSearchStatus()?.map(row => row?.id) ?? []

  const { fileState } = useFileCtx()
  const { files, selectedFileId } = fileState
  const { fileName = `Export Work Order Pricing ${Date.now()}` } = files[selectedFileId] || {}

  const { tableData } = Object.keys(customers).reduce(
    (accum, customerId) => {
      const customerItem = customers[customerId]
      return {
        tableData: accum.tableData.concat(customerItem.tableData)
      }
    },
    { tableData: [] }
  )
  const handleExport = () => {
    const workOrder = XLSX.utils.json_to_sheet(transformDataForExcel(tableData))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, workOrder, 'workOrder')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const transformDataForUpdate = (originalObjects, importedObjects, colDefs) => {
    const primaryKeyColDef = colDefs.find(coldef => coldef.isPrimaryKey)
    const editableColumns = colDefs.filter(colDef => colDef.editable || colDef.isPrimaryKey)

    return importedObjects.reduce((result, obj) => {
      const originalObj = originalObjects.find(
        origObj => origObj[primaryKeyColDef.field] === obj[primaryKeyColDef.headerName]
      )

      if (originalObj) {
        
        result.push(
          editableColumns.reduce(
            
            (acc, colDef) => ({
              ...acc,
              [colDef.field]: obj[colDef.headerName]
            }),
            
            originalObj
          )
        )
      }

      return result
    }, [])
  }

  const readFile = file => {
    const fileReader = new FileReader()
    fileReader.onload = async ({ target }) => {
      const { result: binaryString } = target
      const workbook = XLSX.read(binaryString, { type: 'binary' })

      const hasEmptyRow = verifySpreadsheetHasEmptyRow(
        XLSX.utils.sheet_to_json(workbook.Sheets.workOrder, { header: 1, defval: '' })
      )
      if (hasEmptyRow) {
        fileReader.abort()
        return addPersistentErrorToast({
          title: 'Error reading file!',
          subtitle: 'Attempting to add workorders that are not contiguous'
        })
      }

      const importedWorkOrders = removeEmptyRowsFromSpreadsheet(
        XLSX.utils.sheet_to_json(workbook.Sheets.workOrder, { defval: '' })?.map(row => ({
          ...row,

          'Line Description': row['Line Description']?.slice(0, 100) ?? ''
        }))
      )

      const verificationPassed = verifySpreadsheetData({
        statuses,
        dataToVerify: importedWorkOrders,
        tableData,
        onError: addPersistentErrorToast,
        manualBillStatus
      })
      if (verificationPassed) {
        const workorders = transformDataForUpdate(tableData, importedWorkOrders, colDefs)

        // group imported work orders by customerId to align with "customers" application state
        const customers = workorders.reduce((acc, workorder) => {
          if (!acc[workorder.pluspcustomer]) acc[workorder.pluspcustomer] = { tableData: [] }
          acc[workorder.pluspcustomer].tableData.push(workorder)
          return acc
        }, {})

        // iterate over customers updating table data for each customer (chose not to use "overwriteAll" action as spreadsheet may not contain data for all customers)
        Object.entries(customers).forEach(([customerId, { tableData }]) => {
          dispatchGrid(
            updateCustomerTableData({
              customerId,
              tableData
            })
          )
        })

        dispatchGrid(
          updatePostRows({
            postRowUpdatesCustomers: workorders
          })
        )
      }
    }

    fileReader.onerror = () => {
      addPersistentErrorToast({
        title: 'Error reading file!',
        subtitle: fileReader.error
      })
      fileReader.abort()
    }
    fileReader.readAsBinaryString(file)
  }

  const handleFileImport = ({ target }) => {
    const { files } = target
    const [file] = files
    readFile(file)
    // eslint-disable-next-line no-param-reassign
    target.value = ''
  }

  const triggerFileImport = () => {
    fileInputRef.current.click()
  }

  return (
    <>
      <ButtonSet>
        <Button kind="tertiary" size="small" renderIcon={DocumentDownload32} onClick={handleExport}>
          Export
        </Button>
        <Button kind="tertiary" size="small" renderIcon={Upload32} onClick={triggerFileImport}>
          Import
        </Button>
      </ButtonSet>
      <input
        hidden
        ref={fileInputRef}
        className="afpbulk-file-input"
        type="file"
        accept=".xls,.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileImport}
      />
    </>
  )
}
