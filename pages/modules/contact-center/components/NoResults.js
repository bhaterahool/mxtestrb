import React from 'react'
import PropTypes from 'prop-types'

export const NoResults = ({ heading, description }) => (
  <div className="pel--container">
    <div className="pel--centered">
      <h4>{heading}</h4>
      <p> {description}</p>
    </div>
  </div>
)

NoResults.propTypes = {
  description: PropTypes.string,
  heading: PropTypes.string
}
