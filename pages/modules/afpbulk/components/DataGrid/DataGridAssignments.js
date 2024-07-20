import React, { useEffect, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { agGridFixes } from '../../../../shared/grid/grid'
import { useGridCtx } from '../../context/grid-context'
import { colDefsAssignments } from './Columns/colDefs'
import { getGridRowData } from '../../utilities/getGridRowData'
import { blankRow, updateRowAssignments } from '../../context/grid-reducer'
import { cloneArr } from '../../../../util/clone'

import { frameworkComponents, getPostRowChanges } from './sharedDataGrid'
import { getContextMenuItems } from './getContextMenuItems'
import { COMMIT_SUCCESS } from '../../../../shared/grid/constants'

export const DataGridAssignments = () => {
  const {
    dataGridRefAssignments,
    registerDataGridRefAssignments,
    gridState,
    gridReadyAssignments,
    dispatchGrid
  } = useGridCtx()

  const { groupedTableData, gridAddWorkGroup, gridOverwrite } = gridState
  const groupIds = Object.keys(groupedTableData || {})

  const gridApi = gridReadyAssignments && dataGridRefAssignments.current.api

  const handleCellValueChanged = params => {
    const rowData = params.data
    dispatchGrid(
      updateRowAssignments({
        rowData
      })
    )
  }
  const handleAfterDelete = data => {
    dispatchGrid(
      updateRowAssignments({
        rowData: data
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

  const prevCache = useRef({})

  useEffect(() => {
    if (gridApi && gridOverwrite && gridOverwrite !== prevCache.current?.gridOverwrite) {
      if (groupIds.length > 0) {
        const gridApi = dataGridRefAssignments.current.api
        gridApi.setRowData([])
        groupIds.forEach(key => {
          const tableDataAssignments = groupedTableData[key]?.tableDataAssignments || []
          if (tableDataAssignments.length) {
            gridApi.applyTransactionAsync({
              add: cloneArr(tableDataAssignments)
            })
          }
        })
      }
      prevCache.current = { gridOverwrite }
    }
  }, [gridReadyAssignments, gridOverwrite])

  useEffect(() => {
    if (gridApi && gridAddWorkGroup && gridAddWorkGroup !== prevCache.current?.gridAddWorkGroup) {
      prevCache.current = { ...prevCache.current, gridAddWorkGroup }
      const agGridModel = getGridRowData(gridApi)
      const tableDataAssignments = groupedTableData[gridAddWorkGroup]?.tableDataAssignments
      const firstItemStatusId = tableDataAssignments.find(item => item.groupId)
      const exists = agGridModel.find(item => item.groupId === firstItemStatusId)
      if (!exists) {
        gridApi.applyTransactionAsync({
          add: cloneArr(tableDataAssignments)
        })
      }
    }
  }, [gridReadyAssignments, gridAddWorkGroup])

  const { postRowUpdatesAssignments } = gridState
  const postRowUpdatesAssignmentsStringified = postRowUpdatesAssignments.map(item =>
    JSON.stringify(item)
  )
  useEffect(() => {
    if (gridApi && postRowUpdatesAssignments.length > 0) {
      
      gridApi.stopEditing(true)

      
      

      const update = getPostRowChanges({
        postRowUpdates: postRowUpdatesAssignments,
        tableDataName: 'tableDataAssignments',
        groupedTableData,
        key: 'assignmentid'
      })

      
      
      
      

      
      
      
      const allBlank = update.map(item => ({ ...blankRow, href: item.href }))
      gridApi.applyTransactionAsync({
        update: allBlank
      })
      gridApi.applyTransactionAsync({
        update
      })
    }
  }, [postRowUpdatesAssignmentsStringified])

  const { gridRowRemove } = gridState
  useEffect(() => {
    if (gridApi && gridRowRemove) {
      const agGridModel = getGridRowData(gridApi)
      const removeRows = agGridModel.reduce((accum, item) => {
        if (item.groupId === gridRowRemove) {
          accum.push(item)
        }
        return accum
      }, [])
      if (removeRows.length > 0) {
        gridApi.applyTransactionAsync({
          remove: removeRows
        })
      }
      prevCache.current = { ...prevCache.current, gridAddWorkGroup: null } 
    }
  }, [gridRowRemove])

  return groupIds.length > 0 ? (
    <article className="afpbulk__grid">
      <h4 className="afpbulk__grid-title">Assignments</h4>
      <AgGridReact
        onGridReady={registerDataGridRefAssignments}
        columnDefs={colDefsAssignments}
        components={frameworkComponents}
        enableRangeSelection
        stopEditingWhenCellsLoseFocus
        onCellValueChanged={handleCellValueChanged}
        getRowId={({ data }) => data.href}
        getContextMenuItems={getContextMenuItems}
        onCellEditingStarted={onCellEditingStarted}
        singleClickEdit
        {...agGridFixes({ handleAfterDelete })}
      />
    </article>
  ) : null
}
