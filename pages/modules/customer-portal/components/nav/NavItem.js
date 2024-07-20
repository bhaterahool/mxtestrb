import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { CloseButton } from './CloseButton'

export const NavItem = ({
  ticketId,
  label,
  selectedTicketId,
  onTicketSelected,
  onTicketRemoved,
  key
}) => {
  const onClick = e => {
    e.preventDefault()

    return onTicketSelected(ticketId)
  }

  const onClose = e => {
    e.preventDefault()

    return onTicketRemoved(ticketId)
  }

  const className = classnames({
    'pel--sr-tabs-item': true,
    'pel--sr-tabs-item--active': ticketId === selectedTicketId
  })

  return (
    <li className={className} key={key}>
      <a href="#" onClick={onClick} className="pel--sr-tabs-link">
        {label}
      </a>
      <CloseButton onClick={onClose} />
    </li>
  )
}

NavItem.propTypes = {
  key: PropTypes.string.isRequired,
  ticketId: PropTypes.string.isRequired,
  selectedTicketId: PropTypes.string.isRequired,
  onTicketSelected: PropTypes.func.isRequired,
  onTicketRemoved: PropTypes.func.isRequired
}
