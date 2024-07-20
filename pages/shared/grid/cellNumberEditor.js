import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'




const KEY_BACKSPACE = 8
const KEY_DELETE = 46
const KEY_F2 = 113
const KEY_ENTER = 13
const KEY_TAB = 9

export const CellNumberEditor = forwardRef((props, ref) => {
    const createInitialState = () => {
    let startValue

    if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
      
      startValue = ''
    } else if (props.charPress) {
      // if a letter was pressed, we start with the letter
      startValue = props.charPress
    } else {
      // otherwise we start with the current value
      startValue = props.value
    }

    return {
      value: startValue
    }
  }

  const initialState = createInitialState()
  const [value, setValue] = useState(initialState.value)
  const refInput = useRef(null)

  // focus on the input
  useEffect(() => {
    // get ref from React component
    window.setTimeout(() => {
      const eInput = refInput.current
      eInput?.focus()
    })
  }, [])

  /* Utility Methods */
  const cancelBeforeStart = props.charPress && '1234567890.'.indexOf(props.charPress) < 0

  const isLeftOrRight = event => {
    return [37, 39].indexOf(event.keyCode) > -1
  }

  const getCharCodeFromEvent = (event = window.event) => {
    return typeof event.which === 'undefined' ? event.keyCode : event.which
  }

  const isCharNumeric = charStr => {
    return !!/\d/.test(charStr)
  }

  function isCharDecimal(charStr) {
    return '.'.indexOf(charStr) === 0
  }

  const isKeyPressedNumeric = event => {
    const charCode = getCharCodeFromEvent(event)
    const charStr = event.key ? event.key : String.fromCharCode(charCode)
    return isCharNumeric(charStr) || isCharDecimal(charStr)
  }

  const deleteOrBackspace = event => {
    return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.keyCode) > -1
  }

  const finishedEditingPressed = event => {
    const charCode = getCharCodeFromEvent(event)
    return charCode === KEY_ENTER || charCode === KEY_TAB
  }

  const onKeyDown = event => {
    if (isLeftOrRight(event) || deleteOrBackspace(event)) {
      event.stopPropagation()
      return
    }

    if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
      if (event.preventDefault) event.preventDefault()
    }
  }

    useImperativeHandle(ref, () => {
    return {
      
      getValue() {
        return value
      },

      
      
      isCancelBeforeStart() {
        return cancelBeforeStart
      },

      
      
      isCancelAfterEnd() {
        
        
        return value > 1000000
      }
    }
  })

  return (
    <div
      role="presentation"
      className="ag-cell-editor ag-labeled ag-label-align-left ag-text-field ag-input-field"
    >
      <div
        className="ag-input-field-label ag-label ag-hidden ag-text-field-label"
        role="presentation"
      />
      <div className="ag-wrapper ag-input-wrapper ag-text-field-input-wrapper" role="presentation">
        <input
          ref={refInput}
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => onKeyDown(event)}
          className="ag-input-field-input ag-text-field-input"
        />
      </div>
    </div>
  )
})
