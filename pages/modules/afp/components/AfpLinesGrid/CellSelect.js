import ReactDom from 'react-dom'
import { useCombobox } from 'downshift'
import React, { forwardRef, useEffect, useImperativeHandle, useState, useMemo } from 'react'

const search = (value, inputValue) => {
  const searchRegex = new RegExp(inputValue.replace(/[^a-zA-Z0-9 ]/g, ''), 'gi')

  return searchRegex.test(value.replace(/[^a-zA-Z0-9 ]/g, ''))
}

const calcPos = (containerEl, wrapperEl) => {
  const { left, width } = wrapperEl.style
  const getTop = e => e.getClientRects()['0']?.y
  const wrapperElTop = getTop(wrapperEl) ?? 0
  const containerElTop = getTop(containerEl) ?? wrapperElTop
  const top = wrapperElTop - containerElTop

  return containerEl
    ? {
        
        top,
        left,
        width
      }
    : null
}

const CellSelect = (props, ref) => {
  const {
    values,
    field,
    withSearch = true,
    onSelect,
    containerElQuery = null,
    value = '',
    columnApi,
    stopEditing,
    colDef,
    eGridCell
  } = props
  const [selectedValue, setSelectedValue] = useState(value)
  const [inputItems, setInputItems] = useState(values)
  const containerEl = useMemo(() => document.querySelector(containerElQuery), [])
  const [style, setStyle] = useState({})

  const {
    selectedItem,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps
  } = useCombobox({
    initialIsOpen: true,
    items: inputItems,
    initialInputValue: `${value}`,
    selectedItem: value,
    itemToString: item => (item ? item[field] : ''),
    onSelectedItemChange({ selectedItem }) {
      const { [field]: val } = selectedItem || {}
      if (val === selectedValue) stopEditing()
      else if (val) setSelectedValue(val)
    },
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        inputItems?.filter(item => !inputValue || search(item[field], inputValue)) ?? []
      )
    }
  })

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return selectedValue
      },
      isCancelBeforeStart: () => !inputItems?.length
    }
  })

  useEffect(() => {
    if (typeof values === 'function') {
      const val = values(selectedValue)
      setInputItems(val)
    }
  }, [])

  useEffect(() => {
    if (!containerEl) return

    const ro = new ResizeObserver(([{ borderBoxSize }]) => {
      const { inlineSize: width } = borderBoxSize[0]
      setStyle(state => ({ ...state, width }))
    })
    ro.observe(eGridCell)

    const agCenterViewport = containerEl.querySelector('.ag-center-cols-viewport')

    setStyle(calcPos(containerEl, eGridCell))
    agCenterViewport.onscroll = stopEditing

    return () => {
      agCenterViewport.onscroll = null
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      columnApi.autoSizeColumn(colDef.field)
    })
    return () => {
      columnApi.autoSizeColumn(colDef.field)
    }
  }, [])

  useEffect(() => {
    if (selectedValue !== value) stopEditing()
    return () => {
      if (selectedValue) {
        let items = inputItems
        if (!items?.length && Array.isArray(values)) {
          items = values
        }
        const selectedItem = items.filter(item => item[field] === selectedValue)
        if (onSelect) onSelect({ selectedItem, ...props })
      }
    }
  }, [selectedValue])

  const render = () => (
    <div className="afp-cell-select" style={style}>
      <div {...getComboboxProps()} style={{ display: withSearch ? 'block' : 'none' }}>
        <input
          className="afp-cell-select-input"
          {...getInputProps({
            placeholder: `Select a ${field}`
          })}
        />
      </div>
      <ul className="afp-cell-select-result-list" {...getMenuProps()}>
        {inputItems.map((item, index) => (
          <li
            className="afp-cell-select-list-item"
            {...getItemProps({
              key: `${item[field]}${index}`,
              index,
              item,
              style: {
                backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
                fontWeight: selectedItem === item[field] ? 'bold' : 'normal'
              }
            })}
          >
            {item[field]}
          </li>
        ))}
      </ul>
    </div>
  )

  
  return render()
}


export default forwardRef(CellSelect)
