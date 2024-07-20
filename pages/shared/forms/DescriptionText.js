import React from 'react'
import PropTypes from 'prop-types'

export const DescriptionText = ({ text }) => {
  return (
    <div className="bx--form-item bx--text-input-wrapper pel--field-description">
      <div className="bx--text-input__field-wrapper">
        <div className="bx--text-input bx--text__input pel--field-description-input">{text}</div>
      </div>
    </div>
  )
}

DescriptionText.propTypes = {
  text: PropTypes.string
}
