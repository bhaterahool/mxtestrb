import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Nav, NavItem, NewButton } from '../components/nav'
import { selectTicket, createTicket, removeTicket, useTicketProvider } from '../TicketProvider'
import { useServiceRequestProvider, removeServiceRequest } from '../ServiceRequestProvider'
import config from '../../app/config'

export const Navigation = ({ handleSummaryRefresh }) => {
  const [state, dispatch] = useTicketProvider()

  
  const [serviceProviderState, dispatchServiceProvider] = useServiceRequestProvider()

  
  const onTicketSelected = ticketId => dispatch(selectTicket(ticketId))

  
  const onNewServiceRequest = e => {
    e.preventDefault()

    if (state.ticketIds.size === config.maxOpenTabs) {
      
      return
    }

    dispatch(createTicket())
  }

  const onTicketRemoved = ticketId => {
    dispatchServiceProvider(removeServiceRequest(ticketId))
    dispatch(removeTicket(ticketId))
    const editedSR = localStorage.getItem('editedSR')
      ? JSON.parse(localStorage.getItem('editedSR'))
      : []
    const index = editedSR?.indexOf(ticketId)
    if (index > -1) {
      editedSR.splice(index, 1)
      localStorage.setItem('editedSR', JSON.stringify(editedSR))
    }
    localStorage.removeItem(ticketId)
  }

  const selectedTicketIds = Array.from(state.ticketIds.values())

  return (
    <Nav
      selectedTicketIds={selectedTicketIds}
      selectedTicketId={state.selectedTicketId}
      renderItem={NavItem}
      onTicketSelected={onTicketSelected}
      onTicketRemoved={onTicketRemoved}
      handleSummaryRefresh={handleSummaryRefresh}
    >
      <NewButton onClick={onNewServiceRequest} />
    </Nav>
  )
}

Navigation.propTypes = {
  handleSummaryRefresh: PropTypes.func
}
