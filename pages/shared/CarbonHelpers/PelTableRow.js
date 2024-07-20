import React from 'react'
import PropTypes from 'prop-types'
import { omit } from 'lodash'
import cx from 'classnames'
import { settings } from 'carbon-components'

const { prefix } = settings

export const PelTableRow = ({ className, isSelected, render, row, ...props }) => {
  
  
  const cls = cx(className, {
    [`${prefix}--data-table--selected`]: isSelected
  })
  const cleanProps = {
    ...omit(props, ['ariaLabel', 'onExpand', 'isExpanded', 'isSelected']),
    className: cls || undefined
  }

  const renderProps = {
    rowData: row.cells.reduce(
      (acc, c) => ({
        ...acc,
        ...{ [c.info.header]: c.value }
      }),
      {}
    ),
    ...props
  }

  return <tr {...cleanProps}>{render(renderProps)}</tr>
}

PelTableRow.propTypes = {
  className: PropTypes.string,
  isSelected: PropTypes.bool,
  render: PropTypes.func,
  row: PropTypes.shape({
    cells: PropTypes.arrayOf(PropTypes.any)
  })
}
