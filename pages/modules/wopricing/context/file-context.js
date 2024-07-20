import React, { createContext, useContext, useReducer } from 'react'
import { initState, reducer } from './file-reducer'

const FileContext = createContext(null)

const FileProvider = ({ children }) => {
  const [fileState, dispatch] = useReducer(reducer, initState)

  return (
    <FileContext.Provider
      value={{
        fileState,
        dispatchFile: dispatch
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

const useFileCtx = () => {
  const Ctx = useContext(FileContext)
  if (Ctx == null) {
    throw new Error('Wopricing FileContext() called outside of a FileProvider?') 
  }
  return Ctx
}

export { FileProvider, useFileCtx }
