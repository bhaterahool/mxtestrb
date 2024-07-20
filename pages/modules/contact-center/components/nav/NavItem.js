import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Renew16 } from '@carbon/icons-react'
import { CloseButton } from './CloseButton'

export const NavItem = ({
  ticketId,
  label,
  selectedTicketId,
  onTicketSelected,
  onTicketRemoved,
  key,
  handleSummaryRefresh
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
    'pel--sr-tabs-item--active': ticketId === selectedTicketId,
    'pel--is-edited': localStorage.getItem('editedSR')
      ? JSON.parse(localStorage.getItem('editedSR'))?.includes(ticketId)
      : false
  })

  return (
    <li className={className} key={key}>
      <a href="#" onClick={onClick} className="pel--sr-tabs-link">
        {label}
      </a>
      {ticketId === 'summary' && (
        <button type="button" className="pel--button" onClick={() => handleSummaryRefresh(true)}>
          <Renew16 aria-label="Refresh" className="pel--icon pel--icon--white" />
        </button>
      )}
      {ticketId !== 'summary' && <CloseButton onClick={onClose} />}
    </li>
  )
}

NavItem.propTypes = {
  key: PropTypes.string.isRequired,
  ticketId: PropTypes.string.isRequired,
  selectedTicketId: PropTypes.string.isRequired,
  onTicketSelected: PropTypes.func.isRequired,
  onTicketRemoved: PropTypes.func.isRequired,
  label: PropTypes.string,
  handleSummaryRefresh: PropTypes.func
}
