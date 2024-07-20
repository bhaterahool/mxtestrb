import React from 'react'
import PropTypes from 'prop-types'

export const Remarks = ({ text }) => {
  if (!text) return null

  return (
    <div className="bx--tooltip bx--tooltip--shown pel--formtooltip" role="tooltip">
      {text}
    </div>
  )
}

Remarks.propTypes = {
  text: PropTypes.string
}
