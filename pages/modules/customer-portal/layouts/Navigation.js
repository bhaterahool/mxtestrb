import React from 'react'
import _ from 'lodash'
import { Nav, NavItem } from '../components/nav'
import { selectTicket, removeTicket, useTicketProvider } from '../TicketProvider'
import { useServiceRequestProvider, removeServiceRequest } from '../ServiceRequestProvider'

export const Navigation = () => {
  const [state, dispatch] = useTicketProvider()

  
  const [serviceProviderState, dispatchServiceProvider] = useServiceRequestProvider()

  
  const onTicketSelected = ticketId => dispatch(selectTicket(ticketId))

  const onTicketRemoved = ticketId => {
    dispatchServiceProvider(removeServiceRequest(ticketId))
    dispatch(removeTicket(ticketId))
  }

  const selectedTicketIds = Array.from(state.ticketIds.values())

  return (
    <Nav
      selectedTicketIds={selectedTicketIds}
      selectedTicketId={state.selectedTicketId}
      renderItem={NavItem}
      onTicketSelected={onTicketSelected}
      onTicketRemoved={onTicketRemoved}
    />
  )
}
