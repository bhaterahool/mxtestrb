import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { TrashCan32 } from '@carbon/icons-react'
import { ComboBox, Button } from 'carbon-components-react'
import { Loading } from '../../../modules/shared-components/Loading'
import './index.scss'

const LABEL_LOADED = 'LOADED'
const LABEL_NO_DATA = 'NO DATA'

export const getLoadedState = (options, id) =>
  options.find(item => item.id === id)?.hasData !== undefined

export const optionsSearch = (options, val) => {
  const regCaseInSensitive = RegExp(val, 'i')
  return options.filter(item => item.text.search(regCaseInSensitive) !== -1)
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
  handleDelete,
  placeholder = 'Filter...'
}) => {
  const [optionsFiltered, setOptionsFiltered] = useState(options)

  useEffect(() => {
    setOptionsFiltered(options)
  }, [options])

  const [optionId, setOptionId] = useState('')
  const [isLoading, setLoading] = useState(false)

  const refWrapper = useRef({})

  const handleChange = chosen => {
    const { selectedItem } = chosen
    const id = selectedItem?.id
    setOptionId(id) // sets to undefined if empty
    if (id) {
      const { text } = selectedItem
      setLoading(true)
      handleSelection(id, text).finally(() => {
        setLoading(false)
      })
    }
    refWrapper.current.focus() // take focus off select box to prevent any key triggering a delete!
  }

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

  const deleteCustomerFromTable = () => {
    handleDelete(optionId)
  }

  const isShowDeleteButton = getLoadedState(options, optionId)

  return options.length > 0 ? (
    <div className="dropselection__choose" ref={refWrapper}>
      <ComboBox
        selectedOptionId={`${selectedOptionId}`}
        onChange={handleChange}
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
      {isShowDeleteButton ? (
        <Button
          size="sm"
          renderIcon={TrashCan32}
          hasIconOnly
          iconDescription="Delete selected from table"
          title="Delete selected from table"
          kind="ghost"
          onClick={deleteCustomerFromTable}
          className="bx--btn dropselection-btn--primary"
          labelText={`Delete ${optionId}`}
        />
      ) : null}
      {isLoading ? <Loading modal /> : null}
    </div>
  ) : null
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
  handleDelete: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
