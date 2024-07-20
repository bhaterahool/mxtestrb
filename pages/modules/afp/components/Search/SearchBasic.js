import React, { useState, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import PropTypes from 'prop-types'
import Filter16 from '@carbon/icons-react/lib/filter/16'
import { Search, OverflowMenu, OverflowMenuItem } from 'carbon-components-react'
import { DEFAULT_FILTER, FILTERS } from './search-util'

const overflowMenuProps = {
  direction: 'bottom',
  ariaLabel: 'filter',
  iconDescription: 'filter',
  flipped: false,
  renderIcon: () => <Filter16 />
}

export const SearchBasic = ({ searchTerm = '', onChange, searchRef }) => {
  const [searchTermState, setSearchTermState] = useState(searchTerm)
  const [filterState, setFilterState] = useState(DEFAULT_FILTER.value)
  const debounceRef = useRef(null)
  const onEnterPress = ({ keyCode, shiftKey, target }) => {
    if (keyCode === 13 && shiftKey === false) {
      if (debounceRef.current) debounceRef.current.cancel()
      onChange(target.value, filterState)
    }
  }

  useEffect(() => {
    debounceRef.current = debounce(onChange, 250)
  }, [])

  useEffect(() => {
    if (searchTermState) debounceRef.current(searchTermState, filterState)
  }, [searchTermState])

  useEffect(() => {
    setSearchTermState(searchTerm)
  }, [searchTerm])

  return (
    <div className="pel--searchFieldWrapper">
      <Search
        ref={searchRef}
        closeButtonLabelText="Clear search input"
        defaultValue=""
        id="search-1"
        labelText="Search"
        onChange={e => {
          const value = e?.target?.value || ''

          setSearchTermState(value)
          onChange(value, filterState)
        }}
        value={searchTermState}
        placeholder="Search"
        type="text"
        onKeyDown={onEnterPress}
      />
      <OverflowMenu {...overflowMenuProps} selectorPrimaryFocus={`.${filterState}`}>
        {FILTERS.map(({ value, description }) => (
          <OverflowMenuItem
            key={value}
            className={`pel--menu-button ${value}`}
            itemText={description}
            onClick={() => {
              setFilterState(value)
              onChange(searchTermState, value)
            }}
            hasDivider
            requireTitle
          />
        ))}
      </OverflowMenu>
    </div>
  )
}

SearchBasic.propTypes = {
  searchTerm: PropTypes.string,
  onChange: PropTypes.func.isRequired
}
