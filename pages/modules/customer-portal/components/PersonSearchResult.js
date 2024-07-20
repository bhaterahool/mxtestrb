import React from 'react'
import PropTypes from 'prop-types'

export const PersonSearchResult = ({ person }) => {
  return (
    <div>
      <h4>{person.displayname}</h4>
      {person.primaryemail && <p>{person.primaryemail}</p>}
      {person.primaryphone && <p>{person.primaryphone}</p>}
    </div>
  )
}

PersonSearchResult.propTypes = {
  person: PropTypes.shape({
    displayname: PropTypes.string,
    primaryemail: PropTypes.string,
    primaryphone: PropTypes.string
  })
}
