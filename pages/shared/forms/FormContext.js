import React, { createContext, useContext } from 'react'

const FormContext = createContext()

export const FormProvider = () => {
  return (
    <FormContext.Provider value={}>
      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = () => useContext(SessionContext)