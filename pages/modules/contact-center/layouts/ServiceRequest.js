import React, { useEffect, useState, useReducer } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Modal } from 'carbon-components-react'
import { Navigation } from './Navigation'
import { useTicketProvider, replaceTicket, selectTicket } from '../TicketProvider'
import { namespace } from '../../../util/namespace'
import { api } from '../../app/api'
import {
  useServiceRequestProvider,
  getServiceRequest,
  fetchServiceRequestSuccess,
  submitServiceRequest,
  submitSuccess,
  updateServiceRequest,
  submitFailure,
  setErrors,
  submitMaximoExceptionFailure
} from '../ServiceRequestProvider'
import { useSession } from '../../auth/SessionProvider'
import { UpdateLayout } from './UpdateLayout'
import { CreateLayout } from './CreateLayout'
import { useServiceRequestSearchProvider } from '../search/SearchProvider'
import { useToast } from '../../../shared/toasts/ToastProvider'
import { useRegistry } from '../../../shared/RegistryProvider'
import config from '../../app/config'
import { InfoModal } from '../components'
import { useControls } from '../hooks/useControls'
import { create as createSchema } from '../schema/create'
import getRelativePath from '../../../util/getRelativePath'
import { checkSRtypeCondition } from '../../../util/checkSRtypeCondition'


import { defaultValues } from '../hooks/useFormModel'
import { Loading } from '../../shared-components/Loading'
import { Summary } from '../components/summary'

const firstLoadSrType = [{ ticketId: '', srType: '' }]

const isNewServiceRequest = ticketId => ticketId && ticketId.startsWith('new')

const loadCreateForm = (ticketId, pelsrtype) => {
  if (isNewServiceRequest(ticketId)) {
    return true
  }
  if (
    firstLoadSrType.findIndex(item => item.ticketId === ticketId) !== -1 &&
    firstLoadSrType.srType === 'IN'
  ) {
    return true
  }
  return pelsrtype === 'IN'
}

const fetchData = ({ objectType, params }) => {
  return api.get(`/pelos/${objectType}`, {
    params: {
      querytemplate: 'BASIC_SEARCH',
      savedQuery: 'DEFAULT',
      _dropnulls: 0,
      lean: 1,
      ...params
    }
  })
}

const loadCostCodeDetail = async sr => {
  if (sr?.mitcostcode) {
    const customer = sr.pluspcustomer?.[0]?.customer

    const approverRes = await fetchData({
      objectType: 'mitcclist',
      params: {
        'oslc.searchTerms': '',
        'oslc.where': `mitclientcode="${customer}" and mitcostcode="${sr.mitcostcode}"`
      }
    })

    
    sr.mitccdesc = approverRes?.data?.member?.[0]?.mitdisplayname ?? ''
  }
}

const loadApproverDetail = async sr => {
  if (sr?.mitcapersonid) {
    const customer = sr.pluspcustomer?.[0]?.customer

    const approverRes = await fetchData({
      objectType: 'mitdoalist',
      params: {
        'oslc.searchTerms': '',
        'oslc.where': `mitcustomer="${customer}" and mitcaperson="${sr.mitcapersonid}"`
      }
    })

    
    sr.mitcadesc = approverRes?.data?.member?.[0]?.mitdisplayname ?? ''
  }
}

const loadServiceRequest = async ticketid => {
  try {
    const res = await api.get('/pelos/PELSRFULL', {
      params: namespace('oslc', {
        select: config.search.pelsrfull.fields,
        where: `ticketid="${ticketid}"`
      })
    })

    const sr = res.data.member[0]

    await Promise.allSettled([loadApproverDetail(sr), loadCostCodeDetail(sr)])

    
    return {
      ...sr,
      classstructureidOld: res.data.member?.[0]?.classstructure?.[0]?.classstructureid,
      assetDesc: _.get(res.data.member[0], 'asset[0].description', '')
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

const saveActualData = data => {
  localStorage.setItem(data?.ticketid, JSON.stringify(data))
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
        saveActualData(sr)
        dispatch(fetchServiceRequestSuccess(ticketId, sr))
      } catch (err) {
        throw err
      }
    }

    // FIXME: Hack until I sort out handlers on create. They're pushing data into the store so this check is premature otherwise.
    const pelsrtype = _.get(store.get(ticketId), 'pelsrtype')

    if (ticketId && !isNewServiceRequest(ticketId) && !pelsrtype) {
      load(ticketId)
    }
  }, [ticketId])
}

