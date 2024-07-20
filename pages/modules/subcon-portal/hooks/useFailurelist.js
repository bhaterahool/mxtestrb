import { useState } from 'react'
import { api } from '../../app/api'

const useFailurelist = orgid => {
  const structreData = data =>
    data.map(({ failurecode, orgid, parent, type, failurelist }) => ({
      description: failurecode[0].description,
      failurecode: failurecode[0].failurecode,
      orgid,
      parent,
      failurelist,
      type
    }))

  const [failureClassData, setFailureClassData] = useState()
  const [failureProblemData, setFailureProblemData] = useState()
  const [failureCauseData, setFailureCauseData] = useState()
  const [failureRemedyData, setFailureRemedyData] = useState()
  const [loadingFailure, setLoading] = useState({
    class: false,
    problem: false,
    cause: false,
    remedy: false
  })

  const getFailureRequest = url => {
    return new Promise((resolve, reject) => {
      api
        .get(url, { cache: true })
        .then(async ({ data: { member } }) => {
          const data = await structreData(member)
          resolve(data)
        })
        .catch(error => console.log(error))
    })
  }

  const fetchClassData = () => {
    return new Promise((resolve, reject) => {
      getFailureRequest(
        `/pelos/pelfailurelist/?oslc.select=*&oslc.where=parent!="*" and orgid="${orgid}"`
      ).then(data => {
        setFailureClassData(data)
        resolve(data)
      })
    })
  }

  const fetchProblemData = (failurecode, classData) => {
    return new Promise((resolve, reject) => {
      const listId = classData.find(x => x?.failurecode === failurecode)?.failurelist ?? 0
      if (listId) {
        getFailureRequest(
          `/pelos/pelfailurelist/?oslc.select=*&oslc.where=parent=${listId} and orgid="${orgid}"`
        ).then(data => {
          setFailureProblemData(data)
          resolve(data)
        })
      } else {
        setFailureProblemData([])
        resolve([])
      }
    })
  }

  const fetchCauseData = (failurecode, problemData) => {
    return new Promise((resolve, reject) => {
      const listId = problemData.find(x => x?.failurecode === failurecode)?.failurelist ?? 0
      if (listId) {
        getFailureRequest(
          `/pelos/pelfailurelist/?oslc.select=*&oslc.where=parent=${listId} and orgid="${orgid}"`
        ).then(data => {
          setFailureCauseData(data)
          resolve(data)
        })
      } else {
        setFailureCauseData([])
        resolve([])
      }
    })
  }

  const fetchRemedyData = (failurecode, causeData) => {
    return new Promise((resolve, reject) => {
      const listId = causeData.find(x => x?.failurecode === failurecode)?.failurelist ?? 0
      if (listId) {
        getFailureRequest(
          `/pelos/pelfailurelist/?oslc.select=*&oslc.where=parent=${listId} and orgid="${orgid}"`
        ).then(data => {
          setFailureRemedyData(data)
          resolve(data)
        })
      } else {
        setFailureRemedyData([])
        resolve([])
      }
    })
  }

  const fetchInitalData = ({ failurecode, failurereport }) => {
    setLoading({ class: true, problem: true, cause: true, remedy: true })
    return new Promise((resolve, reject) => {
      fetchClassData().then(classData => {
        if (failurecode) {
          fetchProblemData(failurecode, classData).then(problemData => {
            const problemCode = failurereport?.[0]?.failurecode
            if (problemCode) {
              fetchCauseData(problemCode, problemData).then(causeData => {
                const causeCode = failurereport?.[1]?.failurecode
                if (causeCode) {
                  fetchRemedyData(causeCode, causeData).then(() => {
                    setLoading({ class: false, problem: false, cause: false, remedy: false })
                    resolve()
                  })
                } else {
                  setLoading({ ...loadingFailure, cause: false, remedy: false })
                  resolve()
                }
              })
            } else {
              setLoading({ ...loadingFailure, problem: false, cause: false, remedy: false })
              resolve()
            }
          })
        } else {
          setLoading({ class: false, problem: false, cause: false, remedy: false })
          resolve()
        }
      })
    })
  }

  const fetchData = ({ type, failurecode }) => {
    if (type === '') {
      setLoading({ ...loadingFailure, problem: true })
      fetchProblemData(failurecode, failureClassData).then(() => {
        setLoading({ ...loadingFailure, problem: false })
      })
    } else if (type === 'PROBLEM') {
      setLoading({ ...loadingFailure, cause: true })
      fetchCauseData(failurecode, failureProblemData).then(() => {
        setLoading({ ...loadingFailure, cause: false })
      })
    } else if (type === 'CAUSE') {
      setLoading({ ...loadingFailure, remedy: true })
      fetchRemedyData(failurecode, failureCauseData).then(() => {
        setLoading({ ...loadingFailure, remedy: false })
      })
    }
  }

  return {
    fetchInitalData,
    fetchData,
    failureClassData,
    failureProblemData,
    failureCauseData,
    failureRemedyData,
    loadingFailure
  }
}

export default useFailurelist
