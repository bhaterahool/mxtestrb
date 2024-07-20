import React, { useCallback, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { ClickableTile } from 'carbon-components-react'
import {
  SearchAdvanced,
  SearchResults,
  SearchResultItem
} from '../components'
import { SearchBasic, SearchPagination } from '../../../shared-components'
import { selectTicket, useTicketProvider } from '../../TicketProvider'
import { createEnum } from '../../../../util/createEnum'
import { validateTicketId } from '../../../../util/regexValidator'
import { useServiceRequestSearchProvider, historyTypes } from '../SearchProvider'
import { useRegistry } from '../../../../shared/RegistryProvider'
import { useSession } from '../../../auth/SessionProvider'

const searchModes = createEnum(['simple', 'advanced'])

export const Search = () => {
  const [searchMode, setSearchMode] = useState(searchModes.SIMPLE)
  const [state, dispatch] = useTicketProvider()
  const [searchtext, setSearchtext] = useState()
  const {
    searchParams,
    setSearchParams,
    response,
    loading,
    config,
    error,
    addHistory
  } = useServiceRequestSearchProvider()

  const [{
    pelsrliteCpQueries
  }] = useRegistry()

  const [session] = useSession()

  const debSearchParams = _.debounce(setSearchParams, 500)

  
  const getSuffix = _.partial((queries, clausename, noSearchTerms) => {
    const query = queries?.find(query => clausename === query.clausename)

    if (!query) {
      throw new Error(`could not find suffix for ${clausename}`)
    }

    if(noSearchTerms && query.peltssuffix.startsWith('AND')){
      return query.peltssuffix.substring(4);
    }

    return query.peltssuffix
  }, pelsrliteCpQueries)


  
  const onResultSelected = ({ ticketid, ...data }) => {
    if (state.ticketIds.size === config.maxOpenTabs) {
      
      return
    }

    addHistory({
      type: historyTypes.SR,
      date: new Date(),
      sr: { ticketid, ...data }
    })

    return dispatch(selectTicket(ticketid, data))
  }

  const onSearchSubmit = useCallback(() => {

    const currentFilter =  JSON.parse(localStorage.getItem('searchFilterConfig'))
    const isValidTicketid = validateTicketId(searchtext)
    const queryParams = {
      ...searchParams?.queryParams,
      savedQuery: isValidTicketid ? null : currentFilter?.clausename,
      ...(!searchtext && {
        where: isValidTicketid
        ? `ticketid="${searchTerms}"` : `pelsearchterms="${getSuffix(currentFilter ? currentFilter?.clausename : 'DEFAULT', true)}"`
      })
    }

    setSearchParams(params => ({ ...params, queryParams, skipSaveHistory: !searchtext  }))
  }, [searchParams.queryParams])

  
  const onTermsChange = useCallback(
    e => {
      const {
        target: { value }
      } = e

      const searchTerms = _.trim(value)
      setSearchtext(searchTerms)
      if(searchTerms?.length === 0){
        delete searchParams.queryParams
        onSearchSubmit()
      }
      if (!searchTerms || searchTerms.length < config.search.minSearchLength) return
      const currentFilter =  JSON.parse(localStorage.getItem('searchFilterConfig'))
      const isValidTicketid = validateTicketId(searchTerms)
      const searchData = isValidTicketid
        ? `ticketid="${searchTerms}"`
        : `pelsearchterms="${searchTerms} ${getSuffix(
            currentFilter ? currentFilter.clausename : 'DEFAULT'
          )}"`
      debSearchParams(() => ({
        ...searchParams,
        searchTerms,
        queryParams: {
          where: searchData,
          savedQuery: isValidTicketid ? null : currentFilter?.clausename || 'DEFAULT'
        }
      }))
    },
    [searchParams.queryParams]
  )

  const onResetForm = () => {
    if(searchParams.queryParams && searchParams.queryParams.savedQuery) {
      searchParams.queryParams.savedQuery = ''
    }
    setSearchParams(params => ({ ...params, queryParams: '' }))
  }

  useEffect(() => {
    if (session?.sessionId && session?.personid !== 'MAXADMIN') {
      const term = {
        objectType: "pelsrlitecp",
        page: 1
      }
      const searchText = ''

      debSearchParams(() => ({
        ...term,
        searchText,
        queryParams: {
          savedQuery: 'DEFAULT'
        }
      }))
    }
   }, [session.sessionId])
   
  
  const onAdvancedTermsChange = useCallback((queryParams) => {
    setSearchParams(params => ({ ...params, queryParams }))
  }, [searchParams.queryParams])


  
  const onPageChange = page => setSearchParams(params => ({ ...params, page }))

  
  const onSearchModeChange = mode => e => {
    e.preventDefault()
    const { queryParams, ...cleanedParams } = searchParams
    setSearchParams(cleanedParams)
    setSearchMode(mode)
  }

  
  const searchAgainIncludingClosedSR = () => {
    searchParams.queryParams.savedQuery = '';
    // searchParams.queryParams.select = '*';
    setSearchParams(params => ({ ...params, queryParams: searchParams.queryParams }))
  }

  // const responseInfo = _.get(response, 'responseInfo')
  const hasNextPage = false 

  return (
    <>
      {searchMode === searchModes.SIMPLE && (
        <div className="pel--search-container">
          <SearchBasic
            onChange={onTermsChange}
            onFilterSelect={onSearchSubmit}
            filters={pelsrliteCpQueries}
          />
          <div className="pel--search-type">
            <a href="#" onClick={onSearchModeChange(searchModes.ADVANCED)}>
              Advanced Search
            </a>
          </div>
        </div>
      )}

      {searchMode === searchModes.ADVANCED && (
        <div className="pel--search-container">
           <div className="pel--search-type">
            <a href="#" onClick={onSearchModeChange(searchModes.SIMPLE)}>
              Basic Search
            </a>
          </div>
          <SearchAdvanced onSubmit={onAdvancedTermsChange} onReset={onResetForm} />         
        </div>
      )}

      {(searchParams.queryParams) && (
        <>
          <SearchResults
            results={response}
            renderItem={SearchResultItem}
            isPaginated={hasNextPage}
            onResultSelected={onResultSelected}
            loading={loading}
            error={error}
          />
        </>
      )}

      {!error && !loading && response.length === 0 && searchParams.queryParams && searchParams.queryParams.savedQuery !== '' && (
        <>
          <div className="pel--search-no-result">
            <ClickableTile handleClick={searchAgainIncludingClosedSR}>Click here to search again without the current filter</ClickableTile>
          </div>
        </>
      )}

      {hasNextPage && (
        <SearchPagination
          onChange={onPageChange}
          page={searchParams.page}
          hasNextPage={hasNextPage}
        />
      )}
    </>
  )
}

Search.propTypes = {
  options: PropTypes.shape({
    minSearchLength: PropTypes.number,
    resultPageSize: PropTypes.number,    
  })
}
