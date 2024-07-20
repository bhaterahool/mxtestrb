import React, { createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import { useSubcontractSearch } from './useSubcontractSearch'
import { api } from '../../app/api'
import config from '../../app/config'

const SubContractSearchContext = createContext()

export { historyTypes } from './useSubcontractSearch'

export const SubcontractSearchProvider = ({ children }) => {
  const [
    searchParams,
    setSearchParams,
    response,
    loading,
    error,
    history,
    addHistory,
    refresh
  ] = useSubcontractSearch(api, config.search)

  return (
    <SubContractSearchContext.Provider
      value={{
        searchParams,
        setSearchParams,
        response,
        loading,
        config,
        error,
        history,
        addHistory,
        refresh
      }}
    >
      {children}
    </SubContractSearchContext.Provider>
  )
}

SubcontractSearchProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useSubcontractSearchProvider = () => useContext(SubContractSearchContext)
