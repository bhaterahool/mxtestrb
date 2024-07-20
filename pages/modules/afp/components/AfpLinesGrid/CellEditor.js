import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'

const SCHEMA = {
  ALN: value => `${value}`.trim(),
  INT: value => !Number.isNaN(+value)
}

const CellEditor = (
  { value, type = 'number', schemaType = 'INT', columnApi, colDef, data },
  ref
) => {
  const [inputState, setInput] = useState(value)
  const refInput = useRef(null)
  const schema = SCHEMA[schemaType]

  useEffect(() => {
    setTimeout(() => refInput.current.focus())

    return () => {
      if (colDef.field === 'comment') columnApi.autoSizeColumn('comment')
    }
  }, [])

  useImperativeHandle(ref, () => {
    return {
      getValue: () => inputState,
      isCancelBeforeStart() {
        const {
          metadata: { editableField }
        } = data
        const { field } = colDef
        return field in editableField ? !editableField[field] : false
      },
      isCancelAfterEnd() {
        return !schema(inputState)
      }
    }
  })

  const setInputValue = ({ target }) => {
    setInput(state => (schema(target.value) ? target.value : state))
  }

  return (
    <div className="ag-cell-editor">
      <input
        className="ag-input-field-input ag-text-field-input"
        ref={refInput}
        type={type}
        value={inputState}
        onChange={setInputValue}
      />
    </div>
  )
}

CellEditor.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  type: PropTypes.oneOf(['number', 'string']),
  schemaType: PropTypes.oneOf(['INT'])
}

export default forwardRef(CellEditor)
