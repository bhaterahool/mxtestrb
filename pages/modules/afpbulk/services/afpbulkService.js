import { hrefToPostHref } from '../../../util/services'
import { api } from '../../app/api'
import { mockAssignments } from './mockAssignments'
import { mockColNewAssignments, mockColPelNonCompReason, mockColPelWorkOutcome } from './mockCol'
import { mockStatuses } from './mockStatuses'
import { mockQueries } from './mockQueries'


const isMock = false

const getAfpbulkQueriesMock = () => new Promise(resolve => resolve(mockQueries))
const getAfpbulkMainStatusesMock = () => new Promise(resolve => resolve(mockStatuses))

export const getAfpbulkQueries = () =>
  isMock
    ? getAfpbulkQueriesMock()
    : api.get(
        `/pelos/peltssuffix?oslc.select=intobjectname,clausename,description,peltssuffix&oslc.where=intobjectname="PELSUBCONASSIGNMENT" and querytype="osclause"`
      )

export const getAfpbulkMainStatuses = () =>
  isMock
    ? getAfpbulkMainStatusesMock()
    : api.get('/service/system', {
        params: {
          action: 'wsmethod:getProperty',
          propName: 'pel.mxplus.subcon.bulkLoadStatuses'
        }
      })

const pelSubconAssignmentSelectQuery = `
  assignmentid,status,pelstatusdate,pelassignstart,pelreasoncode,
  pelassignfinish,
  apptrequired,
  pelappointslotstart,
  pelappointslotfinish,
  startdate,
  finishdate,
  peldescription,
  pelpermitref,
  workorder{
    origrecordid,
    worktype,wopriority,targcompdate,targstartdate,
    wonum,
    pluspcustomer,    
    rel.pellocbuilding{description},
    mtfmcof,
    failurecode,
    pelpermitrequired,
    failurereport{
      type,
      failurecode,
      *
    },
    multiassetlocci{
      multiid,assetnum,location,pelworkcomp,pelcompdate,pelworkoutcome,pelcompnotes,pelnoncompreason,pelcompnotes,
      asset{
        assetmeter{
          newreading,lastreading
        }
      }
    },
    sr{pelsrtype}
  }`.replace(/\s/g, '')

//  pageSize = 50

const getAfpbulkWorkGroupAssignmentsMock = groupId =>
  new Promise(resolve => resolve(mockAssignments(groupId)))

export const getAfpbulkWorkGroupAssignments = queryName =>
  isMock
    ? getAfpbulkWorkGroupAssignmentsMock(queryName)
    : api
        .get('/pelos/PELSUBCONASSIGNMENT', {
          params: {
            lean: 1,
            'oslc.select': pelSubconAssignmentSelectQuery,
            savedQuery: queryName
          }
        })
        .then(({ data: { member } }) => {
          return member
        })




const lookupsrcattr = ({ data: { member } }) =>
  member.map(item => {
    return {
      value: item.value,
      text: item.description
    }
  })

const getColNewAssignmentStatusDropdownMock = () =>
  new Promise(resolve => resolve(mockColNewAssignments))

const getColNewAssignmentReasoncodeDropdownMock = () =>
  new Promise(resolve => resolve(mockColNewAssignments))

export const getColNewAssignmentStatusDropdown = () =>
  isMock
    ? getColNewAssignmentStatusDropdownMock()
    : api
        .get('/service/system', {
          params: {
            lean: 1,
            action: 'wsmethod:getProperty',
            propName: 'pel.mxplus.subcon.allowedNewStatus'
          }
        })
        .then(({ data }) => (data.return ?? '').split(','))

export const getColNewAssignmentReasoncodeDropdown = () =>
  isMock
    ? getColNewAssignmentReasoncodeDropdownMock()
    : api
        .get('/os/pelsubconassignment/newmbo/getlist~pelreasoncode', {
          params: {
            lean: 1,
            'oslc.select': 'description,value',
            'oslc.where': 'pelmetaspecvalues.alnvalue="NONCOMP"'
          }
        })
        .then(lookupsrcattr)

const getColWorkOutcomeDropdownMock = () => new Promise(resolve => resolve(mockColPelWorkOutcome))

export const getColWorkOutcomeDropdown = () =>
  isMock
    ? getColWorkOutcomeDropdownMock()
    : api
        .get(
          '/pelos/PELMETADATAINT?_dropnulls=0&oslc.where=groupname="WORKOUTCOME"&pelmetadata.pelmetaspecvalues.where=metaspecvalue="SUBCON"',
          {
            params: {
              lean: 1,
              'oslc.select': 'description,value,pelmetaspecvalue'
            }
          }
        )
        .then(res => {
          const reducedWorkOutcome = res?.data?.member?.reduce(function(filtered, option) {
            const [value] = option?.pelmetaspecvalue?.filter(opt => opt?.metaspecvalue === 'SUBCON')
            const newValue = {
              alnvalue: value?.alnvalue,
              text: option?.description,
              value: option?.value
            }
            filtered.push(newValue)
            return filtered
          }, [])
          return reducedWorkOutcome || []
        })

const getColPelNonCompReasonDropdownMock = () =>
  new Promise(resolve => resolve(mockColPelNonCompReason))

export const getColPelNonCompReasonDropdown = () =>
  isMock
    ? getColPelNonCompReasonDropdownMock()
    : api
        .get(
          '/pelos/pelassignment/zombie/workorder/zombie/multiassetlocci/zombie/getlist~pelnoncompreason',
          {
            params: {
              lean: 1,
              'oslc.select': 'description,value',
              'oslc.orderBy': '+sortorder',
              'oslc.where':
                'groupname="MJREASONCODE" and value in ["NOTFOUND","PERMITREQUIRED","NOACCESS","ENDOFDAY","COLLECTFAILURE","REROUTED"]'
            }
          }
        )
        .then(lookupsrcattr)

export const postAssignment = ({ href, row }) =>
  api.post(hrefToPostHref(href), row, {
    headers: {
      'x-method-override': 'PATCH',
      patchtype: 'MERGE',
      properties: pelSubconAssignmentSelectQuery
    },
    params: {
      lean: 1
    }
  })
