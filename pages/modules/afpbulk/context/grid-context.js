import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react'
import { useEnhancedReducer } from '../../../shared/hooks/useEnhancedReducer'

import { initState, reducer } from './grid-reducer'

const autoSizeCols = gridApi => {
  const allColumnIds = []
  gridApi.columnApi.getAllColumns().forEach(function(column) {
    allColumnIds.push(column.colId)
  })

  gridApi.columnApi.autoSizeColumns(allColumnIds)
}

const GridContext = createContext(null)

const GridProvider = ({ children }) => {
  const [gridReadyAssignments, setGridReadyStateAssignments] = useState(false)
  const dataGridRefAssignments = useRef({})

  const [gridReadyAssets, setGridReadyStateAssets] = useState(false)
  const dataGridRefAssets = useRef({})

  const [, dispatchGrid, getGridState] = useEnhancedReducer(reducer, initState)

  const gridState = getGridState()

  const { groupedTableData } = gridState
  const groupIds = Object.keys(groupedTableData || {})
  useEffect(() => {
    if (!groupIds.length) {
      setGridReadyStateAssignments(false)
      setGridReadyStateAssets(false)
    }
  }, [groupIds.length])

  const registerDataGridRefAssignments = useCallback(
    params => {
      if (params && !gridReadyAssignments) {
        dataGridRefAssignments.current = params
        const { api } = params
        if (api) {
          autoSizeCols(params)
          setGridReadyStateAssignments(true)
        }
      }
    },
    [gridReadyAssignments]
  )

  const registerDataGridRefAssets = useCallback(
    params => {
      if (params && !gridReadyAssets) {
        dataGridRefAssets.current = params
        const { api } = params
        if (api) {
          autoSizeCols(params)
          setGridReadyStateAssets(true)
        }
      }
    },
    [gridReadyAssets]
  )

  return (
    <GridContext.Provider
      value={{
        dataGridRefAssignments,
        gridReadyAssignments,
        registerDataGridRefAssignments,

        dataGridRefAssets,
        gridReadyAssets,
        registerDataGridRefAssets,

        gridState,
        dispatchGrid,
        getGridState
      }}
    >
      {children}
    </GridContext.Provider>
  )
}

const useGridCtx = () => {
  const Ctx = useContext(GridContext)
  if (Ctx == null) {
    throw new Error('Afpbulk - useGridCtx() called outside of a GridProvider?') 
  }
  return Ctx
}

export { GridProvider, useGridCtx }
