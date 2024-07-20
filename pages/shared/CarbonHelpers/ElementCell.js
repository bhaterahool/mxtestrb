import PropTypes from 'prop-types'
import React from 'react'
import { TableCell } from 'carbon-components-react'

export const ElementCell = ({ heading, cell, render, ...props }) => {
  const [rowid] = cell.id.split(':')

  const renderProps = {
    heading,
    cell,
    rowid,
    ...props
  }

  if (render !== undefined) {
    return <TableCell key={cell.id}>{render(renderProps)}</TableCell>
  }

  return <TableCell key={cell.id}>{cell.value}</TableCell>
}

ElementCell.propTypes = {
  cell: PropTypes.shape({
    id: PropTypes.shape({
      split: PropTypes.func
    }),
    value: PropTypes.any
  }),
  heading: PropTypes.string,
  render: PropTypes.func
}
