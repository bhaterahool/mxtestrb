import React, { createContext, useState, useContext, useLayoutEffect, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import _ from 'lodash'
import parse from '../../util/parse'
import { api } from '../app/api'

const SessionContext = createContext()

export const SessionProvider = ({ options, children }) => {
  const { storageType, storageKey } = options

  const store = storageType === 'local' ? localStorage : sessionStorage

  const [session, setSession] = useState(() =>
    store.getItem('mxplus') ? parse(store.getItem('mxplus')) : {}
  )

    useEffect(() => {
    if (session?.sessionId) {
      store.setItem(storageKey, JSON.stringify(session))
    } else {
      store.removeItem(storageKey)
    }

    return () => store.removeItem(storageKey)
  }, [session, session.sessionId])

  useLayoutEffect(() => {
    api.interceptors.request.use(
      config => ({
        ...config,
        params: config.removeparams
          ? {}
          : {
              _dropnulls: 0,
              ...config.params,
              lean: 1
            }
      }),
      err => Promise.reject(err)
    )

    api.interceptors.response.use(_.identity, err => {
      if (err.response && err.response.status === 401) {
        if (!err.response.config.url.includes('login')) {
          setSession({})
          store.removeItem(storageKey)

          
          return Promise.reject()
        }
      }
      const maximoError = err?.response?.data?.Error?.message
      if (maximoError) {
        return Promise.reject(new Error(maximoError, { cause: err }))
      }

      
      return Promise.reject(err)
    })
  }, [])

  return <SessionContext.Provider value={[session, setSession]}>{children}</SessionContext.Provider>
}

SessionProvider.propTypes = {
  options: PropTypes.shape({
    storageType: PropTypes.string.isRequired,
    storageKey: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const useSession = () => useContext(SessionContext)
