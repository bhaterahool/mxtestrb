import React, { useReducer, useContext, createContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'

const TicketContext = createContext()


const initialState = {
  ticketIds: new Map(),
  selectedTicketId: null
}


export const SELECT_TICKET = 'SELECT_TICKET'
export const REMOVE_TICKET = 'REMOVE_TICKET'
export const REPLACE_TICKET = 'REPLACE_TICKET'


export const selectTicket = (ticketId, meta) => ({
  type: SELECT_TICKET,
  payload: {
    ticketId,
    label: `SR - ${ticketId}`,
    meta
  }
})

export const removeTicket = ticketId => ({
  type: REMOVE_TICKET,
  payload: {
    ticketId
  }
})

export const replaceTicket = (oldTicketId, newTicketId, meta) => ({
  type: REPLACE_TICKET,
  payload: {
    oldTicketId,
    newTicketId,
    label: `SR - ${newTicketId}`,
    meta
  }
})


const resolveSelectedTicketId = state => {
  if (!state.ticketIds.size) {
    return null
  }

  if (!state.ticketIds.has(state.selectedTicketId)) {
    return _.last(Array.from(state.ticketIds.keys()))
  }

  return state.selectedTicketId
}


export const reducer = (state, action) => {
  switch (action.type) {
    case SELECT_TICKET: {
      const tab = state.ticketIds.get(action.payload.ticketId)

      return {
        ticketIds: new Map([
          ...state.ticketIds,
          [
            action.payload.ticketId,
            {
              ticketId: action.payload.ticketId,
              label: tab?.label || action.payload.label,
              meta: action.payload.meta
            }
          ]
        ]),
        selectedTicketId: action.payload.ticketId
      }
    }

    case REMOVE_TICKET:
      state.ticketIds.delete(action.payload.ticketId)

      return {
        ticketIds: new Map(state.ticketIds),
        selectedTicketId: resolveSelectedTicketId(state)
      }

    case REPLACE_TICKET:
      state.ticketIds.delete(action.payload.oldTicketId)

      return {
        ticketIds: new Map([
          ...state.ticketIds,
          [
            action.payload.newTicketId,
            {
              ticketId: action.payload.newTicketId,
              label: action.payload.label,
              meta: action.payload.meta
            }
          ]
        ]),
        selectedTicketId: action.payload.newTicketId
      }

    default:
      throw new Error(`Unrecognised action type: ${action.type} `)
  }
}

export const TicketProvider = ({ children }) => (
  <TicketContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </TicketContext.Provider>
)

TicketProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useTicketProvider = () => useContext(TicketContext)
