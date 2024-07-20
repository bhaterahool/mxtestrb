import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useGridCtx } from '../../../context/grid-context'

export const CellEditorStatus = forwardRef((props, ref) => {
    const [val, setVal] = useState(props.value)
  const { gridState } = useGridCtx()
  const { manualBillStatus } = gridState

  const rowKey = props.data.href

  const options = [
    { id: 'BILLABLE', text: 'BILLABLE' },
    { id: 'NONBILL', text: 'NONBILL' },
    { id: manualBillStatus, text: manualBillStatus }
  ]
  useImperativeHandle(ref, () => ({
    
    
    
    getValue: () => {
      return val
    },
    isCancelAfterEnd: () => {
      return !val
    }
  }))

  const handleChange = evt => {
    setVal(evt.target.value)
  }

  
  return (
    <div className="ag-custom-component-popup">
      <select
        ref={ref}
        data-input
        style={{ width: '100%', height: '100%' }}
        onChange={handleChange}
        value={val}
        className="ag-cell ag-row"
      >
        {options.map(option => (
          <option value={option.id} key={`status-${rowKey}-${option.id}`} defaultValue={val}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  )
})

CellEditorStatus.displayName = 'CellEditorStatus'
