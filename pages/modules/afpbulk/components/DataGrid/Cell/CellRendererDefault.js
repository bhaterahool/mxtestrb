import React from 'react'
import PropTypes from 'prop-types'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'
import { getRenderClass } from './valueFormatters'
import './Cell.scss'

export const CellRendererDefault = ({ valueFormatted, value, data, colDef }) => {
  const val = compareEmptyNullUndef(valueFormatted, value)
  const strClass = getRenderClass({ data, colDef })
  return <div className={strClass}>{val || null}</div>
}

CellRendererDefault.propTypes = {
  valueFormatted: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.shape({
    committed: PropTypes.bool,
    locked: PropTypes.bool,
    edited: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  colDef: PropTypes.shape({
    field: PropTypes.string.isRequired
  })
}
