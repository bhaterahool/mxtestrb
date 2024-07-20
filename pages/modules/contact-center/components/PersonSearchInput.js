import React from 'react'
import PropTypes from 'prop-types'
import { TypeAhead } from '../search/containers'

export const PersonSearchInput = ({
  onSelect,
  onCreate,
  initialPerson,
  customerId,
  label,
  name,
  id
}) => {
    const personToString = item => item?.displayname || ''

  /**
   * Pass on extra parameters for filtering to the PELPERSON search query.
   */
  const getQueryParams = customer => {
    if (!customer) return

    return {
      where: `pelcust.customer="${customer}"`
    }
  }

  return (
    <div className="bx--form-item bx--text-input-wrapper">
      <label className="bx--label" htmlFor="reportedby">
        {label}
      </label>
      <TypeAhead
        id={id}
        name={name}
        objectType="pelperson"
        itemToString={personToString}
        initialInputValue={initialPerson}
        onSelectedItemChange={onSelect}
        onCreateNew={onCreate}
        queryParams={getQueryParams(customerId)}
      />
    </div>
  )
}

PersonSearchInput.defaultProps = {
  initialPerson: '',
  customerId: undefined
}

PersonSearchInput.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  initialPerson: PropTypes.string,
  customerId: PropTypes.string,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
}
