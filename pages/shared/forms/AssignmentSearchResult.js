import React from 'react'
import PropTypes from 'prop-types'

export const AssignmentSearchResult = ({ assignment }) => {
  return (
    <div>
      <h4>
        {assignment?.workorder?.wonum} - A{assignment?.assignmentid}
      </h4>
      {assignment?.peldescription && <p>{assignment?.peldescription}</p>}
    </div>
  )
}
AssignmentSearchResult.propTypes = {
  assignment: PropTypes.shape({
    assignmentid: PropTypes.string,
    peldescription: PropTypes.string,
    workorder: PropTypes.shape({
      wonum: PropTypes.string
    })
  })
}
