import PropTypes from 'prop-types'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { format, isValid } from 'date-fns'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'

const getDateAsDayLightSaving = dt => format(dt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
const getDateAsInput = dt => format(dt, "yyyy-MM-dd'T'HH:mm")

export const DateTimeEditor = forwardRef((props, ref) => {
    const defaultValue = compareEmptyNullUndef(props.valueFormatted, props.value)
  const dt = new Date(defaultValue)
  const inputValue = dt && isValid(dt) ? getDateAsInput(dt) : ''
  const [innerDate, setDate] = useState(inputValue)

  const onDateChanged = evt => {
    setDate(evt.target.value)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => {
      const dt = innerDate ? new Date(innerDate) : ''
      return isValid(dt) ? getDateAsDayLightSaving(dt) : ''
    }
  }))

  const inputType = 'datetime-local'
  return (
    <div className="ag-custom-component-popup">
      <input
        defaultValue={innerDate}
        type={inputType}
        ref={ref}
        data-input
        style={{ width: '100%', height: '100%' }}
        onChange={onDateChanged}
        className="ag-cell ag-row"
      />
    </div>
  )
})

DateTimeEditor.displayName = 'DateTimeEditor'
DateTimeEditor.propTypes = {
  colDef: PropTypes.shape({
    headerComponentParams: {
      schema: {
        subType: PropTypes.string.isRequired
      }
    }
  })
}
