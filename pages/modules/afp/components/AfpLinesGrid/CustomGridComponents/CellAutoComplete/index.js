import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import PropTypes from 'prop-types'

import { CustomAutoComplete } from '../../../../../../shared/components/CustomAutoComplete'

export const CellAutoCompelete = forwardRef((props, ref) => {
  const { value, cellSelectOptions, onSelect, ...rest } = props

  const [inputValue, setInputValue] = useState(value)
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([])

  const handleOnSelect = (value, option) => {
    const selectedItem =
      cellSelectOptions?.filter(row => +row.contractlineid === +option.value) ?? []

    onSelect({
      selectedItem,
      values: cellSelectOptions,
      ...rest
    })
  }

  const handleOnChange = v => {
    setInputValue(v)
  }

  useEffect(() => {
    const transformOptions = cellSelectOptions?.map(({ contractlineid, description }) => ({
      label: description,
      value: `${contractlineid}`
    }))

    setAutoCompleteOptions(transformOptions)
  }, [cellSelectOptions])

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return inputValue
      },
      isCancelBeforeStart: () => !cellSelectOptions?.length
    }
  })

  return (
    <CustomAutoComplete
      value={inputValue}
      options={autoCompleteOptions}
      onSelect={handleOnSelect}
      onChange={handleOnChange}
    />
  )
})

CellAutoCompelete.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func,
  cellSelectOptions: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      contractlineid: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  )
}
