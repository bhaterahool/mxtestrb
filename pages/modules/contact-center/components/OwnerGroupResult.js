import React from 'react'
import PropTypes from 'prop-types'

export const OwnerGroupResult = ({ ownergroup }) => {
  return (
    <div>
      <h4>{ownergroup?.persongroup}</h4>
      {ownergroup?.description && <p>{ownergroup?.description}</p>}
    </div>
  )
}

OwnerGroupResult.propTypes = {
  ownergroup: PropTypes.shape({
    persongroup: PropTypes.string,
    description: PropTypes.string,
  })
}
