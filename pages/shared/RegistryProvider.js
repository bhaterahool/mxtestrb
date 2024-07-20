import React, { useContext, useState, useEffect, createContext } from 'react'
import PropTypes from 'prop-types'
import { Cache } from 'axios-extensions'
import { api } from '../modules/app/api'
import { useSession } from '../modules/auth/SessionProvider'
import { Loading } from '../modules/shared-components/Loading'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  DEV,
  EXCLUDE_CONTACT_CENTER_API_DEPS,
  EXCLUDE_CUSTOMER_PORTAL_API_DEPS,
  EXCLUDE_SUBAFP_API_DEPS,
  EXCLUDE_SUBCON_API_DEPS,
  EXCLUDE_WOPRICE_API_DEPS
} from '../dev.config'

import {
  SUB_NONCOMP_NOTFOUND,
  SUB_NONCOMP_PERMITREQUIRED,
  SUB_NONCOMP_NOACCESS,
  SUB_NONCOMP_ENDOFDAY,
  SUB_NONCOMP_COLLECTFAILURE,
  SUB_NONCOMP_REROUTED
} from './grid/constants'

const SEVEN_DAYS = 604800

const hierarchyCache = new Cache({ maxAge: SEVEN_DAYS, max: 100000 })

const RegistryContext = createContext()

let defaultOrgId = 'MITIEUK'
const getFilteredNonCompData = (response, objectname, filtervalue) =>
  response?.reduce(function(filtered, option) {
    const [value] = option?.pelmetaspecvalue?.filter(opt =>
      filtervalue
        ? opt?.metaspecvalue === objectname && opt?.alnvalue === filtervalue
        : opt?.metaspecvalue === objectname
    )
    const newValue = {
      alnvalue: value?.alnvalue,
      description: option?.description,
      value: option?.value
    }
    if (newValue?.alnvalue && filtervalue) {
      filtered.push(newValue)
    }
    if (newValue?.alnvalue && !filtervalue) {
      filtered.push(newValue)
    }
    return filtered
  }, [])


const getSRDocTypes = async () => {
  try {
    const res = await api.get('/pelos/pelappdoctype?savedQuery=SRDOCTYPES&oslc.select=*')

    return { srdocTypes: res.data.member }
  } catch (err) {
    throw new Error(`Cound not retrieve doctypes reason: ${err.message}`)
  }
}

const getWODocTypes = async () => {
  try {
    const res = await api.get('/pelos/pelappdoctype?savedQuery=WODOCTYPES&oslc.select=*', {
      useCache: true
    })

    return { wodocTypes: res.data.member }
  } catch (err) {
    throw new Error(`Cound not retrieve doctypes reason: ${err.message}`)
  }
}

const getSRSchema = async () => {
  try {
    const res = await api.get(`/jsonschemas/pelsrfull?oslc.select=*`)

    
    return { [`pelsrfullschema`]: res.data }
  } catch (err) {
    throw new Error(`Cound not retrieve schema pelsrfull schema reason: ${err.message}`)
  }
}

const getAssignmentSchema = async () => {
  try {
    const res = await api.get(`/jsonschemas/pelassignment?oslc.select=*`, {
      useCache: true
    })

    
    return { [`pelassignmentschema`]: res.data }
  } catch (err) {
    const message = err?.message || 'Something went wrong.'
    throw new Error(`Cound not retrieve schema pelassignment schema reason: ${message}`)
  }
}

const getStatusTypes = async () => {
  try {
    const res = await api.get(
      `/pelos/PELDOMAIN?oslc.select=synonymdomain{*}&oslc.where=domainid="SRSTATUS"`
    )

    return {
      statusTypes: res.data.member[0].synonymdomain
    }
  } catch (err) {
    throw new Error(`Cound not retrieve status types. Reason: ${err.message}`)
  }
}

