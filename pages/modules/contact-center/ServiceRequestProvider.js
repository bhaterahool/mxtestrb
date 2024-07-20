import React, { useReducer, useContext, createContext } from 'react'
import PropTypes from 'prop-types'

const ServiceRequestContext = createContext()


const initialState = {
  serviceRequests: new Map(),
  pending: false,
  notification: null,
  maximoExceptionErrors: new Map()
}


const FETCH_PENDING = 'FETCH_PENDING'
const FETCH_SUCCESS = 'FETCH_SUCCESS'
const FETCH_FAILURE = 'FETCH_FAILURE'
const REMOVE_SERVICE_REQUEST = 'REMOVE_SERVICE_REQUEST'
const UPDATE_SERVICE_REQUEST = 'UPDATE_SERVICE_REQUEST'
const SUBMIT_SERVICE_REQUEST = 'SUBMIT_SERVICE_REQUEST'
const SUBMIT_SUCCESS = 'SUBMIT_SUCCESS'
const SUBMIT_FAILURE = 'SUBMIT_FAILURE'
const SUBMIT_MAXIMO_EXCEPTION_FAILURE = 'SUBMIT_MAXIMO_EXCEPTION_FAILURE'
const SET_ERRORS = 'SET_ERRORS'


export const fetchServiceRequest = ticketId => ({
  type: FETCH_PENDING,
  payload: {
    ticketId
  }
})

export const fetchServiceRequestSuccess = (ticketId, data) => ({
  type: FETCH_SUCCESS,
  payload: {
    ticketId,
    label: `SR - ${ticketId}`,
    data
  }
})

export const removeServiceRequest = ticketId => ({
  type: REMOVE_SERVICE_REQUEST,
  payload: {
    ticketId
  }
})

export const updateServiceRequest = (ticketId, patch) => {
  return {
    type: UPDATE_SERVICE_REQUEST,
    payload: {
      ticketId,
      patch
    }
  }
}

export const setErrors = (ticketId, errors) => {
  return {
    type: SET_ERRORS,
    payload: {
      ticketId,
      errors
    }
  }
}

export const submitFailure = () => ({
  type: SUBMIT_FAILURE
})

export const submitMaximoExceptionFailure = ({ ticketId, error }) => ({
  type: SUBMIT_MAXIMO_EXCEPTION_FAILURE,
  payload: {
    ticketId,
    error
  }
})


export const updateByTicketId = (state, ticketId, patch) => {
  const serviceRequest = state.serviceRequests.get(ticketId)

  return state.serviceRequests.set(ticketId, {
    ...serviceRequest,
    ...patch
  })
}

export const submitServiceRequest = () => ({
  type: SUBMIT_SERVICE_REQUEST
})

export const submitSuccess = () => ({
  type: SUBMIT_SUCCESS
})


export const getServiceRequest = (ticketId, state) => state.get(ticketId)


export const reducer = (state, action) => {
  switch (action.type) {
    case FETCH_PENDING:
      return {
        ...state,
        pending: true
      }

    case FETCH_SUCCESS:
      return {
        ...state,
        serviceRequests: new Map([
          ...state.serviceRequests,
          [action.payload.ticketId, action.payload.data]
        ]),
        pending: false
      }

    case FETCH_FAILURE:
      return {
        ...state,
        pending: false
      }

    case UPDATE_SERVICE_REQUEST:
      updateByTicketId(state, action.payload.ticketId, action.payload.patch)

      return {
        ...state,
        serviceRequests: new Map(state.serviceRequests)
      }

    case SUBMIT_SERVICE_REQUEST:
      return {
        ...state,
        pending: true
      }

    case SUBMIT_SUCCESS:
      return {
        ...state,
        pending: false
      }

    case SUBMIT_FAILURE:
      return {
        ...state,
        pending: false
      }

    case SUBMIT_MAXIMO_EXCEPTION_FAILURE:
      let maximoExceptionErrors = new Map()

      if (state?.maximoExceptionErrors) {
        maximoExceptionErrors = state?.maximoExceptionErrors
      }

      return {
        ...state,
        maximoExceptionErrors: new Map([
          ...maximoExceptionErrors,
          [
            action.payload.ticketId,
            {
              error: action.payload.error
            }
          ]
        ])
      }

    case REMOVE_SERVICE_REQUEST:
      state.serviceRequests.delete(action.payload.ticketId)

      return {
        ...state,
        serviceRequests: new Map(state.serviceRequests)
      }

    case SET_ERRORS:
      updateByTicketId(state, action.payload.ticketId, {
        errors: action.payload.errors
      })

      return {
        ...state,
        serviceRequests: new Map(state.serviceRequests)
      }

    default:
      throw new Error(`Unrecognised action type: ${action.type} `)
  }
}

export const ServiceRequestProvider = ({ children }) => (
  <ServiceRequestContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </ServiceRequestContext.Provider>
)

ServiceRequestProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useServiceRequestProvider = () => useContext(ServiceRequestContext)
