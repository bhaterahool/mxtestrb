import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Search, OverflowMenu, OverflowMenuItem } from 'carbon-components-react'
import Filter16 from '@carbon/icons-react/lib/filter/16'
import FilterEdit16 from '@carbon/icons-react/lib/filter--edit/16'


const parseJson = str => {
  return _.attempt(JSON.parse.bind(null, str))
}

export const SearchBasic = ({ onChange, onFilterSelect, filters }) => {
  const [savedQueryList, setSavedQueryList] = useState()

  const getCurrentFilter = () => {
    const filter = localStorage.getItem('searchFilterConfig')

    return parseJson(filter) || null
  }

  const onSelectFilter = selectedValue => () => {
    localStorage.setItem('searchFilterConfig', JSON.stringify(selectedValue))
    onFilterSelect()
  }

  const getSavedQueryList = e => {
    if (!filters) return

    setSavedQueryList(filters)

    if (!getCurrentFilter()) {
      const defaultFilter = filters.find(filter => filter.clausename === 'DEFAULT')

      if (defaultFilter) {
        onSelectFilter(defaultFilter)()
      }
    }
  }

  const isFilterConfigured = () => {
    if (localStorage.getItem('searchFilterConfig')) {
      return <FilterEdit16 />
    }
    return <Filter16 />
  }

  const selectedFilterClass = selectedValue => {
    const filterSelected =
      JSON.parse(localStorage.getItem('searchFilterConfig'))?.clausename || 'DEFAULT'
    if (selectedValue === filterSelected) {
      return 'pel--selected-filter-menuItem pel--menu-button'
    }
    return 'pel--menu-button'
  }

  const overflowMenuProps = {
    direction: 'bottom',
    ariaLabel: 'filter',
    iconDescription: 'filter',
    flipped: false,
    renderIcon: () => isFilterConfigured()
  }

  useEffect(() => {
    getSavedQueryList()
  }, [filters])

  const onEnterPress = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      onFilterSelect()
    }
  }
  const onCloseMenuItem = e => () => {
    console.log('overflow menu item close')
  }

  return (
    <>
      <div className="pel--searchFieldWrapper">
        <Search
          closeButtonLabelText="Clear search input"
          defaultValue=""
          id="search-1"
          labelText="Search"
          onChange={onChange}
          placeholder="Search"
          type="text"
          onKeyDown={onEnterPress}
        />
        <OverflowMenu {...overflowMenuProps}>
          {savedQueryList &&
            savedQueryList.map(query => (
              <OverflowMenuItem
                key={query.clausename}
                className={selectedFilterClass(query.clausename)}
                itemText={query.description || query.clausename}
                onClick={onSelectFilter(query)}
                hasDivider
                requireTitle
                closeMenu={onCloseMenuItem}
              />
            ))}
        </OverflowMenu>
      </div>
    </>
  )
}

SearchBasic.propTypes = {
  onChange: PropTypes.func.isRequired,
  onFilterSelect: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      clausename: PropTypes.string.isRequired,
      peltssuffix: PropTypes.string.isRequired
    })
  )
}
