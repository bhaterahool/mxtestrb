import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { reducer, actions } from './reducer'

const AfpContext = createContext(null)

const AfpProvider = ({ children }) => {
  const [afpState, dispatch] = useReducer(reducer, new Map())

  const addAfp = payload => dispatch(actions.addAfp(payload))

  const removeAfp = id => dispatch(actions.removeAfp(id))

  const updateAfpData = payload => dispatch(actions.updateAfpData(payload))

  const setAfpMetadata = payload => dispatch(actions.setAfpStatus(payload))

  return (
    <AfpContext.Provider
      value={{ afps: afpState, addAfp, removeAfp, updateAfpData, setAfpMetadata }}
    >
      {children}
    </AfpContext.Provider>
  )
}

const useAfpCtx = () => {
  const afpCtx = useContext(AfpContext)
  if (afpCtx == null) {
    throw new Error('useAfpCtx() called outside of a AfpProvider?') 
  }
  return afpCtx
}

export { AfpProvider, useAfpCtx }
