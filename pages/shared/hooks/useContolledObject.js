import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { api } from '../../modules/app/api'

export const useControlledObject = ({ useCache = false, disableCancelToken, options = {} }) => {
  const [state, setState] = useState({
    loading: false,
    data: undefined,
    error: undefined
  })

  const ref = useRef()

  const loadObject = async (objectType, queryParam, cb) => {
    ref.current = !disableCancelToken && axios.CancelToken.source()

    setState({ data: undefined, error: undefined, loading: true })

    const params = {
      querytemplate: options[objectType]?.searchQueryTemplate,
      savedQuery: options[objectType]?.savedQuery,
      'oslc.searchTerms': queryParam?.searchTerms
    }

    const axiosOptions = {
      useCache,
      params
    }

    if (!disableCancelToken) axiosOptions.cancelToken = ref.current.token

    try {
      const res = await api.get(`/pelos/${objectType}`, axiosOptions)

      if (cb) {
        cb({ data: res.data })
      }

      setState({ data: res.data, loading: false })
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: true
      }))
    }
  }

  useEffect(() => {
    return () => {
      if (ref.current) {
        ref.current.cancel()
      }
    }
  }, [])

  return {
    state,
    loadObject
  }
}
