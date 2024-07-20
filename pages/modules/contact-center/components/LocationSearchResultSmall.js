import React from 'react'
import PropTypes from 'prop-types'

export const LocationSearchResultSmall = ({ location }) => (
  <div className="search-result-small">
    <h5>{location.description}</h5>
    {location.location && <p>{location.location}</p>}
    {location.pluspcustomer && <p>{location.pluspcustomer}</p>}
    {location?.serviceaddress && (
      <>
        <p>{location?.serviceaddress?.streetaddress}</p>
        <p>{location?.serviceaddress?.postalcode}</p>
      </>
    )}
  </div>
)

LocationSearchResultSmall.propTypes = {
  location: PropTypes.shape({
    description: PropTypes.string,
    location: PropTypes.string,
    pluspcustomer: PropTypes.string,
    serviceaddress: PropTypes.shape({
      streetaddress: PropTypes.string,
      postalcode: PropTypes.string
    })
  })
}
