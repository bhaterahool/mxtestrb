import React from 'react'
import PropTypes from 'prop-types'

export const GuidanceNotes = ({ guidance }) => {
  if (!guidance.length) return null

  return (
    <div className="guidance-notes">
      <h4>Guidance Notes</h4>
      {guidance.map(note => (
        <p key={note}>{note}</p>
      ))}
    </div>
  )
}

GuidanceNotes.propTypes = {
  guidance: PropTypes.arrayOf(PropTypes.string)
}
