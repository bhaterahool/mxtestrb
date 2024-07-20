import axios from 'axios'
import _ from 'lodash'
import { useState, useEffect, useRef, useCallback } from 'react'
import { namespace } from '../../../util/namespace'
import { createEnum } from '../../../util/createEnum'
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage'

export const historyTypes = createEnum(['search', 'advancedsearch', 'sr'])

const oslcAtts = ['where', 'select', 'orderBy', 'searchTerms']

export const useSearch = (api, options) => {
  const [history, setHistory] = useLocalStorage('cp_search_history', [])
  const [response, setResponse] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [hasnext, setHasnext] = useState(false)

  const [searchParams, setSearchParams] = useState({
    objectType: 'pelsrlitecp',
    page: 1
  })

  const addHistory = useCallback(
    item => {
      setHistory(allHistory => [
        {
          
          id: allHistory.length + 1,
          ...item
        },
        ...allHistory.slice(0, options.historySize - 1)
      ])
    },
    [setHistory]
  )

  const ref = useRef()

  const doSearch = async ({ pageno, objectType, ...params }) => {
    if (!params.queryParams) return

    if (ref.current) {
      setResponse([])
      setHasnext(false)
      setLoading(false)
      ref.current.cancel()
    }

    ref.current = axios.CancelToken.source()

    try {
      setError(null)
      setLoading(true)
      const data = params.queryParams.where
      const type = data?.includes('pelsearchterms=')
        ? historyTypes.SEARCH
        : historyTypes.ADVANCEDSEARCH
      if (!params.skipSaveHistory) {
        addHistory({
          type,
          date: new Date(),
          searchParams: { pageno, objectType, ...params }
        })
      }

      if (options[objectType].useWildcard) {
        params.queryParams.searchTerms = `${params.queryParams.searchTerms}%` 
      }

      const res = await api.get(`/pelos/${objectType}`, {
        params: {
          querytemplate: options[objectType]?.searchQueryTemplate,
          savedQuery: options[objectType]?.savedQuery,
          pageno,
          ...namespace('oslc', { ...params.queryParams }, oslcAtts)
        },
        cancelToken: ref.current.token
      })

      setResponse(res?.data?.member ?? [])
      setLoading(false)
      setHasnext(!!res?.data?.responseInfo?.nextPage)
    } catch (err) {
      if (!axios.isCancel(err)) {
        setResponse([])
        setLoading(false)
        setHasnext(false)
        setError(err?.message)
      }
    }
  }

  useEffect(() => {
    doSearch(searchParams)

    return () => {
      if (ref.current) {
        ref.current.cancel()
      }
    }
  }, [searchParams]) 

  return [searchParams, setSearchParams, response, hasnext, loading, error, history, addHistory]
}
