import React from 'react'
import PropTypes from 'prop-types'
import { COMMIT_FAIL } from '../../../../../shared/grid/constants'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'
import './Cell.scss'

export const CellRendererDefault = ({ valueFormatted, value, data, colDef }) => {
  const val = compareEmptyNullUndef(valueFormatted, value)
  const { field } = colDef

  
  const classDisabled = data.locked ? 'wopricing__col_disabled' : ''
  const classError =
    field === 'error' || (data.committed === COMMIT_FAIL && field === 'committed')
      ? 'wopricing__col_error'
      : ''

  return <div className={`${classDisabled} ${classError}`}>{val || null}</div>
}

CellRendererDefault.propTypes = {
  valueFormatted: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.shape({
    committed: PropTypes.string.isRequired,
    locked: PropTypes.bool
  }),
  colDef: PropTypes.shape({
    field: PropTypes.string.isRequired
  })
}
