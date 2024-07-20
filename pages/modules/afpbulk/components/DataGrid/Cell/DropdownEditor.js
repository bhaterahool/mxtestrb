import PropTypes from 'prop-types'
import React, { forwardRef, useImperativeHandle, useState, Fragment } from 'react'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'
import { useGridCtx } from '../../../context/grid-context'

const EXCEED_MAX_OPTIONS = 999

export const DropdownEditor = forwardRef((props, ref) => {
    const defaultValue = compareEmptyNullUndef(props.valueFormatted, props.value)
  const { gridState } = useGridCtx()
  const dropdownKey = props.colDef?.headerComponentParams?.dropdownKey || ''
  let arrOptions = gridState.dropdowns[dropdownKey] || []

  if (dropdownKey === 'workoutcomes') {
    const worktype =
      gridState?.groupedTableData[gridState?.gridAddWorkGroup]?.tableDataAssignments?.filter(
        row => row.assignmentid === props?.data?.assignmentid
      )?.[0]?.worktype || ''

    if (worktype) {
      arrOptions = arrOptions.filter(row => row?.alnvalue?.includes(worktype))
    }
  }

  arrOptions.forEach((option, index) => {
    const { value, text } = option

    if (!text && !value) {
      arrOptions[index] = {
        value: option,
        text: option
      }
    }
  })

  const [innerValue, setValue] = useState(defaultValue)

  const handleChange = evt => {
    setValue(evt.target.value)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return innerValue
    }
  }))

  const showDiscriptionWithValueInOption = ['workoutcomes', 'noncompreasons'].includes(dropdownKey)

  return (
    <div className="ag-custom-component-popup">
      {arrOptions.length > EXCEED_MAX_OPTIONS ? (
        <>
          <input
            list="dropdownEditor"
            type="text"
            onChange={handleChange}
            defaultValue={innerValue}
            style={{ display: 'block', width: '100%', height: '100%' }}
            className="ag-cell ag-row"
          />
          <datalist id="dropdownEditor">
            <option key="dropdownEditor-default" value="">
              Please select
            </option>
            {arrOptions.map(({ value, text }) => (
              <option value={value} key={`dropdownEditor-${value}`}>
                {text}
              </option>
            ))}
          </datalist>
        </>
      ) : (
        <select
          style={{ width: '100%', height: '100%' }}
          onChange={handleChange}
          defaultValue={innerValue}
          className="ag-cell ag-row"
        >
          <option key="dropdownEditor-default" value="">
            Please select
          </option>
          {arrOptions.map(({ value, text }) => (
            <option value={value} key={`dropdownEditor-${value}`}>
              {showDiscriptionWithValueInOption ? `${value} - ${text}` : text}
            </option>
          ))}
        </select>
      )}
      <input type="hidden" ref={ref} data-input value={innerValue} />
    </div>
  )
})

DropdownEditor.displayName = 'DropdownEditor'

DropdownEditor.propTypes = {
  colDef: PropTypes.shape({
    headerComponentParams: {
      dropdownKey: PropTypes.string.isRequired
    }
  })
}
