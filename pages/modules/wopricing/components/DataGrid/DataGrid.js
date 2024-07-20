import React, { useEffect, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { LicenseManager } from 'ag-grid-enterprise'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { agGridFixes, LICENSE_KEY } from '../../../../shared/grid/grid'
import { useGridCtx } from '../../context/grid-context'
import { colDefs } from './Columns/colDefs'
import { getGridRowData } from '../../utilities/getGridRowData'
import { COMMIT_SUCCESS } from '../../../../shared/grid/constants'
import { blankRow, updateCustomerTableData } from '../../context/grid-reducer'
import { cloneArr, cloneObj } from '../../../../util/clone'



import { CellRendererDefault } from './Cell/CellRendererDefault'
import { CellEditorStatus } from './Cell/CellEditorStatus'
import { CellNumberEditor } from '../../../../shared/grid/cellNumberEditor'

import './DataGrid.scss'

LicenseManager.setLicenseKey(LICENSE_KEY)

export const getPostRowChanges = ({ postRowUpdatesCustomers }) =>
  postRowUpdatesCustomers.map(
    row => {
      return cloneObj(row)
    }
    
    
  )

export const DataGrid = () => {
  const { dataGridRef, registerDataGridRef, gridState, gridReady, dispatchGrid } = useGridCtx()

  const { customers, gridAddCustomer, gridOverwrite } = gridState
  const customerKeys = Object.keys(customers || {})

  const gridApi = gridReady && dataGridRef.current.api

  const handleCellValueChanged = params => {
    const { pluspcustomer } = params.data
    const tableData = getGridRowData(params.api, node => node.data.pluspcustomer === pluspcustomer)
    dispatchGrid(
      updateCustomerTableData({
        customerId: pluspcustomer,
        tableData
      })
    )
  }

  const onCellEditingStarted = paramEvt => {
    const { data } = paramEvt
    const isSaved = data.committed === COMMIT_SUCCESS
    if (isSaved) {
      gridApi.stopEditing(true)
    }
  }

  const onCellKeyDown = params => {
        const { field } = params.colDef
    if (field === 'linecost' && params.event.target.value) {
      const { pluspcustomer, wonum } = params.data

      const tableData = getGridRowData(
        params.api,
        node => node.data.pluspcustomer === pluspcustomer
      )?.map(row => ({
        ...row,
        ...(row.pluspcustomer === pluspcustomer &&
          row.wonum === wonum && { [field]: params.event.target.value })
      }))

      dispatchGrid(
        updateCustomerTableData({
          customerId: pluspcustomer,
          tableData
        })
      )
    }
  }

  const prevCache = useRef({})

  useEffect(() => {
    if (gridApi && gridOverwrite && gridOverwrite !== prevCache.current?.gridOverwrite) {
      if (customerKeys.length > 0) {
        const gridApi = dataGridRef.current.api
        gridApi.setRowData([])
        customerKeys.forEach(key => {
          const tableData = customers[key]?.tableData || []
          if (tableData.length) {
            gridApi.applyTransactionAsync({
              add: cloneArr(tableData)
            })
          }
        })
      }
      prevCache.current = { gridOverwrite }
    }
  }, [gridReady, gridOverwrite])

  useEffect(() => {
    if (gridApi && gridAddCustomer && gridAddCustomer !== prevCache.current?.gridAddCustomer) {
      prevCache.current = { ...prevCache.current, gridAddCustomer }
      const agGridModel = getGridRowData(gridApi)
      const tableData = customers[gridAddCustomer]?.tableData
      const pluspcustomer = tableData.find(item => item.pluspcustomer)
      const exists = agGridModel.find(item => item.pluspcustomer === pluspcustomer)
      if (!exists) {
        gridApi.applyTransactionAsync({
          add: cloneArr(tableData)
        })
      }
    }
  }, [gridReady, gridAddCustomer])

  const { postRowUpdatesCustomers } = gridState
  const postRowUpdatesCustomersStringified = postRowUpdatesCustomers.map(item =>
    JSON.stringify(item)
  )
  useEffect(() => {
    if (gridApi && postRowUpdatesCustomers.length > 0) {
      
      
      
      const data = Object.prototype.hasOwnProperty.call(postRowUpdatesCustomers[0], 'row') 
      
      

      const update = postRowUpdatesCustomers?.map(
        crc =>
          customers[crc?.pluspcustomer]?.tableData.find(
            workorder => workorder?.href === crc?.href
          ) ?? crc
      )

      
      
      
      
      
      
      
      
      const allBlank = update.map(item => ({ ...blankRow, href: item.href }))
      gridApi.applyTransactionAsync({
        update: allBlank
      })
      gridApi.applyTransactionAsync({
        update
      })
    }
  }, [postRowUpdatesCustomersStringified])

  const { gridRowRemove } = gridState
  useEffect(() => {
    if (gridApi && gridRowRemove) {
      const agGridModel = getGridRowData(gridApi)
      const removeRows = agGridModel.reduce((accum, item) => {
        if (item.pluspcustomer === gridRowRemove) {
          accum.push(item)
        }
        return accum
      }, [])
      if (removeRows.length > 0) {
        gridApi.applyTransactionAsync({
          remove: removeRows
        })
      }
      prevCache.current = { ...prevCache.current, gridAddCustomer: null } 
    }
  }, [gridRowRemove])

  return customerKeys.length > 0 ? (
    <div className="ag-theme-alpine wopricing__gridwrapper">
      <AgGridReact
        onGridReady={registerDataGridRef}
        columnDefs={colDefs}
        components={{
          cellRendererDefault: CellRendererDefault,
          cellEditorStatus: CellEditorStatus,
          cellNumberEditor: CellNumberEditor
        }}
        enableRangeSelection
        stopEditingWhenCellsLoseFocus
        onCellValueChanged={handleCellValueChanged}
        getRowId={({ data }) => data.href}
        onCellEditingStarted={onCellEditingStarted}
        onCellKeyDown={onCellKeyDown}
        singleClickEdit
        {...agGridFixes({})}
      />
    </div>
  ) : null
}
