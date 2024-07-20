import React, { forwardRef, useState, useImperativeHandle, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useAfpCtx } from '../../context/afp-context'

export const CellEditorStatus = forwardRef((props, ref) => {
  const { values, field, onSelect, value = '', stopEditing, api: gridApi, context, data } = props
  const [selectedValue, setSelectedValue] = useState(value)
  const [inputItems, setInputItems] = useState(values)
  const { assignmentid } = data
  const { afps } = useAfpCtx()
  const { tabId } = context

  const setCellValue = (columnName, columnValue) => {
    gridApi?.getRowNode(assignmentid)?.setDataValue(columnName, columnValue)
  }

  const makeStatusMemoCellEditable = status => {
    const afpData = afps.get(tabId)
    const afpLineDetail =
      afpData?.data?.pelafpline?.filter(row => row.assignmentid === assignmentid) ?? []

    if (afpLineDetail?.length) {
      const { status: afpLineOldStatus, statusmemo } = afpLineDetail[0]

      if (afpLineOldStatus === status) {
        setCellValue('statusmemo', statusmemo)
        return false
      }
    }

    setCellValue('statusmemo', '')
  }

  useEffect(() => {
    if (typeof values === 'function') {
      const val = values(selectedValue)
      setInputItems(val)
    }
  }, [])

  useEffect(() => {
    if (selectedValue !== value) stopEditing()
    return () => {
      if (selectedValue) {
        const selectedItem = inputItems.filter(item => item[field] === selectedValue)
        if (onSelect) onSelect({ selectedItem, ...props })
      }
    }
  }, [selectedValue])

  useImperativeHandle(ref, () => ({
    
    
    
    getValue: () => {
      return selectedValue
    },
    isCancelBeforeStart: () => !values(selectedValue)?.length
  }))

  const handleChange = evt => {
    setSelectedValue(evt.target.value)
    makeStatusMemoCellEditable(evt.target.value)
  }

  
  return (
    <div className="ag-custom-component-popup">
      <select
        ref={ref}
        data-input
        style={{ width: '100%', height: '100%' }}
        onChange={handleChange}
        value={selectedValue}
        className="ag-cell ag-row"
      >
        {inputItems.map(option => (
          <option
            value={option.status}
            key={`status-${option.status}`}
            defaultValue={selectedValue}
          >
            {option.status}
          </option>
        ))}
      </select>
    </div>
  )
})

CellEditorStatus.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  values: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  field: PropTypes.string,
  onSelect: PropTypes.func,
  stopEditing: PropTypes.func
}
