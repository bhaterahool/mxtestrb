import React from 'react'
import PropTypes from 'prop-types'

export const LocationSearchResult = ({ location }) => (
  <>
    <h4>{location.description}</h4>
    {location.location && <p>{location.location}</p>}
    {location.pluspcustomer && <p>{location.pluspcustomer}</p>}
    {location?.serviceaddress && (
      <>
        <p>{location?.serviceaddress?.streetaddress}</p>
        <p>{location?.serviceaddress?.postalcode}</p>
      </>
    )}
  </>
)

LocationSearchResult.propTypes = {
  location: PropTypes.shape({
    description: PropTypes.string,
    location: PropTypes.string,
    pluspcustomer: PropTypes.string
  })
}