const getBusinessUnits = async () => {
  try {
    const res = await api.get(
      `/pelos/PELMETADATAINT?_dropnulls=0&oslc.select=description,value&oslc.where=groupname="BUSUNIT"`
    )

    return {
      businessUnit: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve business units. Reason: ${err.message}`)
  }
}

const getAssignmentStatusList = async () => {
  try {
    const res = await api.get(
      `/pelos/PELDOMAIN?oslc.select=synonymdomain{*}&oslc.where=domainid="ASSTAT"`
    )

    return {
      assignmentStatusList: res.data.member[0].synonymdomain
    }
  } catch (err) {
    throw new Error(`Cound not retrieve status types. Reason: ${err.message}`)
  }
}

const getPrioritiesList = async () => {
  try {
    const res = await api.get(`/pelos/PELDOMAIN?oslc.where=domainid="TICKETPRIORITY"&oslc.select=*`)

    return {
      prioritiesList: res.data.member[0].numericdomain
    }
  } catch (err) {
    throw new Error(`Cound not retrieve priority value. Reason: ${err.message}`)
  }
}

const getPriorityChangeDescList = async () => {
  try {
    const res = await api.get(`/pelos/PELDOMAIN?oslc.where=domainid="PELPRIOCHGDESC"&oslc.select=*`)

    return {
      priorityChangeDescList: res.data.member[0].alndomain
    }
  } catch (err) {
    throw new Error(`Cound not retrieve priority change desc value. Reason: ${err.message}`)
  }
}

const getLogTypes = async () => {
  try {
    const res = await api.get(
      `/pelos/PELDOMAIN?oslc.select=synonymdomain{*}&oslc.where=domainid="LOGTYPE"`,
      {
        useCache: true
      }
    )

    return {
      logTypes: res.data.member[0].synonymdomain
    }
  } catch (err) {
    throw new Error(`Cound not retrieve log types. Reason: ${err.message}`)
  }
}

const getEventTypes = async () => {
  try {
    const res = await api.get(
      `/pelos/PELMTFM_WOMITEVS/zombie/getlist~mitevt?oslc.select=value,description`
    )

    return {
      eventTypes: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve event types. Reason: ${err.message}`)
  }
}

const getMaxProps = async () => {
  try {
    const res = await api.get(
      `/pelos/pelprop?oslc.select=propname,maxpropvalue.propvalue&savedQuery=MXPLUS`
    )

    return {
      maxProps: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve log types. Reason: ${err.message}`)
  }
}

const getSrSubTypes = async () => {
  try {
    const res = await api.get(
      `/pelos/PELMETADATAINT?_dropnulls=0&oslc.select=*&oslc.where=groupname="SRSUBTYPE"`
    )

    return {
      srSubType: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve SR sub types. Reason: ${err.message}`)
  }
}

const getSRQueries = async () => {
  try {
    const res = await api.get(
      `/pelos/peltssuffix?oslc.select=intobjectname,clausename,description,peltssuffix&oslc.where=intobjectname="PELSRLITE" and querytype="osclause"`
    )
    return {
      pelsrliteQueries: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve SR queries. Reason: ${err.message}`)
  }
}

const getSRCPQueries = async () => {
  try {
    const res = await api.get(
      `/pelos/peltssuffix?oslc.select=intobjectname,clausename,description,peltssuffix&oslc.where=intobjectname="PELSRLITECP" and querytype="osclause"`
    )
    return {
      pelsrliteCpQueries: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve SR queries. Reason: ${err.message}`)
  }
}

const getAssignmentQueries = async () => {
  try {
    const res = await api.get(
      `/pelos/peltssuffix?oslc.select=*&oslc.where=intobjectname="PELASSIGNMENT" and querytype="osclause"`
    )
    return {
      pelassignmentQueries: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve SR queries. Reason: ${err.message}`)
  }
}

const getWorkOutcomes = async () => {
  try {
    const res = await api.get(
      `/pelos/PELMETADATAINT?_dropnulls=0&oslc.select=description,value,pelmetaspecvalue&oslc.where=groupname="WORKOUTCOME"&pelmetadata.pelmetaspecvalues.where=metaspecvalue="SUBCON"`
    )

    
    const hasPelmetaData = res?.data?.member?.every(row => row?.pelmetaspecvalue)

    const reducedWorkOutcome =
      hasPelmetaData &&
      res?.data?.member?.reduce(function(filtered, option) {
        const [value] = option?.pelmetaspecvalue?.filter(opt => opt?.metaspecvalue === 'SUBCON')

        const newValue = {
          alnvalue: value?.alnvalue,
          description: option?.description,
          value: option?.value
        }
        filtered.push(newValue)

        return filtered
      }, [])

    return {
      workOutcomes: reducedWorkOutcome || []
    }
  } catch (err) {
    throw new Error(`Cound not retrieve log types. Reason: ${err.message}`)
  }
}

const getPelAssetConds = async () => {
  try {
    const res = await api.get(`/pelos/PELDOMAIN?oslc.select=*&oslc.where=domainid="PELASSETCOND"`)

    return {
      pelAssetConds: res.data.member[0].alndomain
    }
  } catch (err) {
    throw new Error(`Cound not retrieve log types. Reason: ${err.message}`)
  }
}

const getFailureReasons = async () => {
  try {
    const res = await api.get(
      `os/PELMETADATAINT?_dropnulls=0&oslc.select=description,value&oslc.where=groupname="FAULT" and value in ["VANDALISM","ACCDAM","STAFFDAM","WEARTEAR"]`
    )

    return {
      failureReasons: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve failure reasons. Reason: ${err.message}`)
  }
}

