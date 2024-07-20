import React from 'react'
import PropTypes from 'prop-types'

export const ServiceAddress = ({ serviceaddress }) => {
  return (
    <div>
      {serviceaddress.streetaddress && <h6>{serviceaddress.streetaddress}</h6>}
      {serviceaddress.addressline2 && <p>{serviceaddress.addressline2}</p>}
      {serviceaddress.postalcode && <p>{serviceaddress.postalcode}</p>}
    </div>
  )
}

ServiceAddress.propTypes = {
  serviceaddress: PropTypes.shape({
    addressline2: PropTypes.string,
    postalcode: PropTypes.string,
    streetaddress: PropTypes.string
  })
}
