import axios from 'axios'
import _ from 'lodash'
import { useState, useEffect, useRef, useCallback } from 'react'
import { namespace } from '../../../util/namespace'
import { createEnum } from '../../../util/createEnum'
import { getProcessedQuery } from '../../../util/createQuery'
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage'

export const historyTypes = createEnum(['search', 'advancedsearch', 'sr'])

const oslcAtts = ['where', 'select', 'orderBy', 'searchTerms']

export const useSearch = (api, options) => {
  const [history, setHistory] = useLocalStorage('cc_search_history', [])
  const [response, setResponse] = useState([])
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [hasnext, setHasnext] = useState(false)

  const [searchParams, setSearchParams] = useState({
    objectType: 'pelsrlite',
    page: 1
  })

  const doFormSearch = useCallback(
    _.debounce((sr, search) => {
      if (!sr?.ticketid || sr?.ticketid?.startsWith('new')) {
        const fields = _.pick(sr, ['location', 'pellocbuilding', 'classstructureid'])
        const pluspcustomer = sr.pluspcustomer?.[0]?.customer ?? ''
        const query = sr?.origrecordid
          ? `relatedticket.RELATEDRECKEY="${sr?.origrecordid}" and ${getProcessedQuery({
              ...fields,
              pluspcustomer,
              ...search
            })}`
          : getProcessedQuery({ ...fields, pluspcustomer, ...search })

        if (query) {
          setSearchParams(params => ({
            ...params,
            queryParams: {
              where: query
            },
            skipSaveHistory: true
          }))
        }
      }
    }, 1000)
  )

  const addHistory = useCallback(
    item => {
      setHistory(allHistory => [
        {
          // eslint-disable-next-line no-plusplus
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
      setShowAddPopup(false)
      if (params.queryParams?.and) {
        params.queryParams.where = `${params.queryParams.where} and ${params.queryParams.and}`
        delete params.queryParams.and
      }
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

      if (options[objectType].useWildcard && params.queryParams.searchTerms) {
        params.queryParams.searchTerms = `%${params.queryParams.searchTerms}%` // eslint-disable-line no-param-reassign
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
      if (objectType === 'pelperson') {
        if (res && res.data && res.data.member.length === 0) {
          setShowAddPopup(true)
        } else {
          setShowAddPopup(false)
        }
      }
      
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

  return [
    searchParams,
    setSearchParams,
    response,
    hasnext,
    loading,
    error,
    history,
    addHistory,
    doFormSearch,
    showAddPopup
  ]
}
