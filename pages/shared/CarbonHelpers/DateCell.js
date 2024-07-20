import PropTypes from 'prop-types'
import React from 'react'
import { TableCell } from 'carbon-components-react'
import Moment from 'react-moment'

export const DateCell = ({ value, ...props }) => (
  <TableCell>
    {value && (
      <Moment format="DD-MMM-YYYY HH:mm" {...props}>
        {value}
      </Moment>
    )}
  </TableCell>
)

DateCell.propTypes = {
  value: PropTypes.string
}
