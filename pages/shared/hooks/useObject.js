import { useEffect, useState, useRef } from 'react'
import axios from 'axios'


export const useObject = (api, objectType, query, useCache, refresh, disableCancelToken) => {
  const [state, setState] = useState({
    loading: true,
    data: undefined,
    error: undefined
  })

  const ref = useRef()

  const loadObject = async (objType, qry) => {
    ref.current = !disableCancelToken && axios.CancelToken.source()

    setState({ data: undefined, error: undefined, loading: true })

    const axiosOptions = { useCache: useCache ?? false }

    if (!disableCancelToken) axiosOptions.cancelToken = ref.current.token

    try {
      const res = await api.get(`/pelos/${objType}?${qry}`, axiosOptions)

      setState({ data: res.data, loading: false })
    } catch (err) {
      if (!axios.isCancel(err)) {
        setState(s => ({
          ...s,
          loading: false,
          error: true
        }))
      }
    }
  }

  useEffect(() => {
    if (query) {
      loadObject(objectType, query)
    }

    return () => {
      if (ref.current) {
        ref.current.cancel()
      }
    }
  }, [query, refresh])

  return state
}
