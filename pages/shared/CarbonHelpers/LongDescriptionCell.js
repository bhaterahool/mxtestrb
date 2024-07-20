import PropTypes from 'prop-types'
import React from 'react'
import { TableCell } from 'carbon-components-react'
import { LongDescriptionModal } from '../forms/LongDescriptionModal'

export const LongDescriptionCell = ({ value, ...props }) => (
  <TableCell>{value && <LongDescriptionModal longdescription={value} {...props} />}</TableCell>
)

LongDescriptionCell.propTypes = {
  value: PropTypes.string
}
