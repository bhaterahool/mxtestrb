import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DetailCellRenderer from './detailCellRenderer'

export const useGridConfig = () => {
  const gridRef = useRef()
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const [rowData, setRowData] = useState()
  const [columnDefs, setColumnDefs] = useState()
  const defaultColDef = useMemo(() => {
    return {
      flex: 1
    }
  }, [])
  const detailCellRenderer = useMemo(() => {
    return DetailCellRenderer
  }, [])

  return {
    gridRef,
    gridStyle,
    rowData,
    setRowData,
    columnDefs,
    setColumnDefs,
    defaultColDef,
    detailCellRenderer
  }
}
