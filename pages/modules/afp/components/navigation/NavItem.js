import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { CloseButton } from './CloseButton'

export const NavItem = ({ item, selectedItem, handleClose, handleSelect }) => {
  const className = cx({
    'pel--sr-tabs-item': true,
    'pel--sr-tabs-item--active': item.assignmentid === selectedItem.assignmentid
  })

  const handleClick = item => e => {
    e.preventDefault()

    return handleSelect(item)
  }

  return (
    <li className={className}>
      <a href="#" className="pel--sr-tabs-link" onClick={handleClick(item)}>
        {item.workorder?.wonum} - {item.assignmentid}
      </a>
      <CloseButton onClick={() => handleClose(item)} />
    </li>
  )
}

NavItem.propTypes = {
  item: PropTypes.shape({
    assignmentid: PropTypes.number,
    workorder: PropTypes.shape({
      wonum: PropTypes.string
    })
  }).isRequired,
  selectedItem: PropTypes.number,
  handleClose: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired
}
