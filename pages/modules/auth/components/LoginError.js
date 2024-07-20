import React from 'react'
import PropTypes from 'prop-types'

export const FormError = ({ message }) => {
  if (!message) return null

  return <p className="bx--form-error">{message}</p>
}

FormError.propTypes = {
  message: PropTypes.string
}
