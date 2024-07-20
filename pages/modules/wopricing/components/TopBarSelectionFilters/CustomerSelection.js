import React, { useEffect, useState, useRef } from 'react'
import { PropTypes } from 'prop-types'

import { useGridCtx } from '../../context/grid-context'
import { DropdownDataLoader } from '../DropdownDataLoader'

export const CustomerSelection = ({ handleSelection }) => {
  const { gridState } = useGridCtx()

  const { mainDropdownOptions } = gridState
  const [selectedOptionFix, setSelectedOptionFix] = useState(false)

  const cacheDropdownOptions = useRef({})
  useEffect(() => {
    if (cacheDropdownOptions.current !== mainDropdownOptions) {
      setSelectedOptionFix(prev => !prev)
      cacheDropdownOptions.current = mainDropdownOptions
    }
  }, [mainDropdownOptions])

  return (
    <DropdownDataLoader
      {...{
        label: 'Customer',
        options: mainDropdownOptions,
        selectedOptionId: `${selectedOptionFix}`, 
        existingKeys: [],
        handleSelection,
        handleDelete: () => {}
      }}
    />
  )
}

CustomerSelection.propTypes = {
  handleSelection: PropTypes.func.isRequired
}
