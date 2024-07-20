import React from 'react'
import PropTypes from 'prop-types'
import { Toggle } from 'carbon-components-react'

export const Yorn = ({
  assetattribute,
  assetattrid,
  classspecid,
  handleAttribute,
  type,
  yes,
  no,
  value
}) => {
  const handleChange = on => {
    const value = on ? yes : no

    handleAttribute(assetattrid, classspecid, value, type)
  }

  let toggled = value === yes ? true : undefined

  return (
    <div className="yorn-toggle">
      <Toggle
        labelText={assetattribute[0].description}
        labelA="No"
        labelB="Yes"
        onToggle={handleChange}
        toggled={toggled}
      />
    </div>
  )
}

Yorn.propTypes = {
  assetattrid: PropTypes.string,
  assetattribute: PropTypes.string,
  handleAttribute: PropTypes.func.isRequired,
  type: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
  yes: PropTypes.string,
  no: PropTypes.string
}
