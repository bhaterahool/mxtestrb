import { api } from '../../app/api'
import { namespace } from '../../../util/namespace'
import config from '../../app/config'

export const fetchAssignmentById = async assignmentId =>
  new Promise(resolve => {
    return api
      .get('/pelos/PELASSIGNMENT', {
        params: namespace('oslc', {
          select: config.search.pelassignment.fields,
          where: `assignmentid=${assignmentId}`
        })
      })
      .then(res => {
        resolve({
          ok: true,
          result: res?.data?.member?.[0] ?? {}
        })
      })
      .catch(error => {
        resolve({
          ok: false,
          error: error?.message
        })
      })
  })
