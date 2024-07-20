import React from 'react'
import { Button } from 'carbon-components-react'
import Map16 from '@carbon/icons-react/lib/map/16'
import PropTypes from 'prop-types'

export const MapLocationButton = ({ woserviceaddress }) => {
  return (
    woserviceaddress?.latitudey &&
    woserviceaddress?.longitudex && (
      <Button
        key="openMapLocation"
        renderIcon={Map16}
        kind="tertiary"
        iconDescription="Open Map Location"
        tooltipPosition="top"
        hasIconOnly
        size="small"
        onClick={() => {
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${woserviceaddress?.latitudey},${woserviceaddress?.longitudex}`
          )
        }}
      />
    )
  )
}

MapLocationButton.propTypes = {
  woserviceaddress: PropTypes.shape({
    latitudey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitudex: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })
}
