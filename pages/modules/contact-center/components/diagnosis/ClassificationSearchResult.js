import React from 'react'
import PropTypes from 'prop-types'

export const ClassificationSearchResult = ({ classification }) => {
  return (
    <div>
      <h5>{classification.description}</h5>
      <p>{classification.hierarchypath}</p>
    </div>
  )
}

ClassificationSearchResult.propTypes = {
  classification: PropTypes.shape({
    description: PropTypes.string,
    hierarchypath: PropTypes.string
  })
}