const getRejectClientReasons = async () => {
  try {
    const res = await api.get(
      `os/PELMETADATAINT?_dropnulls=0&oslc.select=description,value&oslc.where=groupname="MITREJECTREASONS"`
    )

    return {
      clientRejectReasons: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve client reasons. Reason: ${err.message}`)
  }
}

const getReassignClientReasons = async () => {
  try {
    const res = await api.get(
      `os/PELMETADATAINT?_dropnulls=0&oslc.select=description,value&oslc.where=groupname="MITREASSIGNREASONS"`
    )

    return {
      clientReassignReasons: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve client reasons. Reason: ${err.message}`)
  }
}

const getNonCompletionReasons = async () => {
  try {
    const res = await api.get(
      '/pelos/PELMETADATAINT?_dropnulls=0&oslc.select=description,value,pelmetaspecvalue&oslc.where=groupname="MJREASONCODE"'
    )

    
    const hasPelmetaData = res?.data?.member?.every(row => row?.pelmetaspecvalue)

    return {
      nonCompletionReasons: hasPelmetaData
        ? getFilteredNonCompData(res?.data?.member, 'SUBCONREASON', 'ASSETNONREASON')
        : [],
      reasonCodeList: hasPelmetaData
        ? getFilteredNonCompData(res?.data?.member, 'SUBCONREASON', 'RETURN')
        : [],
      assignmentNonCompletionReasons: hasPelmetaData
        ? getFilteredNonCompData(res?.data?.member, 'SUBCONNCSTATUS')
        : []
    }
  } catch (err) {
    throw new Error(`Cound not retrieve non completion reasons. Reason: ${err.message}`)
  }
}

const getSRTypesCondition = async () => {
  try {
    const res = await api.get(
      `os/PELMETADATAINT?_dropnulls=0&oslc.select=description,pelmetaspecvalue{alnvalue,metadatavalue,metaspecvalue}&oslc.where=groupname="SRTYPE"`
    )

    const reducedSRTypeCondition = res?.data?.member?.reduce(function(filtered, option) {
      const [value] = option?.pelmetaspecvalue?.filter(
        opt => opt?.metaspecvalue === 'CLASSIFICTYPE'
      )
      const newValue = {
        alnvalue: value?.alnvalue,
        description: option?.description,
        srtype: value?.metadatavalue
      }
      filtered.push(newValue)

      return filtered
    }, [])

    return {
      srTypesCondition: reducedSRTypeCondition || []
    }
  } catch (err) {
    throw new Error(`Cound not retrieve SR Types List. Reason: ${err.message}`)
  }
}

const getWorkOrderTypeList = async () => {
  try {
    const res = await api.get(
      `/pelos/pelwo/zombie/getlist~worktype?lean=1&oslc.select=worktype,wtypedesc&oslc.where=pelissubcon=1 and woclass="WORKORDER" and orgid="${defaultOrgId}"&oslc.orderBy=-wtypedesc`
    )

    return {
      workOrderTypeList: res.data.member
    }
  } catch (err) {
    throw new Error(`Cound not retrieve status types. Reason: ${err.message}`)
  }
}

