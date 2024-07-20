import React, { useCallback, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  SearchBasic,
  SearchPagination,
  SearchResults
} from '../../../shared-components'
import { SubconSearchAdvanced } from './SubconAdvancedSearch'
import { createEnum } from '../../../../util/createEnum'
import { useRegistry } from '../../../../shared/RegistryProvider'


import { useSubcontractSearchProvider, historyTypes } from '../SubcontractSearchProvider'


import { WorkAssignmentSearchResultItem } from './WorkAssignmentSearchResultItem'
import { useSession } from '../../../auth/SessionProvider'

import * as state from '../../state'
import * as actions from '../../state/actions'

const searchModes = createEnum(['simple', 'advanced'])

export const SubcontractSearch = () => {
  const [searchMode, setSearchMode] = useState(
    searchModes.SIMPLE
  )
  
  const [searchtext, setSearchtext] = useState()
  const [session] = useSession()
  const {
    searchParams,
    setSearchParams,
    response,
    loading,
    config,
    error,
    addHistory
  } = useSubcontractSearchProvider()

  const [{
    pelassignmentQueries
  }] = useRegistry()

  const { dispatch } = state.store

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
  }, pelassignmentQueries)


  
  const onResultSelected = result => {
    
    
    
    
    
    

    dispatch(actions.selectSearchResult(result))

    

    
  }

  const onSearchSubmit = useCallback(() => {

    const currentFilter =  JSON.parse(localStorage.getItem('searchFilterConfig'))

    const queryParams = {
      ...searchParams?.queryParams,
      savedQuery: currentFilter?.clausename,
      ...(!searchtext && {
        where: `pelsearchterms="${getSuffix(currentFilter ? currentFilter?.clausename : 'DEFAULT', true)}"`
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
      debSearchParams(() => ({
        ...searchParams,
        searchTerms,
        queryParams: {
          where: `pelsearchterms="${searchTerms} ${getSuffix(currentFilter ? currentFilter?.clausename : 'DEFAULT')}"`,
          savedQuery: currentFilter?.clausename || 'DEFAULT'
        }
      }))
    },
    [searchParams.queryParams]
  )

  useEffect(() => {
    if (session?.sessionId && session?.personid !== 'MAXADMIN') {
      const term = {
        objectType: "pelassignment",
        page: 1
      }
      const searchText = ''

      debSearchParams(() => ({
        ...term,
        searchText,
        queryParams: {
          savedQuery: 'DEFAULT',
          where: `pelsearchterms="${getSuffix('DEFAULT', true)}"`,
        }
      }))
    }
   }, [session.sessionId])

  
  const onAdvancedTermsChange = useCallback((queryParams) => {
    setSearchParams(params => ({ ...params, queryParams }))
  }, [searchParams.queryParams])

  
  const onSearchModeChange = mode => e => {
    e.preventDefault()
    const { queryParams, ...cleanedParams } = searchParams
    setSearchParams(cleanedParams)
    setSearchMode(mode)
  }

  
  const onPageChange = page =>
    setSearchParams(params => ({ ...params, page }))

  const hasNextPage = false 


  const onResetForm = () => {
    searchParams.queryParams.savedQuery = ''
    setSearchParams(params => ({ ...params, queryParams: '' }))
  }

  return (
    <>
      {searchMode === searchModes.SIMPLE && (
        <div className="pel--search-container">
          <SearchBasic
            onChange={onTermsChange}
            onFilterSelect={onSearchSubmit}
            filters={pelassignmentQueries}
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
          <SubconSearchAdvanced onSubmit={onAdvancedTermsChange}  onReset={onResetForm}/>          
        </div>
      )}

      {searchParams.queryParams && (
        <>
          <SearchResults
            results={response}
            renderItem={WorkAssignmentSearchResultItem}
            isPaginated={hasNextPage}
            onResultSelected={onResultSelected}
            loading={loading}
            error={error}
          />
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

SubcontractSearch.propTypes = {
  options: PropTypes.shape({
    minSearchLength: PropTypes.number,
    resultPageSize: PropTypes.number
  })
}
