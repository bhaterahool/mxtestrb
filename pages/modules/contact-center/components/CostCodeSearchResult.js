import React from 'react'
import PropTypes from 'prop-types'

export const CostCodeSearchResult = ({ costcode }) => {
  return (
    <div>
      <h4>{costcode.mitcostcode}</h4>
      {costcode.description && <p>{costcode.description}</p>}
    </div>
  )
}

CostCodeSearchResult.propTypes = {
  costcode: PropTypes.shape({
    mitcostcode: PropTypes.string,
    description: PropTypes.string
  })
}







