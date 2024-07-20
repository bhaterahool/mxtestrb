import React, { useReducer, useContext, createContext } from 'react'
import PropTypes from 'prop-types'

const OsResultsContext = createContext()


const initialState = {
  osResults: new Map(),
  pending: false,
  notification: null
}


export const ADD_OSRESULT = 'ADD_OSRESULT'
export const REMOVE_OSRESULT = 'REMOVE_OSRESULT'
export const REPLACE_OSRESULT = 'REPLACE_OSRESULT'


export const addOsResult = (kpiName, osResults, columnDefs, jsonSchema) => ({
  type: ADD_OSRESULT,
  payload: {
    kpiName,
    osResults,
    columnDefs,
    jsonSchema
  }
})

export const removeOsResult = kpiName => ({
  type: REMOVE_OSRESULT,
  payload: {
    kpiName
  }
})

export const replaceOsResult = (kpiName, osResults, columnDefs, jsonSchema) => ({
  type: REPLACE_OSRESULT,
  payload: {
    kpiName,
    osResults,
    columnDefs,
    jsonSchema
  }
})


export const getOsResultsByKpiName = (kpiName, state) => state.get(kpiName)


export const reducer = (state, action) => {
  switch (action.type) {
    case ADD_OSRESULT:
      return {
        ...state,
        osResults: new Map([
          ...state.osResults,
          [
            action.payload.kpiName,
            {
              data: action.payload.osResults,
              columnDefs: action.payload.columnDefs,
              jsonSchema: action.payload.jsonSchema
            }
          ]
        ])
      }
    case REMOVE_OSRESULT:
      state.osResults.delete(action.payload.kpiName)

      return {
        ...state,
        osResults: new Map(state.osResults)
      }

    case REPLACE_OSRESULT:
      state.osResults.delete(action.payload.kpiName)

      return {
        ...state,
        osResults: new Map([
          ...state.osResults,
          [
            action.payload.kpiName,
            {
              data: action.payload.osResults,
              columnDefs: action.payload.columnDefs,
              jsonSchema: action.payload.jsonSchema
            }
          ]
        ])
      }
    default:
      throw new Error(`Unrecognised action type: ${action.type}`)
  }
}

export const OsResultsProvider = ({ children }) => (
  <OsResultsContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </OsResultsContext.Provider>
)

OsResultsProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useOsResultsProvider = () => useContext(OsResultsContext)
