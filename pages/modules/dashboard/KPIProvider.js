import React, { useReducer, useContext, createContext, useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

const KPIContext = createContext()


const initialState = {
  openKPIs: new Map([['summary', { kpiName: 'summary', label: 'Summary' }]]),
  selectedKpiName: 'summary'
}


export const SELECT_KPI = 'SELECT_KPI'
export const REMOVE_KPI = 'REMOVE_KPI'
export const REPLACE_KPI = 'REPLACE_KPI'


export const selectKpi = (kpiName, templateName, osName) => ({
  type: SELECT_KPI,
  payload: {
    kpiName,
    label: `KPI - ${kpiName}`,
    templateName,
    osName
  }
})

export const removeKpi = kpiName => ({
  type: REMOVE_KPI,
  payload: {
    kpiName
  }
})

export const replaceKpi = (oldKpiName, newKpiName, osName, templateName) => ({
  type: REPLACE_KPI,
  payload: {
    oldKpiName,
    newKpiName,
    label: `KPI - ${newKpiName}`,
    osName,
    templateName
  }
})


const resolveSelectedKpiName = state => {
  if (!state.openKPIs.size) {
    return null
  }

  if (!state.openKPIs.has(state.selectedKpiName)) {
    return _.last(Array.from(state.openKPIs.keys()))
  }

  return state.selectedKpiName
}


export const reducer = (state, action) => {
  switch (action.type) {
    case SELECT_KPI: {
      const tab = state.openKPIs.get(action.payload.kpiName)

      return {
        openKPIs: new Map([
          ...state.openKPIs,
          [
            action.payload.kpiName,
            {
              ...action.payload,
              label: tab?.label || action.payload.label
            }
          ]
        ]),
        selectedKpiName: action.payload.kpiName
      }
    }

    case REMOVE_KPI:
      state.openKPIs.delete(action.payload.kpiName)

      return {
        openKPIs: new Map(state.openKPIs),
        selectedKpiName: resolveSelectedKpiName(state)
      }

    case REPLACE_KPI:
      state.openKPIs.delete(action.payload.oldKpiName)

      return {
        openKPIs: new Map([
          ...state.openKPIs,
          [
            action.payload.newKpiName,
            {
              ...action.payload
            }
          ]
        ]),
        selectedKpiName: action.payload.newKpiName
      }
    default:
      throw new Error(`Unrecognised action type: ${action.type} `)
  }
}

export const KPIProvider = ({ children }) => {
  const [kpiGroups, setKpiGroups] = useState()
  const [{ openKPIs, selectedKpiName }, kpiDispatcher] = useReducer(reducer, initialState)

  return (
    <KPIContext.Provider
      value={{ openKPIs, selectedKpiName, kpiGroups, setKpiGroups, kpiDispatcher }}
    >
      {children}
    </KPIContext.Provider>
  )
}

KPIProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useKPIProvider = () => useContext(KPIContext)
