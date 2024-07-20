import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { LocationSearchResult } from '.'
import { TypeAhead } from '../search/containers/TypeAhead'
import { BuildingLocationSelector } from './BuildingLocationSelector'
import { api } from '../../app/api'
import { useObject } from '../../../shared/hooks/useObject'

export const LocationSearchInput = ({
  onSelectedItemChange,
  queryParams,
  building,
  location,
  readOnly,
  ...props
}) => {
  if (building) {
    return (
      <BuildingLocationSelector
        {...props}
        onSelectedItemChange={onSelectedItemChange}
        building={building}
        location={location}
        disabled={readOnly}
      />
    )
  }

  const getBuildingLocations = locations =>
    _.map(locations, loc => ({
      location: loc.location,
      description: loc?.pelchildloc?.description,
      pelchildloc: loc?.pelchildloc,
      siteid: loc?.siteid
    }))
  const getBuildingLocation = building => {
    const { data } = useObject(
      api,
      'pellocchild',
      building
        ? `oslc.where=location="${building}"&oslc.select=*&querytemplate=BASIC_SEARCH&lochierarchy.childlocations.where=status="OPERATING"`
        : null,
      true
    )
    return data ? getBuildingLocations(data.member) : []
  }
  const locationData = getBuildingLocation(building)
  
  
  let { where } = queryParams

  if (queryParams.and) {
    where = `${where} and ${queryParams.and}`
  }

    return (
    <TypeAhead
      searchResult={item => <LocationSearchResult location={item} />}
      itemToString={item => item?.location || ''}
      selectedItemsOnly
      onSelectedItemChange={onSelectedItemChange}
      showDescription
      preFetchData={locationData}
      objectType="pellocfull"
      queryParams={{ where }}
      //usePelSearchTerms
      disabled={readOnly}
      {...props}
    />
  )
}

LocationSearchInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onSelectedItemChange: PropTypes.func.isRequired,
  showSkeleton: PropTypes.bool,
  readOnly: PropTypes.bool.isRequired,
  labelText: PropTypes.string,
  initialInputValue: PropTypes.string,
  building: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  value: PropTypes.string,
  queryParams: PropTypes.shape({
    where: PropTypes.string,
    and: PropTypes.string
  })
}
