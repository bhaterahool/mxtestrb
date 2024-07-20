import { useState, useEffect } from 'react'
import { api } from '../../modules/app/api'

const useDocumentMissingReason = (forceRefresh = false, useCache = true) => {
  const [documentMissingReasons, setDocumentMissingReasons] = useState([])
  useEffect(() => {
    api
      .get('/pelos/PELDOMAIN?oslc.select=alndomain&oslc.where=domainid="PELNOTPROVIDEDRSN"', {
        useCache
      })
      .then(
        ({
          data: {
            member: [{ alndomain }]
          }
        }) => {
          setDocumentMissingReasons(
            alndomain.map(({ value, description }) => ({ value, description }))
          )
        }
      )
      .catch(error => console.log(error))
  }, [forceRefresh])

  return { documentMissingReasons }
}

export default useDocumentMissingReason
