import React from 'react'
import PropTypes from 'prop-types'
import { Close16 } from '@carbon/icons-react'

export const CloseButton = ({ onClick }) => {
  return (
    <button type="button" className="pel--button" onClick={onClick}>
      <Close16 aria-label="Close" className="pel--icon pel--icon--white" />
    </button>
  )
}

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired
}
