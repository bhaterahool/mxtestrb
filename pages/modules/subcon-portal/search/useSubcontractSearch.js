import axios from 'axios'
import { useState, useEffect, useRef, useCallback } from 'react'
import { namespace } from '../../../util/namespace'
import { createEnum } from '../../../util/createEnum'

import Config from '../../app/config'
import { useMaxProp } from '../../../shared/hooks/useMaxProp'


export const historyTypes = createEnum(['search', 'advancedsearch'])

const oslcAtts = ['where', 'select', 'orderBy', 'searchTerms', 'pageSize']

let id = 1

export const useSubcontractSearch = (api, options) => {
  const [history, setHistory] = useState([])
  const [response, setResponse] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const pageSizeProp = useMaxProp('pel.mxplus.subcon.pageSize')

  const [searchParams, setSearchParams] = useState({
    objectType: 'pelassignment',
    page: 1
  })

  const addHistory = useCallback(
    item => {
      setHistory(allHistory => [
        {
          
          id: id++,
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

      
      params.queryParams = {
        ...params.queryParams,
        select: Config.search.pelassignmentsearch.fields
      }

      const res = await api.get(`/pelos/${objectType}`, {
        params: {
          savedQuery: options[objectType]?.savedQuery,
          pageno,
          ...namespace(
            'oslc',
            {
              ...params.queryParams,
              orderBy: '-assignmentid',
              pageSize: pageSizeProp?.maxpropvalue?.propvalue || 50
            },
            oslcAtts
          )
        },
        cancelToken: ref.current.token
      })

      setResponse(res?.data?.member ?? [])
      setLoading(false)
    } catch (err) {
      if (!axios.isCancel(err)) {
        setResponse([])
        setLoading(false)
        setError(err?.message)
      }
    }
  }

  const refresh = () => doSearch(searchParams)

  useEffect(() => {
    doSearch(searchParams)

    return () => {
      if (ref.current) {
        ref.current.cancel()
      }
    }
  }, [searchParams]) 

  return [searchParams, setSearchParams, response, loading, error, history, addHistory, refresh]
}
