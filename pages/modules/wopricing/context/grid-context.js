import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react'
import { useEnhancedReducer } from '../../../shared/hooks/useEnhancedReducer'
import { initState, reducer } from './grid-reducer'

const GridContext = createContext(null)

const GridProvider = ({ children }) => {
  const [gridReady, setGridReadyState] = useState(false)
  const dataGridRef = useRef({})

  const [, dispatchGrid, getGridState] = useEnhancedReducer(reducer, initState)

  const gridState = getGridState()

  const { customers } = gridState
  const customerKeys = Object.keys(customers || {})
  useEffect(() => {
    if (!customerKeys.length) {
      setGridReadyState(false)
    }
  }, [customerKeys.length])

  const registerDataGridRef = useCallback(
    params => {
      if (params && !gridReady) {
        dataGridRef.current = params
        const { api } = params
        if (api) {
          api.sizeColumnsToFit()
          setGridReadyState(true)
        }
      }
    },
    [gridReady]
  )

  return (
    <GridContext.Provider
      value={{
        dataGridRef,
        gridReady,
        registerDataGridRef,

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
    throw new Error('Wopricing - useGridCtx() called outside of a GridProvider?') 
  }
  return Ctx
}

export { GridProvider, useGridCtx }
