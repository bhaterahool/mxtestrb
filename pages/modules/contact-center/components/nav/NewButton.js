import React from 'react'
import PropTypes from 'prop-types'

export const NewButton = ({ onClick }) => {
  return (
    <li className="pel--sr-tabs-item">
      <a href="#" onClick={onClick} className="pel--sr-tabs-link new">
        + New SR
      </a>
    </li>
  )
}

NewButton.propTypes = {
  onClick: PropTypes.func.isRequired
}