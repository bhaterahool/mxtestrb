import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'

export const BooleanEditor = forwardRef((props, ref) => {
    const { data } = props
  const defaultValue = compareEmptyNullUndef(props.valueFormatted, props.value)
  const [innerValue, setValue] = useState(Boolean(defaultValue))

  const toggle = () => {
    setValue(prev => !prev)
  }

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return Boolean(innerValue)
    }
  }))

  return (
    <div className="ag-custom-component-popup afpbulk_boolean">
      <input
        type="checkbox"
        className="afpbulk__checkbox"
        onChange={toggle}
        checked={innerValue}
        disabled={data.locked}
      />
    </div>
  )
})

BooleanEditor.displayName = 'BooleanEditor'