const changeServiceRequest = data =>
  api.post(
    `/pelos/pelsrfull/${data.ticketuid}?lean=1&interactive=0&action=wsmethod:createServReq`,
    data,
    {
      headers: {
        'x-method-override': 'PATCH',
        patchtype: 'MERGE',
        properties: config.search.pelsrfull.fields
      }
    }
  )

const createServiceRequest = data =>
  api.post('/pelos/pelsrfull?lean=1&interactive=0&action=wsmethod:createServReq', data, {
    headers: {
      properties: 'ticketid, href, pluspagreement, pelsrcreatemsg, pelsrtype'
    }
  })

export const ServiceRequest = ({ isOpen }) => {
  const [viewState, setViewState] = useState({
    showCreateSuccess: false,
    showUpdateSuccess: false,
    showCreateOptions: false
  })

  const [isLeafNodeSelected, setIsLeafNodeSelected] = useState(false)
  const [isBranchSelected, setIsBranchSelected] = useState(false)
  const [refreshSummary, setRefreshSummary] = useState(false)
  
  const [{ selectedTicketId, ticketIds }, dispatchTicket] = useTicketProvider()

  const [
    { serviceRequests, pending, maximoExceptionErrors },
    dispatchServiceRequest
  ] = useServiceRequestProvider()

  useServiceRequest(serviceRequests, selectedTicketId, dispatchServiceRequest)

  const { doFormSearch, setSearchParams, response } = useServiceRequestSearchProvider()

  const { addSuccessToast, addErrorToast, addPersistentErrorToast } = useToast()

  const [{ srTypesCondition, classifications }] = useRegistry()

  const [session] = useSession()

  const handleSummaryRefresh = status => setRefreshSummary(status)
    const [toggleControl, , controls] = useControls({
    createSuccess: {
      active: false,
      props: null
    },
    noEntitlement: {
      active: false,
      props: null
    }
  })
  const [confirmation, setConfirmation] = useState(false)
    const toggleCreateSuccess = () =>
    setViewState(state => ({
      ...state,
      showCreateSuccess: !state.showCreateSuccess
    }))

    const toggleCreateOptions = () =>
    setViewState(state => ({
      ...state,
      showCreateOptions: !state.showCreateOptions
    }))

    const handleTypeChange = () => (ticketId, data) => {
    return dispatchServiceRequest(
      updateServiceRequest(ticketId, {
        ...data
      })
    )
  }

    const validate = (form, type) => {
    if (type === 'create') {
      return createSchema.validateSync(form, { abortEarly: false })
    }
  }

  
  const handleReload = async ticketId => {
    
    try {
      const sr = await loadServiceRequest(ticketId)
      saveActualData(sr)
      dispatchServiceRequest(fetchServiceRequestSuccess(ticketId, sr))
    } catch (err) {
      throw err
    }
  }

  const handleNoEntitlement = async sr => {
    const noEntitlementData = sr
    const savedSRData = await loadServiceRequest(sr.ticketid)
    noEntitlementData.form = _.pick(savedSRData, _.keys(defaultValues))
    noEntitlementData.classstructureid = savedSRData?.classstructure?.[0].classstructureid

    if (noEntitlementData.pelsrtype === 'CH') {
      return toggleControl('createSuccess', sr)
    }
    return toggleControl('noEntitlement', noEntitlementData)
  }

  const updateServiceRequestMaximo = async form => {
    try {
      let res
      try {
        res = await changeServiceRequest(form)
      } catch (e) {
        dispatchServiceRequest(
          submitMaximoExceptionFailure({
            ticketId: selectedTicketId,
            error: true
          })
        )
        throw new Error(e)
      }

      saveActualData(res.data)
      dispatchServiceRequest(submitSuccess())

      res.data.skipprioritycalculation = form?.pelsrtype === 'QR'

      dispatchServiceRequest(updateServiceRequest(form.ticketid, res.data))
      
      const sRIndex = firstLoadSrType.findIndex(item => item.ticketId === form.ticketid)
      firstLoadSrType[sRIndex].srType = res.data.pelsrtype

      addSuccessToast({
        
        subtitle: `Service request: ${form.ticketid} was updated successfully.`
      })

      if (form.pelsrtype === 'RW' && !form.pluspagreement && !res.data.pluspagreement) {
        
        handleNoEntitlement(res.data)
      }
    } catch (e) {
      addPersistentErrorToast({
        subtitle: `There has been a problem when updating the service request.`,
        caption: e.message
      })
      dispatchServiceRequest(submitFailure())
    }
  }

  const isPriorityRequired = form => {
    return srTypesCondition.filter(sr => sr.srtype === form?.pelsrtype)[0].alnvalue === 'NA'
      ? false
      : !form?.internalpriority
  }
    const handleSubmit = async () => {
    let form = _.pick(getServiceRequest(selectedTicketId, serviceRequests), _.keys(defaultValues))

    form.ticketspec =
      form.ticketspec?.filter(
        classification =>
          classification.tablevalue !== 'tablevalue' &&
          classification.alnvalue !== 'alnvalue' &&
          classification.numvalue !== 'numvalue'
      ) ?? []

    
    
    const affectedFields = _.pick(form, [
      'affectedperson',
      'affectedusername',
      'affectedphone',
      'affectedemail'
    ])

    if (!_.some(affectedFields, _.identity)) {
      form = {
        ...form,
        affectedperson: form.reportedby,
        affectedusername: form.reportedbyname,
        affectedphone: form.reportedphone,
        affectedemail: form.reportedemail
      }
    }

    if (!form.location && form.pellocbuilding) {
      form.location = form.pellocbuilding
    }

    form.internalpriority = form.internalpriority ? parseInt(form.internalpriority, 10) : null

    
    
    const pelKnownAsCust = form.pluspcustomer?.[0]?.pelknownascust
    form.pluspcustomer = form.pluspcustomer?.[0]?.customer

    
    setErrors(selectedTicketId, [])

    try {
      dispatchServiceRequest(submitServiceRequest())

      
      if (!form.ticketid) {
        
        
        

        const pelsrsubtype = ['CH', 'IN'].includes(form.pelsrtype) ? form.pelsrsubtype : ''

        const pelbusunit = form.pelbusunit ? form.pelbusunit : ''

        // Validate before proceding.
        if (!['CP', 'CC', 'IN'].includes(form.pelsrtype)) {
          validate(form, 'create')
        }

        if (
          ['IN', 'CC', 'CP'].includes(form.pelsrtype) &&
          !form?.pellocbuilding &&
          pelKnownAsCust
        ) {
          const errObj = {
            errors: ['Please select a building'],
            name: 'ValidationError',
            type: undefined,
            inner: [
              {
                errors: ['Please select a building'],
                message: 'Please select a building',
                name: 'ValidationError',
                path: 'pellocbuilding',
                type: undefined,
                inner: []
              }
            ]
          }
          throw errObj
        }

        if (
          ['IN', 'CC', 'CP'].includes(form.pelsrtype) &&
          !form?.pellocbuilding &&
          !pelKnownAsCust &&
          !form?.pelbusunit
        ) {
          const errObj = {
            errors: ['Please select a Business Unit'],
            name: 'ValidationError',
            type: undefined,
            inner: [
              {
                errors: ['Please select a Business Unit'],
                message: 'Please select a Business Unit',
                name: 'ValidationError',
                path: 'pelsrsubtype',
                type: undefined,
                inner: []
              }
            ]
          }
          throw errObj
        }

        if (form.pelsrtype === 'IN' && !pelsrsubtype) {
          const errObj = {
            errors: ['Please select an SR Reason'],
            name: 'ValidationError',
            type: undefined,
            inner: [
              {
                errors: ['Please select an SR Reason'],
                message: 'Please select an SR Reason',
                name: 'ValidationError',
                path: 'pelsrsubtype',
                type: undefined,
                inner: []
              }
            ]
          }
          throw errObj
        }

        if (
          !checkSRtypeCondition(
            form?.pelsrtype,
            srTypesCondition,
            isLeafNodeSelected,
            isBranchSelected
          )
        ) {
          const [filteredSR] = srTypesCondition?.filter(sr => sr?.srtype === form?.pelsrtype)
          const errMsg =
            filteredSR?.alnvalue === 'LEAF'
              ? 'Please enter full classification'
              : 'Please select at least a branch for the classification'
          const errObj = {
            errors: [errMsg],
            name: 'ValidationError',
            type: undefined,
            inner: [
              {
                errors: [errMsg],
                message: errMsg,
                name: 'ValidationError',
                path: 'classstructureid',
                type: undefined,
                inner: []
              }
            ]
          }
          throw errObj
        }

        if (isPriorityRequired(form)) {
          const errObj = {
            errors: ['Please select work priority'],
            name: 'ValidationError',
            type: undefined,
            inner: [
              {
                errors: ['Please select work priority'],
                message: 'Please select work priority',
                name: 'ValidationError',
                path: 'internalpriority',
                type: undefined,
                inner: []
              }
            ]
          }
          throw errObj
        }

        let res

        try {
          res = await createServiceRequest({
            ..._.pickBy(
              _.omit(form, [
                'locationDesc',
                'buildingDesc',
                'origrecordDesc',
                'orginatingSR',
                'origrecordDesc',
                'assetDesc',
                'pelpomand',
                
                'skipprioritycalculation',
                'selected'
              ])
            ),
            pelsrsubtype,
            ...(pelbusunit && { pelbusunit }),
            internalpriority: form.internalpriority
          })
        } catch (e) {
          dispatchServiceRequest(
            submitMaximoExceptionFailure({
              ticketId: selectedTicketId,
              error: true
            })
          )

          throw new Error(e)
        }

        
        dispatchTicket(
          replaceTicket(selectedTicketId, res.data.ticketid, {
            pelsrtype: res.data.pelsrtype
          })
        )

        
        if (!res.data.pluspagreement) {
          return handleNoEntitlement(res.data)
        }

        dispatchServiceRequest(submitSuccess())

        
        return toggleControl('createSuccess', res.data)
      }

      const fromMaximo = JSON.parse(localStorage.getItem(selectedTicketId)) ?? null

      if (form.mitcastatus === 'REASSIGNED' && fromMaximo?.mitcapersonid === form?.mitcapersonid) {
        const errObj = {
          errors: ['Client Approver Person couldnt be the same person'],
          name: 'ValidationError',
          type: undefined,
          inner: [
            {
              errors: ['Client Approver Person couldnt be the same person'],
              message: 'Client Approver Person couldnt be the same person',
              name: 'ValidationError',
              path: 'mitcapersonid',
              type: undefined,
              inner: []
            }
          ]
        }
        throw errObj
      }

      if (['REJECTED', 'REASSIGNED'].includes(form.mitcastatus)) {
        if (!form.mitcareason) {
          const errObj = {
            name: 'ValidationError',
            errors: ['Please select the Reason'],
            inner: [
              {
                path: 'mitcareason',
                message: 'Please select the Reason'
              }
            ]
          }
          throw errObj
        } else if (form.mitcareason === 'OTHER' && !form.mitcarearej) {
          const errObj = {
            name: 'ValidationError',
            errors: ['Please enter a reason'],
            inner: [
              {
                path: 'mitcareason',
                message: 'Please enter a reason'
              }
            ]
          }
          throw errObj
        }
      }

      if (form.mitcareason === 'OTHER' && form.mitcarearej) {
        form.mitcareason = form.mitcarearej
      }

      
      delete form.mitcarearej

      if (['RW', 'QR'].includes(form.pelsrtype) && form.pelpomand && !form.pluspcustponum) {
        const errObj = {
          errors: ['Please enter a customer po number'],
          name: 'ValidationError',
          type: undefined,
          inner: [
            {
              errors: ['Please enter a customer po number'],
              message: 'Please enter a customer po number',
              name: 'ValidationError',
              path: 'pelsrsubtype',
              type: undefined,
              inner: []
            }
          ]
        }
        throw errObj
      }
      
      updateServiceRequestMaximo(form)
    } catch (err) {
      const type = form.ticketid ? 'update' : 'create'

      if (err.name && err.name === 'ValidationError') {
        const errors = err.inner.map(err => {
          return { field: err.path, message: err.message }
        })

        dispatchServiceRequest(setErrors(selectedTicketId, errors))

        const message = (
          <ul>
            {err?.errors?.map(error => (
              <li>{error}</li>
            ))}
          </ul>
        )

        addErrorToast({
          subtitle: 'This SR is missing required information.',
          caption: message
        })
      } else {
        const srMethod = type === 'create' ? 'creating' : 'updating'
        addPersistentErrorToast({
          subtitle: `There has been a problem when ${srMethod} the service request.`,
          caption: err.message
        })
      }

      dispatchServiceRequest(submitFailure())
    }
  }

    const handleChange = (ticketId, form, applyFormSearch, leafNodeStatus) => {
    const formData = form
    if (applyFormSearch) {
      
      formData.pluspcustomer = sr?.pluspcustomer
      
      formData.origrecordid = sr?.origrecordid
      doFormSearch(formData, { classstructureid: form.classstructureid })
    }
    if (leafNodeStatus !== undefined) {
      setIsLeafNodeSelected(leafNodeStatus)
      setIsBranchSelected(
        classifications?.some(
          classification =>
            classification.classstructureid === form.classstructureid && classification.parent
        )
      )
    }
    dispatchServiceRequest(updateServiceRequest(ticketId, form))
  }

  const handleSelectTicket = (ticketId, meta) => dispatchTicket(selectTicket(ticketId, meta))

    const sr = getServiceRequest(selectedTicketId, serviceRequests)

  const checkForPossibleDuplicatesBeforeSubmit = () => {
    return response.length && !sr?.ticketid ? setConfirmation(true) : handleSubmit()
  }

    const getSrType = selectedTicketId => {
    const sr = getServiceRequest(selectedTicketId, serviceRequests)

    const ind = sr ? firstLoadSrType.findIndex(item => item.ticketId === sr?.ticketid) : -1
    if (ind !== -1) {
      return firstLoadSrType[ind].srType
    }

    if (sr && sr.pelsrtype) {
      firstLoadSrType.push({ ticketId: sr.ticketid, srType: sr.pelsrtype })
      return sr.pelsrtype
    }

    const data = ticketIds.get(selectedTicketId)
    if (data && data.pelsrtype) {
      firstLoadSrType.push({ ticketId: sr.ticketid, srType: sr.pelsrtype })
      return data.pelsrtype
    }
  }

  const errors = sr?.errors || []

  const entitlementTitle = srtype => {
    if (srtype === 'CP') {
      return 'Complaint SR created'
    }
    if (srtype === 'CC') {
      return 'Compliment SR created'
    }
    if (srtype === 'IN' && controls.noEntitlement.props?.form?.pelsrsubtype !== 'NOTENTITLED') {
      return 'Information SR created'
    }
    return 'No Entitlement Found'
  }

  const showSummary = selectedTicketId === 'summary'

  const getCalculatedPriority = async infoSRData => {
    try {
      const params = {
        location: infoSRData?.location || infoSRData?.pellocbuilding,
        classstructureid: infoSRData?.classstructureid,
        assetnum: infoSRData?.assetnum,
        ticketspec: infoSRData?.ticketspec,
        siteid: infoSRData?.siteid,
        internalpriority: infoSRData?.internalpriority,
        pluspcustomer: infoSRData?.pluspcustomer?.[0]?.customer,
        pelsrtype: infoSRData?.pelsrtype || ''
      }

      const res = await api.post(
        '/pelos/PELSRFULL?lean=1&action=wsmethod:returnPriority',
        _.pickBy({
          ...params,
          ticketspec: params?.ticketspec
        })
      )

      if (res?.data) {
        
        localStorage.setItem('calculatedInternalPriority', res?.data?.internalpriority)

        addSuccessToast({
          title: 'Priority Updated',
          subtitle: `Priority set to ${res?.data?.internalpriority}`
        })

        return res?.data?.internalpriority
      }
    } catch (error) {
      addPersistentErrorToast({
        subtitle: 'Failed to get Priority data',
        caption: error?.message
      })
    }
  }

  return (
    <>
      {!!pending && <Loading modal />}
      <div className={`pel--nav-bar ${isOpen ? '' : 'pel--searchlist-toggle'}`}>
        <Navigation refreshSummary={refreshSummary} handleSummaryRefresh={handleSummaryRefresh} />
      </div>
      {showSummary ? (
        <Summary refreshSummary={refreshSummary} handleSummaryRefresh={handleSummaryRefresh} />
      ) : (
        <div
          className={`pel--main srtype-${sr?.pelsrtype} ${isOpen ? '' : 'pel--searchlist-toggle'}`}
        >
          {selectedTicketId && loadCreateForm(selectedTicketId, getSrType(selectedTicketId)) && (
            <CreateLayout
              key={`create-${selectedTicketId}`}
              sr={sr}
              errors={errors}
              handleChange={handleChange}
              handleSubmit={checkForPossibleDuplicatesBeforeSubmit}
              handleTypeChange={handleTypeChange(sr)}
              ticketId={selectedTicketId}
              handleSelectTicket={handleSelectTicket}
              pelbusunit={session.pelbusunit}
              personid={session.personid}
              busUnits={session.busUnits}
              userPluspcustomer={session.pluspcustomer}
              isLeafNodeSelected={isLeafNodeSelected}
              isBranchSelected={isBranchSelected}
              srTypesCondition={srTypesCondition}
              maximoExceptionErrors={maximoExceptionErrors}
            />
          )}
          {selectedTicketId && !loadCreateForm(selectedTicketId, getSrType(selectedTicketId)) && (
            <UpdateLayout
              key={selectedTicketId}
              sr={sr}
              errors={errors}
              selectedTicketId={selectedTicketId}
              busUnits={session.busUnits}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              reload={handleReload}
              handleSelectTicket={handleSelectTicket}
              handleSearchParams={setSearchParams}
            />
          )}
          <InfoModal
            open={controls.createSuccess.active}
            label="SR Created Successfully"
            title={controls.createSuccess.props?.pelsrcreatemsg}
            onRequestClose={() => toggleControl('createSuccess', null)}
          />

          <InfoModal
            open={controls.noEntitlement.active}
            label={entitlementTitle(controls.noEntitlement.props?.pelsrtype)}
            title={
              controls.noEntitlement.props?.pelsrtype === 'IN' &&
              controls.noEntitlement.props?.form?.pelsrsubtype === 'NOTENTITLED'
                ? 'No entitlement was found matching the information provided, do you want to generate a quote? '
                : controls.noEntitlement.props?.pelsrcreatemsg
            }
            onRequestClose={() => {
              toggleControl('noEntitlement', null)
            }}
            primaryButtonText={
              controls.noEntitlement.props?.pelsrtype === 'IN' &&
              controls.noEntitlement.props?.form?.pelsrsubtype === 'NOTENTITLED'
                ? 'Create Quote'
                : null
            }
            secondaryButtonText={
              controls.noEntitlement.props?.pelsrtype === 'IN' &&
              controls.noEntitlement.props?.form?.pelsrsubtype === 'NOTENTITLED'
                ? 'Continue'
                : null
            }
            onRequestSubmit={async () => {
              if (
                controls.noEntitlement?.props?.pelsrtype === 'IN' &&
                controls.noEntitlement.props?.form?.pelsrsubtype === 'NOTENTITLED'
              ) {
                const infoSRData = controls.noEntitlement.props?.form
                infoSRData.pelsrtype = 'QR'
                infoSRData.pelsrsubtype = ''
                infoSRData.ticketid = controls.noEntitlement?.props?.ticketid
                infoSRData.pluspcustomer = infoSRData?.pluspcustomer?.[0]?.customer
                infoSRData.classstructureid = controls.noEntitlement?.props?.classstructureid

                // do the priority calculation
                const internalpriority = await getCalculatedPriority(infoSRData)
                if (internalpriority) {
                  infoSRData.internalpriority = internalpriority
                }

                updateServiceRequestMaximo(infoSRData)
              }
              toggleControl('noEntitlement', null)
            }}
          />
          <Modal
            open={confirmation}
            modalHeading="Are you sure this Service Request is not a duplicate of an existing request?"
            primaryButtonText="Raise a new request?"
            secondaryButtonText="Cancel"
            onRequestSubmit={() => {
              setConfirmation(false)
              handleSubmit()
            }}
            onRequestClose={() => setConfirmation(false)}
          />
        </div>
      )}
    </>
  )
}

ServiceRequest.propTypes = {
  isOpen: PropTypes.bool
}
