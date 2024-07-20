import React, { useCallback, useState, useRef, useEffect } from 'react'
import _trim from 'lodash/trim'
import { ClickableTile } from 'carbon-components-react'
import { SearchResults } from '../../../shared-components'
import config from '../../../app/config'
import { useAfpCtx } from '../../context/afp-context'
import { SearchBasic } from './SearchBasic'
import { SearchResultItem } from './SearchResultItem'
import { SearchAdvanced } from './SearchAdvanced'
import { defaultSearchParams, doSearch, SEARCH_TYPE } from './search-util'
import './Search.scss'

const hasNextPage = false
const { BASIC, ADVANCED, AFP } = SEARCH_TYPE

export const Search = ({ currSearch, onSearch, searchRef }) => {
  const [searchResponse, setSearchResponse] = useState([])
  const [searchParams, setSearchParams] = useState(defaultSearchParams)
  const [searchText, setSearchText] = useState('')
  const [searchMode, setSearchMode] = useState(BASIC)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const { addAfp } = useAfpCtx()
  const ref = useRef()

  useEffect(() => {
    const { type, searchParams, skipSearch } = currSearch

    if (skipSearch) return
    if ([BASIC, AFP].includes(type)) {
      setSearchText(searchParams.queryParams.searchTerm)
      setSearchMode(BASIC)
    } else setSearchMode(type)

    setSearchParams(searchParams)
  }, [currSearch.id])

  useEffect(() => {
    doSearch({
      ref,
      searchParams,
      setSearchResponse,
      setSearchLoading,
      setSearchError
    })
    return () => {
      if (ref.current) {
        ref.current.cancel()
      }
    }
  }, [searchParams])

  const onSearchSubmit = (searchTerm, savedQuery) => {
    if (searchMode === BASIC && searchTerm && searchTerm.length < config.search.minSearchLength) {
      return
    }

    const searchParamsOpts = {
      ...searchParams,
      queryParams: {
        ...searchParams.queryParams,
        savedQuery,
        searchTerm: `*${searchTerm}*`
      }
    }

    setSearchParams(searchParamsOpts)
  }

  const setHistory = (type, queryParams, data) =>
    onSearch({ type, searchParams: { queryParams }, data, skipSearch: true })

  const onTermsChange = (searchTerm, savedQuery) => {
    const value = _trim(searchTerm)
    setSearchResponse([])
    setSearchText(value)
    onSearchSubmit(value, savedQuery)
    setHistory(BASIC, { searchTerm, savedQuery })
  }

  const onResultSelected = payload => {
    addAfp(payload)
    setHistory(AFP, { searchTerm: payload.afpnum }, payload)
  }

  const searchAgain = () => {
    setSearchParams(params => {
      return {
        ...params,
        queryParams: searchParams.queryParams
      }
    })
  }

  const toggleSearchMode = e => {
    e.preventDefault()
    const { queryParams, ...cleanedParams } = searchParams
    const mode = searchMode === BASIC ? ADVANCED : BASIC

    setSearchParams(cleanedParams)
    setSearchText('')
    setSearchMode(mode)
  }

  const queryParams = searchParams.queryParams || null

  return (
    <div className="afp-search">
      <div className="pel--search-container">
        {searchMode === BASIC ? (
          <>
            <SearchBasic searchTerm={searchText} onChange={onTermsChange} searchRef={searchRef} />
            <div className="pel--search-type">
              <a href="#" onClick={toggleSearchMode}>
                Advanced Search
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="pel--search-type">
              <a href="#" onClick={toggleSearchMode}>
                Basic Search
              </a>
            </div>
            <SearchAdvanced
              defaultValues={currSearch.type === ADVANCED && currSearch?.data}
              onSubmit={(queryParams, inputFields) => {
                setSearchParams(params => ({ ...params, queryParams }))
                setHistory(ADVANCED, queryParams, inputFields)
              }}
              onReset={() => setSearchParams(params => ({ ...params, queryParams: {} }))}
            />
          </>
        )}
      </div>

      <div className="afp-search__results">
        {queryParams || searchResponse?.length > 0 ? (
          <SearchResults
            results={searchResponse}
            renderItem={SearchResultItem}
            isPaginated={hasNextPage}
            onResultSelected={onResultSelected}
            loading={searchLoading}
            error={searchError}
          />
        ) : null}

        {!searchError &&
          !searchLoading &&
          searchResponse.length === 0 &&
          searchParams?.queryParams &&
          searchParams?.queryParams?.savedQuery !== '' && (
            <>
              <div className="pel--search-no-result">
                <ClickableTile handleClick={searchAgain}>
                  Click here to search again without the current filter
                </ClickableTile>
              </div>
            </>
          )}
      </div>
    </div>
  )
}
