import React, { useState, createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import { useSearch } from './useSearch'
import { api } from '../../app/api'
import config from '../../app/config'

const SearchContext = createContext()

export { historyTypes } from './useSearch'

export const SearchProvider = ({ children }) => {
  const [
    searchParams,
    setSearchParams,
    response,
    hasnext,
    loading,
    error,
    history,
    addHistory
  ] = useSearch(api, config.search)

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        setSearchParams,
        response,
        hasnext,
        loading,
        config,
        error,
        history,
        addHistory
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

SearchProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useServiceRequestSearchProvider = () => useContext(SearchContext)
