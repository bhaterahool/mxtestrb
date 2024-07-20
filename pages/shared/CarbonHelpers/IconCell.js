import PropTypes from 'prop-types'
import React from 'react'
import { TableCell } from 'carbon-components-react'

export const IconCell = ({ value, icon: Icon, handleClick, displayValue, ...props }) => {
  return (
    <TableCell>
      {value && (
        <div className="flex">
          {displayValue || value}
          <Icon onClick={handleClick(value)} className="pointer" {...props} />
        </div>
      )}
    </TableCell>
  )
}

IconCell.propTypes = {
  handleClick: PropTypes.func,
  icon: PropTypes.shape({}),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  displayValue: PropTypes.string
}
