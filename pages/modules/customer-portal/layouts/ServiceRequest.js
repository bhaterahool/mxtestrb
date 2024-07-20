import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import fileDownload from 'js-file-download'
import { Navigation } from './Navigation'
import { useTicketProvider, replaceTicket, selectTicket } from '../TicketProvider'
import { namespace } from '../../../util/namespace'
import { api } from '../../app/api'
import {
  useServiceRequestProvider,
  getServiceRequest,
  fetchServiceRequestSuccess
} from '../ServiceRequestProvider'
import { useSession } from '../../auth/SessionProvider'
import { UpdateLayout } from './UpdateLayout'
import { useServiceRequestSearchProvider } from '../search/SearchProvider'
import config from '../../app/config'
import { Loading } from '../../shared-components/Loading'

const loadServiceRequest = async ticketid => {
  try {
    const res = await api.get('/pelos/PELSRFULL', {
      params: namespace('oslc', {
        select: config.search.pelsrfull.fields,
        where: `ticketid="${ticketid}"`
      })
    })

    
    return {
      ...res.data.member[0],
      assetDesc: _.get(res.data.member[0], 'asset[0].description', '')
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

/**
 * Effect for loading service request when a ticket is selected.
 */
const useServiceRequest = (store, ticketId, dispatch) => {
  useEffect(() => {
    const load = async ticketId => {
      // eslint-disable-next-line no-useless-catch
      try {
        const sr = await loadServiceRequest(ticketId)

        dispatch(fetchServiceRequestSuccess(ticketId, sr))
      } catch (err) {
        throw err
      }
    }

    // FIXME: Hack until I sort out handlers on create. They're pushing data into the store so this check is premature otherwise.
    const pelsrtype = _.get(store.get(ticketId), 'pelsrtype')

    if (ticketId && !pelsrtype) {
      load(ticketId)
    }
  }, [ticketId])
}

const changeServiceRequest = data =>
  api.post(`/pelos/pelsrfull/${data.ticketuid}?lean=1&action=wsmethod:createServReq`, data, {
    headers: {
      'x-method-override': 'PATCH',
      patchtype: 'MERGE',
      properties: config.search.pelsrfull.fields
    }
  })

export const ServiceRequest = ({ isOpen }) => {
  
  const [{ selectedTicketId, ticketIds }, dispatchTicket] = useTicketProvider()

  const [{ serviceRequests, pending }, dispatchServiceRequest] = useServiceRequestProvider()

  useServiceRequest(serviceRequests, selectedTicketId, dispatchServiceRequest)

  const { setSearchParams, response } = useServiceRequestSearchProvider()

  const [session] = useSession()

  
  const handleReload = async ticketId => {
    
    try {
      const sr = await loadServiceRequest(ticketId)

      dispatchServiceRequest(fetchServiceRequestSuccess(ticketId, sr))
    } catch (err) {
      throw err
    }
  }

    const sr = getServiceRequest(selectedTicketId, serviceRequests)

  const downloadReport = () => {
    const wonum = sr?.relatedrecord[0]?.workorder[0]?.wonum
    const filePath = `pelos/MXAPIWODETAIL?action=genreport&reportformat=pdf&reportname=mitie_wo_summary.rptdesign&oslc.where=wonum="${wonum}"`

    const report = api
      .get(`${filePath}`, {
        responseType: 'blob'
      })
      .then(res => {
        fileDownload(res.data, `Work Order ${wonum} Summary.pdf`)
      })
  }

  return (
    <>
      {pending && <Loading modal />}
      <div className={`pel--nav-bar ${isOpen ? '' : 'pel--searchlist-toggle'}`}>
        <Navigation />
      </div>
      <div
        className={`pel--main srtype-${sr?.pelsrtype} ${isOpen ? '' : 'pel--searchlist-toggle'}`}
      >
        {selectedTicketId && (
          <UpdateLayout
            key={selectedTicketId}
            sr={sr}
            selectedTicketId={selectedTicketId}
            busUnits={session.busUnits}
            reload={handleReload}
            handleOpenReport={downloadReport}
            handleSearchParams={setSearchParams}
          />
        )}
      </div>
    </>
  )
}

ServiceRequest.propTypes = {
  isOpen: PropTypes.bool
}
