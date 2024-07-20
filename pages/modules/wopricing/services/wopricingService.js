import { hrefToPostHref } from '../../../util/services'
import { api } from '../../app/api'
import { mockAbcSchools } from './mockAbcSchools'
import { mockCustomerSelection } from './mockCustomerSelection'

const isMock = false

const getWopricingCustomersActiveMock = () => new Promise(resolve => resolve(mockCustomerSelection))

export const getWopricingCustomersActive = () =>
  isMock
    ? getWopricingCustomersActiveMock()
    : api
        .get('/pelos/pelmanbill/zombie/getlist~pluspcustomer', {
          params: {
            lean: 1,
            'oslc.select': 'customer,name',
            'oslc.where': 'status="ACTIVE"'
          }
        })
        .then(({ data: { member } }) => {
          return member
        })





export const getWopricingWONUMMock = () =>
  new Promise(resolve => {
    resolve(mockAbcSchools)
  })

export const getWopricingWONUM = (pluspcustomer, statuses, statusDateFrom, statusDateTo) => {
  let statusWhereQuery =
    statuses?.length > 0 ? `status in [${statuses?.map(row => `"${row}"`)?.join(',')}] and` : ''
  statusWhereQuery += statusDateFrom ? ` statusdate>="${statusDateFrom}" and` : ''
  statusWhereQuery += statusDateTo ? ` statusdate<="${statusDateTo}" and` : ''

  return isMock
    ? getWopricingWONUMMock()
    : api
        .get('/pelos/pelmanbill', {
          params: {
            lean: 1,
            'oslc.select':
              'wonum,siteid,worktype,commoditygroup,commodity,description,pluspcustomer,status',
            'oslc.where': `${statusWhereQuery} pluspcustomer="${pluspcustomer}"`
            
          }
        })
        .then(({ data: { member } }) => {
          return member
        })
}

export const getManualBillFeeType = () =>
  isMock
    ? new Promise(resolve => resolve({ data: { return: 'MANAGEMENT' } }))
    : api.get(`/service/system`, {
        params: {
          propName: 'pel.app.wo.manualBillFeeType',
          action: 'wsmethod:getProperty'
        }
      })
export const getManualBillStatus = () =>
  isMock
    ? new Promise(resolve => resolve({ data: { return: 'MANBILL' } }))
    : api.get(`/service/system`, {
        params: {
          propName: 'pel.app.wo.manualBillStatus',
          action: 'wsmethod:getProperty'
        }
      })

export const postWopricing = ({
  href,
  manualBillFeeType,
  linedescription,
  linecost,
  status,
  skipStatus = false
}) =>
  api.post(
    hrefToPostHref(href),
    {
      ...(!skipStatus && { status }),
      pluspgbtrans: [
        {
          type: manualBillFeeType,
          description: linedescription,
          lineprice: Number(linecost)
        }
      ]
    },
    {
      headers: {
        'x-method-override': 'PATCH',
        patchtype: 'MERGE'
      },
      params: {
        lean: 1
      }
    }
  )

export const bulkPost = data =>
  api.post('pelos/pelmanbill', data, {
    headers: {
      'x-method-override': 'BULK',
      properties: 'wonum,status,workorderid,pluspgbtrans{customer}'
    },
    params: {
      lean: 1
    }
  })