const appDependencies = [
  {
    appname: `CONC`,
    dependency:
      DEV && EXCLUDE_CONTACT_CENTER_API_DEPS
        ? []
        : [
            getSRSchema,
            getSRDocTypes,
            getLogTypes,
            getStatusTypes,
            getBusinessUnits,
            getSrSubTypes,
            getPrioritiesList,
            getPriorityChangeDescList,
            getSRQueries,
            getSRTypesCondition,
            getMaxProps,
            getRejectClientReasons,
            getReassignClientReasons
          ]
  },
  {
    appname: `SUBC`,
    dependency:
      DEV && EXCLUDE_SUBCON_API_DEPS
        ? []
        : [
            getAssignmentSchema,
            getPrioritiesList,
            getWODocTypes,
            getLogTypes,
            getMaxProps,
            getEventTypes,
            getAssignmentStatusList,
            getSrSubTypes,
            getAssignmentQueries,
            getWorkOutcomes,
            getPelAssetConds,
            getFailureReasons,
            getRejectClientReasons,
            getReassignClientReasons,
            getNonCompletionReasons,
            getWorkOrderTypeList
          ]
  },
  {
    appname: `CUSTPORTAL`,
    dependency:
      DEV && EXCLUDE_CUSTOMER_PORTAL_API_DEPS ? [] : [getSRSchema, getLogTypes, getSRCPQueries]
  },
  {
    appname: `PELSUBAFP`,
    dependency: DEV && EXCLUDE_SUBAFP_API_DEPS ? [] : [getMaxProps]
  },
  {
    appname: `PELWOPRICE`,
    dependency: DEV && EXCLUDE_WOPRICE_API_DEPS ? [] : [getMaxProps]
  }
]

export const RegistryProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [registry, setRegistry] = useState({})
  const [classificationRowStamp, setClassificationRowStamp] = useLocalStorage(
    'classifications-latest-rowstamp',
    ''
  )

  const [classifications, setClassifications] = useLocalStorage('classifications', null)

  const getClassHierarchy = async () => {
    try {
      const mostRecentClassification = await api
        .get('/pelos/PELDIAGNOSIS?lean=1&savedQuery=DIAGNOSISVER&oslc.select=classstructureid')
        .catch(e => null)

      
      const latestRowStamp = mostRecentClassification?.data?.member?.[0]?._rowstamp
      if (classificationRowStamp === latestRowStamp) return classifications

      api
        .get(
          '/pelos/PELDIAGNOSIS?oslc.where=pelisdiagnosis=true&oslc.select=parent,hierarchypath,description_longdescription,classstructureid,classificationdesc,description,classificationid,pluspcustomer,pluspcustassoc{customer},pelinternalpriority,pelchildquestion,peldiagnosisadvice,haschildren,parentclassificationid,pelisdiagnosis,pelinternalpriority_description,assetattribute{*},classspec{*}&_dropnulls=0&ignorecollectionref=1',
          {
            cache: hierarchyCache,
            useCache: true
          }
        )
        .then(res => {
          setClassifications(() => res?.data?.member)
          setClassificationRowStamp(() => latestRowStamp || null)
        })
      return {
        classifications: classifications || []
      }
    } catch (err) {
      throw new Error(`Cound not retrieve classification hierarchy. Reason: ${err.message}`)
    }
  }

  
  const [session] = useSession()
  
  defaultOrgId = session?.orgid || defaultOrgId
  const permittedApps =
    session.sessionId && session.applications.filter(app => app.apptype === 'MXPLUS')
  const dependencies = appDependencies.filter(application =>
    permittedApps?.some(permittedapp => permittedapp.code === application.appname)
  )
  const depsList = dependencies?.flatMap(data => data.dependency)
  const uniqueDeps = [...new Set(depsList)]

  if (permittedApps?.some(app => app.code === 'CONC')) {
    uniqueDeps.push(getClassHierarchy)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await Promise.all(uniqueDeps?.map(dependency => dependency()))
      const regObj = data.reduce((result, obj) => {
        return {
          ...result,
          ...obj
        }
      }, {})

      setRegistry(registry => ({
        ...registry,
        ...regObj
      }))
      setLoading(false)
    }

    if (session.sessionId) {
      load()
    }
  }, [session.sessionId])

  useEffect(() => {
    if (classificationRowStamp) {
      setRegistry(registry => ({
        ...registry,
        classifications
      }))
    }
  }, [classificationRowStamp])

  
  if (loading) {
    return <Loading />
  }

  return (
    <RegistryContext.Provider value={[registry, setRegistry]}>{children}</RegistryContext.Provider>
  )
}

RegistryProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export const RegistryConsumer = RegistryContext.Consumer

export const useRegistry = () => useContext(RegistryContext) 
