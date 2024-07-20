import React from 'react'
import PropTypes from 'prop-types'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'
import './Cell.scss'

export const CellRendererCheck = ({ valueFormatted, value, data }) => {
  const val = compareEmptyNullUndef(valueFormatted, value)

  const defaultChecked = Boolean(val)
  
  
  
  return (
    <input
      className="afpbulk__checkbox"
      type="checkbox"
      checked={defaultChecked}
      readOnly
      disabled={data.locked}
    />
  )
}

CellRendererCheck.propTypes = {
  valueFormatted: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.shape({
    committed: PropTypes.string.isRequired,
    locked: PropTypes.string.isRequired,
    edited: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  colDef: PropTypes.shape({
    field: PropTypes.string.isRequired
  })
}
