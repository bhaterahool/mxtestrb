import React, { useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { agGridFixes } from '../../../../shared/grid/grid'
import { useGridCtx } from '../../context/grid-context'
import { colDefsAssets } from './Columns/colDefs'
import { getGridRowData } from '../../utilities/getGridRowData'
import { blankRow, updateRowAssets } from '../../context/grid-reducer'
import { cloneArr } from '../../../../util/clone'

import { frameworkComponents, getPostRowChanges } from './sharedDataGrid'

import { getContextMenuItems } from './getContextMenuItems'
import { COMMIT_SUCCESS } from '../../../../shared/grid/constants'

export const DataGridAssets = () => {
  const {
    dataGridRefAssets,
    registerDataGridRefAssets,
    gridState,
    gridReadyAssets,
    dispatchGrid
  } = useGridCtx()

  const { groupedTableData, gridAddWorkGroup, gridOverwrite } = gridState
  const groupIds = Object.keys(groupedTableData || {})

  const gridApi = gridReadyAssets && dataGridRefAssets.current.api

  const handleCellValueChanged = params => {
    const rowData = params.data
    dispatchGrid(
      updateRowAssets({
        rowData
      })
    )
  }
  const handleAfterDelete = data => {
    dispatchGrid(
      updateRowAssets({
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

  const colDefs = colDefsAssets.map(colDefAsset => {
    if (['newreading', 'lastreading'].includes(colDefAsset.field)) {
      colDefAsset.valueFormatter = ({ value }) => {
        return (
          gridState.dropdowns.assetconditions.find(
            assetcondition => assetcondition.value === value?.toString()
          )?.text ?? value
        )
      }
    }
    return colDefAsset
  })

  useEffect(() => {
    if (gridApi && gridOverwrite && gridOverwrite !== prevCache.current?.gridOverwrite) {
      if (groupIds.length > 0) {
        const gridApi = dataGridRefAssets.current.api
        gridApi.setRowData([])
        groupIds.forEach(key => {
          const tableDataAssets = groupedTableData[key]?.tableDataAssets || []
          if (tableDataAssets.length) {
            gridApi.applyTransactionAsync({
              add: cloneArr(tableDataAssets)
            })
          }
        })
      }
      prevCache.current = { gridOverwrite }
    }
  }, [gridReadyAssets, gridOverwrite])

  useEffect(() => {
    if (gridApi && gridAddWorkGroup && gridAddWorkGroup !== prevCache.current?.gridAddWorkGroup) {
      prevCache.current = { ...prevCache.current, gridAddWorkGroup }
      const agGridModel = getGridRowData(gridApi)
      const tableDataAssets = groupedTableData[gridAddWorkGroup]?.tableDataAssets
      const firstItemStatusId = tableDataAssets.find(item => item.groupId)
      const exists = agGridModel.find(item => item.groupId === firstItemStatusId)
      if (!exists) {
        gridApi.applyTransactionAsync({
          add: cloneArr(tableDataAssets)
        })
      }
    }
  }, [gridReadyAssets, gridAddWorkGroup])

  const { postRowUpdatesAssets } = gridState
  const postRowUpdatesAssetsStringified = postRowUpdatesAssets.map(item => JSON.stringify(item))

  useEffect(() => {
    if (gridApi && postRowUpdatesAssets.length > 0) {
      
      gridApi.stopEditing(true)

      
      

      const update = getPostRowChanges({
        postRowUpdates: postRowUpdatesAssets,
        tableDataName: 'tableDataAssets',
        groupedTableData,
        key: 'multiid'
      })
      
      
      
      

      
      
      
      const allBlank = update.map(item => ({ ...blankRow, href: item.href }))
      gridApi.applyTransactionAsync({
        update: allBlank
      })
      gridApi.applyTransactionAsync({
        update
      })
    }
  }, [postRowUpdatesAssetsStringified])

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
      <h4 className="afpbulk__grid-title">Multi Assets</h4>
      <AgGridReact
        onGridReady={registerDataGridRefAssets}
        columnDefs={colDefs}
        components={frameworkComponents}
        stopEditingWhenCellsLoseFocus
        enableRangeSelection
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
