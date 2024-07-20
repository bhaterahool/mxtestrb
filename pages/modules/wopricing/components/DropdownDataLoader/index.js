import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { ComboBox, SelectSkeleton } from 'carbon-components-react'
import './index.scss'

const LABEL_LOADED = 'LOADED'
const LABEL_NO_DATA = 'NO DATA'

export const getLoadedState = (options, id) =>
  options.find(item => item.id === id)?.hasData !== undefined

export const optionsSearch = (options, val) => {
  const regCaseInSensitive = RegExp(val.replace(/[^a-zA-Z0-9 ]/g, ''), 'i')
  return options.filter(
    item => item.text.replace(/[^a-zA-Z0-9 ]/g, '').search(regCaseInSensitive) !== -1
  )
}

const getLoadedStateLabel = hasData => {
  switch (hasData) {
    case true:
      return `- (${LABEL_LOADED})`
    case false:
      return `- (${LABEL_NO_DATA})`
    default:
      return ''
  }
}

export const excludeHasDataFromOptions = (id, options) =>
  options.map(item => {
    const { hasData, ...rest } = item
    return item.id === id ? rest : item
  })

export const DropdownDataLoader = ({
  label,
  options,
  selectedOptionId,
  existingKeys,
  handleSelection,
  placeholder = 'Filter...'
}) => {
  const [optionsFiltered, setOptionsFiltered] = useState(options)

  useEffect(() => {
    setOptionsFiltered(options)
  }, [options])

  const refWrapper = useRef({})

  const prevVal = useRef({})

  const handleInputChange = val => {
    const isFirstChar = val.search(/\S/) === 0
    if (!isFirstChar) {
      setOptionsFiltered(options)
    } else {
      setOptionsFiltered(optionsSearch(options, val))
    }
    prevVal.current = val
  }

  return options.length > 0 ? (
    <div className="dropselection__choose customer__combobox--wrapper" ref={refWrapper}>
      <ComboBox
        selectedOptionId={`${selectedOptionId}`}
        onChange={handleSelection}
        id="choose-selection"
        items={optionsFiltered}
        itemToString={item => {
          const value =
            item && existingKeys.indexOf(item.id) !== -1
              ? `${item.text} ${getLoadedStateLabel(item.hasData)}`
              : item && item.text
          return value || ''
        }}
        placeholder={placeholder}
        titleText={`Choose ${label}`}
        onInputChange={handleInputChange}
      />
    </div>
  ) : (
    <SelectSkeleton className="dropselection__choose" />
  )
}

DropdownDataLoader.propTypes = {
  label: PropTypes.string.isRequired,
  selectedOptionId: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      hasData: PropTypes.bool 
    })
  ),
  existingKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleSelection: PropTypes.func.isRequired, 
  placeholder: PropTypes.string
}
