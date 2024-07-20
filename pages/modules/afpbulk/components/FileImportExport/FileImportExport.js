import React, { useRef } from 'react'
import { DocumentDownload32, Upload32 } from '@carbon/icons-react'
import { Button, ButtonSet } from 'carbon-components-react'
import XLSX from 'xlsx'
import { useGridCtx } from '../../context/grid-context'
import { useFileCtx } from '../../context/file-context'
import { transformDataForExcel, LABEL_STATUS_ID } from './transformDataForExcel'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { verifySpreadsheetData } from './verifySpreadsheetData'
import { updatePostRows, updateRowAssets, updateRowAssignments } from '../../context/grid-reducer'

export const FileImportExport = () => {
  const fileInputRef = useRef()
  const { gridState, dispatchGrid } = useGridCtx()
  const { groupedTableData, dropdowns, mainDropdownOptions, allowedStatuses } = gridState

  const { addPersistentErrorToast, addSuccessToast } = useToast()

  const { fileState } = useFileCtx()
  const { files, selectedFileId } = fileState
  const { fileName = `Export Subcon AFP Bulk ${Date.now()}` } = files[selectedFileId] || {}

  const { tableDataAssets, tableDataAssignments } = Object.keys(groupedTableData).reduce(
    (accum, groupId) => {
      const tableData = groupedTableData[groupId]
      return {
        tableDataAssignments: accum.tableDataAssignments.concat(tableData.tableDataAssignments),
        tableDataAssets: accum.tableDataAssets.concat(tableData.tableDataAssets)
      }
    },
    { tableDataAssets: [], tableDataAssignments: [] }
  )
  const handleExport = () => {
    const assetsWorksheet = XLSX.utils.json_to_sheet(
      transformDataForExcel(tableDataAssets, 'assets')
    )
    const assignmentsWorksheet = XLSX.utils.json_to_sheet(
      transformDataForExcel(tableDataAssignments, 'assignments')
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, assignmentsWorksheet, 'Assignments')
    XLSX.utils.book_append_sheet(workbook, assetsWorksheet, 'Multi Assets')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const getAssignmentHref = lookupId => {
    if (!lookupId || !tableDataAssignments) return
    const { href } = tableDataAssignments.find(({ assignmentid }) => {
      return assignmentid === parseInt(lookupId, 10)
    })
    return href
  }

  const trimColumnValue = data => {
    return (
      data &&
      data.map(row => {
        Object.keys(row).forEach(column => {
          if (typeof row[column] === 'string') {
                        row[column] = row[column].trim()
                      }
        })

        return row
      })
    )
  }

  const getPelReasonCodeIfAssignmentStatusChanged = ({ assignmentid, status, pelreasoncode }) => {
    const gridRowData = tableDataAssignments?.find(
      assignment => assignment.assignmentid === assignmentid
    )
    return gridRowData &&
      (gridRowData?.pelreasoncode === pelreasoncode || gridRowData.status !== status)
      ? pelreasoncode
      : ''
  }

  const transformAssignmentsDataForUpdate = ({
    Assignment: assignmentid,
    'Appointment Required': apptrequired,
    'SR Number': ticketid,
    'Work Order': wonum,
    Customer: pluspcustomer,
    Building: pellocbuilding,
    Status: status,
    'Reason Code': pelreasoncode,
    'Appointment Start': pelappointslotstart,
    'Appointment Finish': pelappointslotfinish,
    Worktype: worktype,
    'Target Finish': targcompdate,
    'Target Start': targstartdate,
    'Service Request Type': pelsrtype,
    Priority: wopriority,
    'Assignment Description': peldescription,
    'Permit Reference': pelpermitref,
    'Permit Required': pelpermitrequired,
    'Actual Start': startdate,
    'Actual Finish': finishdate,
    'Estimated Start': pelassignstart,
    'Estimated Finish': pelassignfinish,
    'Failure Reason': mtfmcof,
    'Failure Class': failurecode,
    Problem: failurereportProblem,
    Cause: failurereportCause,
    Remedy: failurereportRemedy,

    
    
    [LABEL_STATUS_ID]: groupId
  }) => ({
    href: getAssignmentHref(assignmentid),
    status,
    assignmentid,
    apptrequired,
    pelappointslotstart,
    pelappointslotfinish,
    worktype,
    targcompdate,
    targstartdate,
    pelsrtype,
    wopriority,
    startdate,
    finishdate,
    peldescription,
    pelpermitrequired,
    pelreasoncode: getPelReasonCodeIfAssignmentStatusChanged({
      assignmentid,
      status,
      pelreasoncode
    }),
    pelpermitref,
    ticketid,
    wonum,
    pluspcustomer,
    pellocbuilding,
    pelassignstart,
    pelassignfinish,
    mtfmcof,
    failurecode,
    failurereportProblem,
    failurereportCause,
    failurereportRemedy,
    groupId
  })

  const getAssetsHrefAndStatusId = lookupId => {
    if (!lookupId) return
    const { groupId, href } = tableDataAssets.find(({ assignmentid }) => {
      return assignmentid === parseInt(lookupId, 10)
    })
    return { groupId, href }
  }

  const transformAssetsDataForUpdate = ({
    Assignment: assignmentid,
    'Work Order': wonum,
    'Multi Asset': multiid,
    Asset: assetnum,
    Location: location,
    'Work Complete': pelworkcomp,
    'Work Complete Date': pelcompdate,
    'Work Outcome': pelworkoutcome,
    'Work Completion Notes': pelcompnotes,
    'Non-Completion Reason': pelnoncompreason,
    'New Condition': newreading
  }) => ({
    ...getAssetsHrefAndStatusId(assignmentid),
    assignmentid,
    wonum,
    multiid,
    assetnum,
    location,
    pelworkcomp,
    pelcompdate,
    pelworkoutcome,
    pelcompnotes,
    pelnoncompreason,
    newreading,
    edited: []
  })

  const readFile = file => {
    const fileReader = new FileReader()
    fileReader.onload = async ({ target }) => {
      const { result: binaryString } = target
      const workbook = XLSX.read(binaryString, { type: 'binary' })

      const assignmentsWorksheet = workbook.Sheets.Assignments
      const multiAssetsWorksheet = workbook.Sheets['Multi Assets']

      const assignmentsData = trimColumnValue(
        XLSX.utils.sheet_to_json(assignmentsWorksheet, { defval: '' })
      )

      const multiAssetsData = trimColumnValue(
        XLSX.utils.sheet_to_json(multiAssetsWorksheet, { defval: '' })
      )

      const verificationPassed = verifySpreadsheetData(
        { assignmentsData, multiAssetsData },
        { tableDataAssets, tableDataAssignments, dropdowns, mainDropdownOptions, allowedStatuses },
        addPersistentErrorToast
      )
      if (verificationPassed) {
        const assignmentsUpdates = []
        const assetsUpdates = []
        // ignore committed assignment rows
        const lockedAssignmentIds = tableDataAssignments.reduce((acc, item) => {
          return item.locked === true ? [...acc, item.assignmentid] : acc
        }, [])
        const updatedAssignmentData = assignmentsData.filter(
          item => !lockedAssignmentIds.includes(item.Assignment)
        )

        if (updatedAssignmentData.length) {
          updatedAssignmentData.forEach(data => {
            const updates = transformAssignmentsDataForUpdate(data)
            dispatchGrid(
              updateRowAssignments({
                rowData: updates
              })
            )
            assignmentsUpdates.push(updates)
          })
        }
        if (multiAssetsData.length) {
          multiAssetsData.forEach(data => {
            const updates = transformAssetsDataForUpdate(data)
            dispatchGrid(
              updateRowAssets({
                rowData: updates
              })
            )
            assetsUpdates.push(updates)
          })
        }
        dispatchGrid(
          updatePostRows({
            postRowUpdatesAssignments: assignmentsUpdates,
            postRowUpdatesAssets: assetsUpdates
          })
        )
        addSuccessToast({
          subtitle: 'File import complete.'
        })
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
