import React, { useEffect, useState } from 'react'
import {
  Button,
  Form,
  Modal,
  DataTable,
  Checkbox,
  Select,
  SelectItem
} from 'carbon-components-react'
import PropTypes from 'prop-types'

import Document16 from '@carbon/icons-react/lib/document/16'
import Launch16 from '@carbon/icons-react/lib/launch/16'
import Link16 from '@carbon/icons-react/lib/link/16'
import _ from 'lodash'

import {
  AssetSearchResult,
  BusinessUnitInput,
  CreatePersonModal,
  CustomerSearchResult,
  ExistingRefInput,
  InfoPanel,
  LocationSearchInput,
  LongDescriptionForm,
  OwnerGroupResult,
  PersonSearchResult,
  ServiceRequestType
} from '.'
import { PelDateInput, PelTextArea, PelTextInput } from '../../../shared/forms/Inputs'
import { api } from '../../app/api'
import config from '../../app/config'
import { useControls } from '../hooks/useControls'
import { useFormModel } from '../hooks/useFormModel'
import { TypeAhead } from '../search/containers/TypeAhead'
import { getProcessedQuery } from '../../../util/createQuery'
import { useRegistry } from '../../../shared/RegistryProvider'
import { useSearch } from '../search/useSearch'
import { formatTelephoneNo } from '../util/formatters'
import { getAffectedPlaceHolders } from '../util/getAffectedPlaceHolders'
import { useControlledObject } from '../../../shared/hooks/useContolledObject'
import { CostCodeSearchResult } from './CostCodeSearchResult'
import { ClientApproverSearchResult } from './ClientApproverSearchResult'
import { PersonInfo } from '../components'
import { useObject } from '../../../shared/hooks/useObject'
import { Loading } from '../../shared-components/Loading'
import { ApprovalStatues } from '../constants'

const transformBusUnitForDropdown = (busUnits, defaultBusUnits) => {
  const srbunits = defaultBusUnits.filter(dbunit => {
    const existbunit = busUnits.find(bunit => dbunit.value === bunit.busunit)
    if (existbunit !== undefined) {
      const newbunit = {
        newvalue: dbunit.busunit,
        description: dbunit.description || existbunit.busunit,
        busunit: ''
      }
      return newbunit
    }

    return false
  })
  return srbunits ?? []
}

/**
 * General Details Editor.
 */
export const EditPanel = ({
  loading,
  getInputProps,
  handleChange,
  handleSearchParams,
  handleSelectTicket,
  statusTypes,
  ticketId,
  pelbusunit,
  sr,
  errors,
  isCreateLayout,
  readOnly,
  handleTypeChange,
  refresh
}) => {
  /**
   * Use the form model to handle side effects between fields.
   */
  const {
    form,
    originaldata,
    fromMaximo,
    fromMaximoActData,
    setCustomer,
    setReportedBy,
    setReportedByName,
    setBuilding,
    setLocation,
    setAsset,
    setAffectedBy,
    setAffectedUsername,
    setFormValue,
    setOrigRecord,
    setOwnerGroup,
    setOwner,
    setEndCustomer,
    setCostCode,
    setClientApprover
  } = useFormModel(sr, values => handleChange(ticketId, values))

  const [registry] = useRegistry()

  const defaultBusUnits = [
    { description: 'Choose a Business Unit', value: '' },
    ...registry?.businessUnit
  ]

  const [newBusinessUnits, setBusinessUnits] = useState(defaultBusUnits)

  const [actualData, SetActualData] = useState()

  const [showWarningPopup, SetShowWaringPopup] = useState(false)
  let checkReportedList = null
  let checkAffectedList = null
  let checkCustomerListSelect = null
  let checkEndCustomerListSelect = null
  let checkBuildingList = null
  let checkLocationList = null
  let checkOwnerList = null
  let checkOwnerGroupList = null

  const [openModalOnBlur, setOpenModalOnBlur] = useState(false)
  const [, setSearchParams, response, hasnext, showAddPopup] = useSearch(api, config.search)

  const { state, loadObject } = useControlledObject({
    options: config.search
  })

  const [statusError, setStatusError] = useState({
    action: false,
    message: ''
  })

  const setTicketOwnerCb = ({ data }) => {
    if (data) {
      setOwner({ ...data?.member?.[0] })
    }
  }

  const [capWarning, setCapWarning] = useState({
    action: false,
    message: ''
  })

  /**
   * update siteid
   */

  useEffect(() => {
    if (sr) {
      fromMaximo(sr)
    }
    if (sr?.ticketid && localStorage.getItem(sr?.ticketid)) {
      fromMaximoActData(JSON.parse(localStorage.getItem(sr?.ticketid)))
    }
  }, [JSON.stringify(sr)])

  useEffect(() => {
    const pelBusUnits = sr?.tkserviceaddress?.[0]?.pelsabusunit || []
    if (sr?.ticketid && pelBusUnits?.length) {
      setBusinessUnits(transformBusUnitForDropdown(pelBusUnits, defaultBusUnits))
    }

    if (sr?.ticketid && sr?.owner) {
      const params = {
        searchTerms: sr.owner
      }

      loadObject('pelperson', params, setTicketOwnerCb)
    }
  }, [sr?.ticketid])

  const compareJSON = newData => {
    const editedSR = localStorage.getItem('editedSR')
      ? JSON.parse(localStorage.getItem('editedSR'))
      : []
    const isEdited = JSON.stringify(originaldata) !== JSON.stringify(newData)
    if (isEdited) {
      if (!editedSR?.includes(originaldata?.ticketid)) {
        editedSR.push(originaldata?.ticketid)
        localStorage.setItem('editedSR', JSON.stringify(editedSR))
      }
    } else {
      const index = editedSR?.indexOf(originaldata?.ticketid)
      if (index > -1) {
        editedSR.splice(index, 1)
        localStorage.setItem('editedSR', JSON.stringify(editedSR))
      }
    }
  }

  useEffect(() => {
    if (!actualData?.ticketid) {
      SetActualData(form)
    }
    if (!loading && form.ticketid === originaldata.ticketid) {
      compareJSON(form)
    }
  }, [form])

  
  const isFieldReadOnly =
    (readOnly || !form?.pluspcustomer?.[0]?.pelknownascust) &&
    !['IN', 'CP', 'CC'].includes(form.pelsrtype)

    const [toggleControl, getControlProps, controls] = useControls({
    longDescForm: {
      active: false,
      props: null
    },
    customerWarn: {
      active: false,
      props: null
    },
    createPersonForm: {
      active: false,
      props: null
    },
    warnPerson: {
      active: false,
      props: null
    },
    warnBusinessUnit: {
      active: false,
      props: null
    }
  })

  const [createAffectedPerson, setCreateAffectedPerson] = useState(false)

    const assignNewPerson = person => {
    if (person && person?.personid) {
      return createAffectedPerson ? setAffectedBy(person) : setReportedBy(person)
    }
  }

  const placeholders = getAffectedPlaceHolders(form)

  const isInvalid = (name, errors) => errors.find(error => error.field === name)

    const openSR = (href, ticketuid) => () => {
    const [path] = href.split('/oslc/')

    window.open(
      `${path}/ui/login?login=url&event=loadapp&value=pelpluspsr&uniqueid=${ticketuid}`,
      '_blank',
      'noopener noreferrer'
    )
  }

    const handleLocationChange = ({ selectedItem }) => {
    checkLocationList = true
    if (!selectedItem) return setLocation('')
    return setLocation(selectedItem)
  }

  const setBusinessUnitFromServiceAddress = (busUnits, defaultBusUnit = '') => {
    setBusinessUnits(transformBusUnitForDropdown(busUnits, defaultBusUnits))
    if (busUnits.length === 1) {
      setFormValue('pelbusunit', busUnits?.[0]?.busunit)
    } else {
      const hasFound = busUnits?.filter(({ busunit = '' }) => busunit === defaultBusUnit) || []

      if (!hasFound?.length) {
        const highestRankBusUnit = busUnits?.sort((a, b) => a.rank - b.rank)?.[0]?.busunit
        setFormValue('pelbusunit', highestRankBusUnit)
        
        toggleControl('warnBusinessUnit')
      } else {
        setFormValue('pelbusunit', defaultBusUnit)
      }
    }
  }

    const handleBuildingChange = ({ selectedItem }) => {
    checkBuildingList = true
    if (!selectedItem) return setBuilding('')

    const locBusUnits = selectedItem?.serviceaddress?.[0]?.pelsabusunit ?? []

    if (locBusUnits.length) {
      setBusinessUnitFromServiceAddress(locBusUnits, selectedItem?.pluspprimarycust?.peldefbusunit)
    }
    const selectedBuilding = selectedItem
    selectedBuilding.pellocpclookup.isSelected = true

    return setBuilding(selectedBuilding)
  }

  /**
   * Update customer value.
   * Bypass the dialog with the bypassCheck argument set to true.
   */
  const handleCustomerChange = ({ selectedItem }) => {
    checkCustomerListSelect = true
    if (!selectedItem) return setCustomer('')

    form.pelpomand = !!selectedItem.pelpomand

    // Show a warning before allowing this change to go ahead.

    const containsData =
      form.reportedbyname || form.reportedemail || form.pellocbuilding || form.location

    if (
      form.pluspcustomer?.[0]?.customer &&
      containsData &&
      !form.pluspcustomer?.some(custcontact => custcontact.customer === selectedItem?.customer)
    ) {
      return toggleControl('customerWarn', selectedItem)
    }

    setFormValue('pelbusunit', selectedItem?.peldefbusunit)

    return setCustomer(selectedItem)
  }

  const handleCostCodeChange = ({ selectedItem }) => {
    if (!selectedItem) return setCostCode('')

    //if (watch('mitcostcode') == "APPROVED"){

    
    return setCostCode(selectedItem)
  }

  const handleClientApproverChange = ({ selectedItem }) => {
    if (!selectedItem) return setClientApprover('')
    if (selectedItem.mitcaperson == form.reportedby) {
      return setCapWarning({
        action: true,
        message:
          'Client Approver Person could not be the same as the Service Request Report by Person'
      })
    }

    return setClientApprover(selectedItem)
  }

  const handleClientApprovalStatusChange = e => {
    const {
      target: { value }
    } = e
    setFormValue('mitcareason', '')
    setFormValue('mitcarearej', '')
    setFormValue('mitcastatus', value)
  }

  const handleClientApprovalReason = e => {
    const {
      target: { value }
    } = e
    setFormValue('mitcareason', value)
  }

  const handleEndCustomerChange = ({ selectedItem }) => {
    checkEndCustomerListSelect = true
    const customerInfo = selectedItem?.customerslist

    if (customerInfo?.length === 1) {
      const endcustdata = selectedItem?.customerslist?.[0]
      form.pelpomand = !!endcustdata?.pelpomand

      setFormValue('pelbusunit', customerInfo?.[0]?.peldefbusunit)

      return setEndCustomer({
        customer: customerInfo?.[0]?.customer,
        name: customerInfo?.[0]?.name,
        pelknownascust: selectedItem?.pelknownascust
      })
    }
    return setEndCustomer(selectedItem)
  }

  const getFilteredPluspcustcontact = userselecteditem => {
    return userselecteditem.pluspcustcontact?.filter(customer => {
      if (form.pluspcustomer?.[0]?.customer) {
        return (
          customer?.pluspcustomer?.[0]?.pelknownascust ===
            form.pluspcustomer?.[0]?.pelknownascust &&
          customer?.customer === form.pluspcustomer?.[0]?.customer
        )
      }
      return (
        customer?.pluspcustomer?.[0]?.pelknownascust === form.pluspcustomer?.[0]?.pelknownascust
      )
    })
  }

    const handleLongDescChange = value => {
    setFormValue('description_longdescription', value)
    toggleControl('longDescForm')
  }

    const handleShowRelated = ticketid => () =>
    handleSearchParams(params => ({
      ...params,
      queryParams: {
        savedQuery: '',
        where: `relatedticket.RELATEDRECKEY="${ticketid}"`
      }
    }))

  /** */
  const handleExistingRefChange = ({ selectedItem }) => {
    if (!selectedItem) return setOrigRecord('')

    setOrigRecord(selectedItem)
  }

  const fetchBuilding = ({ building, customer }) => {
    return api.get('/pelos/pellocfull', {
      params: {
        lean: 1,
        savedQuery: 'OPERATING',
        querytemplate: 'BASIC_SEARCH',
        //'oslc.where': `location="${building}%"`
      }
    })
  }

    const handleReportedByChange = ({ selectedItem }) => {
    checkReportedList = true
    if (!selectedItem) return setReportedBy('')

    const userSelectedValue = selectedItem
    if (form.pluspcustomer?.[0]?.pelknownascust) {
      userSelectedValue.pluspcustcontact = getFilteredPluspcustcontact(selectedItem)
    }
    if (userSelectedValue?.pluspcustcontact?.length === 1) {
      form.pelpomand = !!userSelectedValue.pluspcustcontact?.[0]?.pluspcustomer?.[0]?.pelpomand
    }

    if (
      userSelectedValue?.pellocpclookup?.building &&
      userSelectedValue?.pluspcustcontact?.length === 1
    ) {
      if (!selectedItem?.isFocustLost) {
        const customerBusUnit =
          userSelectedValue?.pluspcustcontact?.[0]?.pluspcustomer?.[0]?.peldefbusunit

        fetchBuilding({
          building: userSelectedValue?.pellocpclookup?.building,
          customer: userSelectedValue?.pluspcustcontact?.[0]?.customer
        }).then(result => {
          const customerBuildingData = result?.data?.member ?? []

          if (customerBuildingData?.[0]?.serviceaddress?.[0]?.pelsabusunit) {
            const pelServiceAddressBusUnits =
              customerBuildingData?.[0]?.serviceaddress?.[0]?.pelsabusunit

            setBusinessUnitFromServiceAddress(pelServiceAddressBusUnits, customerBusUnit)
          }
        })
      }
    }

    return setReportedBy(userSelectedValue)
  }

  /**
   * Simplest way to address the above is to introduce another handler.
   */
  const handleReportedByInput = ({ inputValue }) => {
    setReportedByName(inputValue)
  }

  const handleBuildingInput = ({ inputValue }) => {
    const data = {
      pellocpclookup: {
        building: inputValue,
        builddesc: '',
        isSelected: false
      }
    }
    setBuilding(data)
  }

  const handlePelEndCustomerInput = ({ inputValue }) => {
    if (inputValue === '') {
      setEndCustomer({ customer: '', name: '', pelknownascust: '' })
    }
  }
  const handlePelCustomerInput = ({ inputValue }) => {
    if (inputValue === '') {
      setCustomer({
        customer: '',
        name: '',
        pelknownascust: form.pluspcustomer?.[0]?.pelknownascust
      })
    }
  }

  const handleAffectedByChange = ({ selectedItem }) => {
    checkAffectedList = true
    if (!selectedItem) return setAffectedBy('')

    const userSelectedValue = selectedItem
    if (form.pluspcustomer?.[0]?.pelknownascust && userSelectedValue.pluspcustcontact.length > 1) {
      userSelectedValue.pluspcustcontact = getFilteredPluspcustcontact(selectedItem)
    }

    setAffectedBy(userSelectedValue)
  }

  const handleAffectedByInput = ({ inputValue }) => {
    setAffectedUsername(inputValue)
  }

  const handleAssetChange = ({ selectedItem }) => {
    if (!selectedItem) return setAsset('')

    setAsset(selectedItem)
  }

  const handleOwnerGroup = ({ selectedItem }) => {
    checkOwnerGroupList = true
    if (!selectedItem) return setOwnerGroup({ persongroup: '', description: '' })

    return setOwnerGroup(selectedItem)
  }

  const handleOwner = ({ selectedItem }) => {
    checkOwnerList = true
    if (!selectedItem) return setOwner({ personid: '', displayname: '' })

    return setOwner(selectedItem)
  }

  const handleOwnerChange = ({ inputValue }) => {
    if (inputValue === '') {
      setOwnerGroup({ persongroup: '', description: '' })
      setOwner({ personid: '', displayname: '' })
    }
  }

  const handleOwnerGroupChange = ({ inputValue }) => {
    if (inputValue === '') {
      setOwnerGroup({ persongroup: '', description: '' })
      setOwner({ personid: '', displayname: '' })
    }
  }
  /**
   * Intermediary handler to bridge dialog
   * with customer change handler.
   */
  const commitCustomerChange = () => {
    const selectedItem = getControlProps('customerWarn')

    toggleControl('customerWarn')
    setCustomer(selectedItem)
  }

    const handleFieldChange = name => e => {
    const {
      target: { value }
    } = e

    
    switch (name) {
      case 'reportedphone':
      case 'affectedphone':
        setFormValue(name, formatTelephoneNo(value))
        break
      default:
        setFormValue(name, value)
        break
    }

    if (name === 'pelbusunit') {
      setFormValue('pelbusunit', value)
    }
  }

  const renderPopup = value => {
    SetShowWaringPopup(value)
  }

  const getFormattedAddress = address => {
    if (!address) return ''

    let addr = `${address.description},`
    const newline = String.fromCharCode(13, 10)
    if (address.addressline2) addr += `${newline}${address.addressline2},`
    if (address.addressline3) addr += `${newline}${address.addressline3},`
    addr += `${newline}${address.city}, ${address.postalcode}`

    return addr
  }

  const blurEndCustomerResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items.length === 1) {
      handleEndCustomerChange({ selectedItem })
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkEndCustomerListSelect && form.pluspcustomer?.[0]?.pelknownascust === 0)
          setEndCustomer({ customer: '', name: '', pelknownascust: '' })
      }, 1000)
    }
  }
  const blurCustomerResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items.length === 1) {
      handleCustomerChange({ selectedItem })
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkCustomerListSelect && form.pluspcustomer?.[0]?.customer === 0)
          setCustomer({ customer: '', name: '' })
      }, 1000)
    }
  }
  const setReportedByPersonOnFocusLost = (e, items) => {
    setOpenModalOnBlur(showWarningPopup)
    const selectedItem = items?.[0]
    if (items.length === 1) {
      const data = {
        selectedItem: {
          ...selectedItem,
          isFocustLost: true
        }
      }

      handleReportedByChange(data)
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkReportedList && form.reportedby === '') setReportedByName('')
      }, 1000)
    }
  }

  const setAffectedByPersonOnFocusLost = (e, items) => {
    const selectedItem = items?.[0]
    if (items.length === 1) {
      handleAffectedByChange({ selectedItem })
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkAffectedList && form.affectedusername === '') setAffectedBy('')
      }, 1000)
    }
  }

  const blurBuildingResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items.length === 1) {
      handleBuildingChange({ selectedItem })
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkBuildingList && form.buildingDesc === '') setBuilding('')
      }, 1000)
    }
  }

  const blurLocationResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items.length === 1) {
      handleLocationChange({ selectedItem })
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkLocationList && form.location !== '') setLocation('')
      }, 1000)
    }
  }

  const blurOwnerResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items?.length === 1) {
      handleOwner({ selectedItem })
    }
    if (items?.length > 1) {
      setTimeout(() => {
        if (!checkOwnerList && form.owner === '') setOwner({ personid: '', displayname: '' })
      }, 1000)
    }
  }

  const blurOwnerGroupResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items?.length === 1) {
      handleOwnerGroup({ selectedItem })
    }
    if (items?.length > 1) {
      setTimeout(() => {
        if (!checkOwnerGroupList && form.owner === '')
          setOwnerGroup({ persongroup: '', description: '' })
      }, 1000)
    }
  }

  if (!form.pelpomand && sr?.pluspcustomer?.[0]?.pelpomand) {
    form.pelpomand = sr.pluspcustomer?.[0]?.pelpomand
  }

  const getPersonQuery = () => {
    if (form.pluspcustomer?.[0]?.customer)
      return `pluspcustcontact.customer="${form.pluspcustomer?.[0]?.customer}"`
    if (form.pluspcustomer?.[0]?.pelknownascust)
      return `pluspcustcontact.pluspcustcontact.pelknownascust="${form.pluspcustomer?.[0]?.pelknownascust}"`

    return ''
  }

  const checkBUReadOnly = ['IN', 'CC', 'CP'].includes(sr?.pelsrtype)
    ? !form?.pluspcustomer?.[0]?.pelknownascust && !form?.pellocbuilding
    : false

  useEffect(() => {
    if (isCreateLayout) {
      if (!form?.pluspcustomer?.[0]?.pelknownascust && !form?.pellocbuilding) {
        if (['IN', 'CC', 'CP'].includes(sr?.pelsrtype)) {
          if (defaultBusUnits?.length === 1) {
            setFormValue('pelbusunit', defaultBusUnits[0].value)
          }
        } else {
          setFormValue('pelbusunit', '')
        }
      }
    }
  }, [sr?.pelsrtype])

  const [{ clientRejectReasons = [], clientReassignReasons = [] }] = useRegistry()
  const clientRejectReasonsList = [
    { value: '', description: 'Select a Reason' },
    ...clientRejectReasons
  ]

  const clientReassignReasonsList = [
    { value: '', description: 'Select a Reason' },
    ...clientReassignReasons
  ]

  const buildingErrorClass =
    ['IN', 'CC', 'CP'].includes(sr?.pelsrtype) &&
    form?.pluspcustomer?.[0]?.pelknownascust &&
    !form?.pellocbuilding
      ? 'building-error'
      : ''

  const withFormObject = BaseComponent => ({ objectType, query, ...props }) => {
    const { loading, data, error } = useObject(api, objectType, query)

    if (loading) return <Loading />

    return <BaseComponent data={data} mitcateam={sr?.mitcateam} error={error} {...props} />
  }
  const PersonApWithFormObject = withFormObject(PersonInfo)

  let approvalStatusChange = true

  if (originaldata.mitiscareq && originaldata.mitcapersonid) {
    approvalStatusChange = true
  } else if (
    !originaldata.mitcateam &&
    ((originaldata.mitisccreq && !originaldata.mitcostcode) ||
      (originaldata.mitiscareq && !originaldata.mitcapersonid))
  ) {
    approvalStatusChange = false
  }

  const getApprovalStatusItems = () => {
    const options = [<SelectItem text="" value="" key={0} />]

    Object.keys(ApprovalStatues).forEach((status, index) => {
      const key = index + 1

      if ([ApprovalStatues.WAITAPP, ApprovalStatues.INVALIDCC].includes(status)) {
        if (status === originaldata.mitcastatus) {
          options.push(<SelectItem text={status} value={status} key={key} />)
        }
      } else {
        options.push(<SelectItem text={status} value={status} key={key} />)
      }
    })

    return options
  }

  const getReasonItems = () => {
    const reasonLists = {
      REJECTED: clientRejectReasonsList,
      REASSIGNED: clientReassignReasonsList
    }

    const options = []
    const reasons = reasonLists[form.mitcastatus] ?? []

    reasons.forEach(({ value = '', description = '' }) =>
      options.push(
        <SelectItem
          key={`clientreason-${value}`}
          value={value}
          text={value ? `${value}: ${description}` : `${description}`}
        />
      )
    )

    const reason = form.mitcareason

    if (reason && reason !== 'OTHER' && !reasons.includes(reason)) {
      options.push(<SelectItem key="clientreason-0" value={reason} text={reason} />)
    }

    return options
  }

  const readOnlyStatus = [ApprovalStatues.APPROVED, ApprovalStatues.REJECTED].includes(
    originaldata.mitcastatus
  )

  return (
    <>
      <Form>
        <div className={`${buildingErrorClass} bx--row`}>
          <div className="bx--col-lg-10">
            <div className="bx--row">
              <div className="bx--col-lg-6 flex bx--no-gutter">
                {(!isCreateLayout || sr?.ticketid) && (
                  <>
                    <div className="bx--col-lg-6">
                      <PelTextInput
                        {...getInputProps('ticketid')}
                        hidden={!sr?.ticketid}
                        defaultValue={sr?.ticketid}
                        showSkeleton={loading}
                        buttons={
                          !loading && [
                            <Button
                              key="opensr"
                              renderIcon={Launch16}
                              kind="tertiary"
                              iconDescription="Open SR"
                              tooltipPosition="top"
                              hasIconOnly
                              size="small"
                              onClick={openSR(sr?.href, sr?.ticketuid)}
                            />,
                            !isCreateLayout && (
                              <Button
                                key="findrelatedsr"
                                renderIcon={Link16}
                                kind="tertiary"
                                iconDescription="Find Related"
                                tooltipPosition="top"
                                hasIconOnly
                                size="small"
                                onClick={handleShowRelated(sr?.ticketid)}
                              />
                            )
                          ]
                        }
                      />
                    </div>
                    <div className="bx--col-lg-6">
                      <PelDateInput
                        {...getInputProps('reportdate')}
                        hidden={!sr?.ticketid}
                        date={sr?.reportdate}
                        showSkeleton={loading}
                        format="d-M-Y"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="bx--col-lg-6">
                <PelTextInput
                  {...getInputProps('description')}
                  value={form?.description}
                  onChange={handleFieldChange('description')}
                  showSkeleton={loading}
                  buttons={
                    !loading && (
                      <Button
                        className="bx--btn--sm bx--btn--icon-only no-border bx--btn bx--btn--tertiary"
                        onClick={() => toggleControl('longDescForm')}
                      >
                        <Document16 />
                      </Button>
                    )
                  }
                  readOnly={isFieldReadOnly}
                />
              </div>
            </div>

            <div className="bx--row">
              <div className="bx--col-lg-6">
                <TypeAhead
                  {...getInputProps('pelknownascust[0].pelknownascust')}
                  objectType="pelcustomer"
                  autoFocus
                  searchResult={item => <CustomerSearchResult customer={item} pelKnownAsCust />}
                  itemToString={item => item?.pelknownascust || ''}
                  onSelectedItemChange={handleEndCustomerChange}
                  selectedItem={{
                    pelknownascust: form?.pluspcustomer?.[0]?.pelknownascust || ''
                  }}
                  handleInputChange={handlePelEndCustomerInput}
                  onFocusLost={blurEndCustomerResultsEvent}
                  invalid={
                    isInvalid('pelknownascust', errors) || !form?.pluspcustomer?.[0]?.pelknownascust
                  }
                  showDescription
                  description={form?.pluspcustomer?.[0]?.pelknownascust}
                  showSkeleton={loading}
                  initialInputValue=""
                  readOnly={!isCreateLayout || sr?.origrecordid}
                  labelText="Customer Known As"
                  pelKnownAsCust
                />

                <fieldset>
                  <legend>Reported By</legend>
                  <TypeAhead
                    {...getInputProps('reportedbyname')}
                    objectType="pelperson"
                    searchResult={item => <PersonSearchResult person={item} />}
                    itemToString={item => item?.displayname || ''}
                    selectedItem={{ displayname: form.reportedbyname }}
                    onSelectedItemChange={handleReportedByChange}
                    handleInputChange={handleReportedByInput}
                    showCreateButton={isCreateLayout && form?.pluspcustomer?.[0]?.customer}
                    onFocusLost={setReportedByPersonOnFocusLost}
                    handleCreateNew={() => {
                      toggleControl('createPersonForm')
                      setCreateAffectedPerson(false)
                    }}
                    queryParams={{
                      where: getPersonQuery(),
                      select: config.search.pelperson.fields
                    }}
                    invalid={isInvalid('reportedbyname', errors)}
                    showSkeleton={loading}
                    showAddPopup={showAddPopup}
                    renderPopup={renderPopup}
                    readOnly={readOnly}
                    labelText="Name"
                  />

                  <PelTextInput
                    {...getInputProps('reportedemail')}
                    value={form.reportedemail}
                    invalid={!isFieldReadOnly && !form.reportedemail && !form.reportedphone}
                    onChange={handleFieldChange('reportedemail')}
                    showSkeleton={loading}
                    readOnly={isFieldReadOnly}
                    labelText="E-Mail"
                  />

                  <PelTextInput
                    {...getInputProps('reportedphone')}
                    value={form.reportedphone}
                    invalid={!isFieldReadOnly && !form.reportedemail && !form.reportedphone}
                    onChange={handleFieldChange('reportedphone')}
                    showSkeleton={loading}
                    onlyNumeric
                    readOnly={isFieldReadOnly}
                    labelText="Phone"
                  />
                </fieldset>

                <LocationSearchInput
                  {...getInputProps('pellocbuilding')}
                  onSelectedItemChange={handleBuildingChange}
                  invalid={
                    isInvalid('pellocbuilding', errors) ||
                    (form?.pelsrtype === 'RW' && !form?.pellocbuilding) ||
                    (['IN', 'CC', 'CP'].includes(sr?.pelsrtype) && !form?.pellocbuilding)
                  }
                  showSkeleton={loading}
                  readOnly={
                    (form.ticketid && sr?.status !== 'WAPPR') ||
                    (form.origrecordid && (form.pelsrtype === 'CH' || form.pelsrtype === 'RC')) ||
                    false
                  }
                  queryParams={{
                    where: getProcessedQuery({
                      'pluspprimarycust.pelknownascust': form?.pluspcustomer?.[0]?.pelknownascust,
                      type: 'building',
                      siteid: form?.siteid,
                      pluspcustomer: form.pluspcustomer?.[0]?.customer
                    })
                  }}
                  onFocusLost={blurBuildingResultsEvent}
                  description={
                    form.buildingDesc ||
                    sr?.pellocpclookup?.[0]?.builddesc ||
                    sr?.locations?.[0]?.description
                  }
                  selectedItem={{ location: form.pellocbuilding, description: form.buildingDesc }}
                  itemToString={item => item?.location || ''}
                  location=""
                  building=""
                  handleInputChange={handleBuildingInput}
                />

                <LocationSearchInput
                  {...getInputProps('location')}
                  onSelectedItemChange={handleLocationChange}
                  readOnly={
                    !form?.pluspcustomer?.[0]?.pelknownascust ||
                    (form.ticketid && sr?.status !== 'WAPPR') ||
                    (form.origrecordid && (form.pelsrtype === 'CH' || form.pelsrtype === 'RC')) ||
                    false
                  }
                  showSkeleton={loading}
                  selectedItem={{ location: form.location }}
                  itemToString={item => item?.location || ''}
                  building={form?.selected?.pellocbuilding?.isSelected ? form?.pellocbuilding : ''}
                  location={form.location || sr?.locations?.[0]?.location || ''}
                  description={form.locationDesc || sr?.locations?.[0]?.description}
                  onFocusLost={blurLocationResultsEvent}
                  queryParams={{
                    where: getProcessedQuery({
                      'pluspprimarycust.pelknownascust': form?.pluspcustomer?.[0]?.pelknownascust,
                      siteid: form?.siteid,
                      pluspcustomer: form.pluspcustomer?.[0]?.customer
                    })
                  }}
                />

                <TypeAhead
                  {...getInputProps('pluspcustomer[0].customer')}
                  objectType="pelcustomer"
                  labelText="Customer"
                  searchResult={item => <CustomerSearchResult customer={item} />}
                  itemToString={item => item?.customer || ''}
                  onSelectedItemChange={handleCustomerChange}
                  selectedItem={{
                    customer: form.pluspcustomer?.[0]?.customer || '',
                    name: form.pluspcustomer?.[0]?.name || ''
                  }}
                  handleInputChange={handlePelCustomerInput}
                  onFocusLost={blurCustomerResultsEvent}
                  invalid={
                    (!readOnly && isInvalid('pluspcustomer', errors)) || !form?.pluspcustomer
                  }
                  showDescription
                  description={form.pluspcustomer?.[0]?.name}
                  showSkeleton={loading}
                  initialInputValue=""
                  readOnly={isFieldReadOnly || !isCreateLayout || sr?.origrecordid}
                  queryParams={{
                    ...(form?.pluspcustomer?.[0]?.pelknownascust && {
                      where: `pelknownascust="${form?.pluspcustomer?.[0]?.pelknownascust}"`
                    })
                  }}
                />
                {form.mitisccreq && (
                  <>
                    <Checkbox
                      id="mitisccreq"
                      name="mitisccreq"
                      labelText="Cost Code Required?"
                      checked={form.mitisccreq}
                      disabled
                    />

                    <div className="bx--cap">
                      <TypeAhead
                        {...getInputProps('mitcostcode')}
                        disabled={!sr?.ticketid}
                        objectType="mitcclist"
                        labelText="Cost Code / WBS Code"
                        initialInputValue=""
                        readOnly={!form.mitisccreq || readOnlyStatus}
                        selectedItem={{
                          mitcostcode: form.mitcostcode,
                          description: form.mitccdesc
                        }}
                        selectedItemsOnly
                        searchResult={item => <CostCodeSearchResult costcode={item} />}
                        itemToString={item => item?.mitcostcode || ''}
                        showDescription
                        queryParams={{
                          where: `mitclientcode="${form.pluspcustomer?.[0]?.customer}"`
                        }}
                        description={form?.mitccdesc ?? ''}
                        showSkeleton={loading}
                        onSelectedItemChange={handleCostCodeChange}
                      />
                    </div>
                  </>
                )}

                {form.mitiscareq && (
                  <>
                    <div className="bx--as">
                      <Select
                        id="mitcastatus"
                        name="mitcastatus"
                        disabled={
                          !sr?.ticketid ||
                          !form.mitiscareq ||
                          ['CANCELLED', 'REJECTED'].includes(form.status) ||
                          [
                            ApprovalStatues.APPROVED,
                            ApprovalStatues.REJECTED,
                            ApprovalStatues.INVALIDCC
                          ].includes(originaldata.mitcastatus) ||
                          !approvalStatusChange
                        }
                        labelText="Approval Status"
                        value={form.mitcastatus}
                        onChange={handleClientApprovalStatusChange}
                      >
                        {getApprovalStatusItems()}
                      </Select>

                      <Select
                        id="mitcareason"
                        name="mitcareason"
                        labelText="Reason"
                        value={form.mitcareason}
                        disabled={
                          form.mitcastatus === 'APPROVED' ||
                          originaldata.mitcastatus === 'REJECTED' ||
                          form.mitcastatus === '' ||
                          !form.mitiscareq
                        }
                        onChange={handleClientApprovalReason}
                        invalid={
                          [ApprovalStatues.REJECTED, ApprovalStatues.REASSIGNED].includes(
                            form.mitcastatus
                          ) && !form.mitcareason
                        }
                      >
                        {getReasonItems()}
                      </Select>

                      {(form.mitcastatus === 'REJECTED' || form.mitcastatus === 'REASSIGNED') &&
                        form.mitcareason === 'OTHER' && (
                          <>
                            <PelTextInput
                              {...getInputProps('mitcarearej')}
                              value={form.mitcarearej}
                              onChange={handleFieldChange('mitcarearej')}
                              showSkeleton={loading}
                              labelText="Other Reason"
                              disabled={originaldata.mitcastatus === 'REJECTED'}
                              invalid={
                                [ApprovalStatues.REJECTED, ApprovalStatues.REASSIGNED].includes(
                                  form.mitcastatus
                                ) &&
                                form.mitcareason === 'OTHER' &&
                                !form.mitcarearej
                              }
                            />
                          </>
                        )}
                    </div>
                  </>
                )}
              </div>
              <div className="bx--col-lg-6">
                <div className="bx--row">
                  <div className="bx--col-lg-12">
                    <ExistingRefInput
                      {...getInputProps('origrecordid')}
                      onSelectedItemChange={handleExistingRefChange}
                      selectedItem={{ ticketid: form.origrecordid }}
                      pluspcustomer={form.pluspcustomer}
                      loading={loading || false}
                      description={form.origrecordDesc || sr?.pelorigsr?.[0]?.description}
                      handleSelectTicket={handleSelectTicket}
                      statusTypes={statusTypes}
                      hidden={false}
                      readOnly={!isCreateLayout}
                    />
                  </div>
                </div>

                <fieldset>
                  <legend>Affected Person</legend>
                  <TypeAhead
                    {...getInputProps('affectedusername')}
                    objectType="pelperson"
                    placeholder={placeholders.affectedusername}
                    searchResult={item => <PersonSearchResult person={item} />}
                    itemToString={item => item?.displayname || ''}
                    selectedItem={{ displayname: form.affectedusername }}
                    onSelectedItemChange={handleAffectedByChange}
                    showCreateButton={isCreateLayout && form?.pluspcustomer?.[0]?.customer}
                    onFocusLost={setAffectedByPersonOnFocusLost}
                    handleCreateNew={() => {
                      toggleControl('createPersonForm')
                      setCreateAffectedPerson(true)
                    }}
                    handleInputChange={handleAffectedByInput}
                    queryParams={{
                      where: getPersonQuery(),
                      select: config.search.pelperson.fields
                    }}
                    showSkeleton={loading}
                    readOnly={isFieldReadOnly}
                    labelText="Name"
                  />

                  <PelTextInput
                    {...getInputProps('affectedemail')}
                    placeholder={placeholders.affectedemail}
                    value={form.affectedemail}
                    onChange={handleFieldChange('affectedemail')}
                    showSkeleton={loading}
                    readOnly={isFieldReadOnly}
                    labelText="E-Mail"
                  />

                  <PelTextInput
                    {...getInputProps('affectedphone')}
                    placeholder={placeholders.affectedphone}
                    onChange={handleFieldChange('affectedphone')}
                    value={form.affectedphone}
                    showSkeleton={loading}
                    onlyNumeric
                    readOnly={isFieldReadOnly}
                    labelText="Phone"
                  />
                </fieldset>
                <div className="pel--combo-box has-description">
                  <BusinessUnitInput
                    pelbusunit={form.pelbusunit || sr?.pelbusunit}
                    busUnits={newBusinessUnits}
                    handleChange={handleFieldChange('pelbusunit')}
                    showSkeleton={loading}
                    invalid={!form?.pelbusunit && checkBUReadOnly}
                    readOnly={
                      (isFieldReadOnly ||
                        !form.pelbusunit ||
                        !form.siteid ||
                        form?.origrecordid ||
                        (!isCreateLayout && sr?.ticketid)) &&
                      !checkBUReadOnly
                    }
                  />
                </div>

                <TypeAhead
                  {...getInputProps('assetnum')}
                  objectType="pelasset"
                  initialInputValue={form.asset}
                  readOnly={
                    !form?.pluspcustomer?.[0]?.pelknownascust ||
                    readOnly ||
                    !form.location ||
                    (form.origrecordid && (form.pelsrtype === 'CH' || form.pelsrtype === 'RC'))
                  }
                  selectedItem={{ assetnum: form.assetnum, description: form.assetDesc }}
                  selectedItemsOnly
                  searchResult={item => <AssetSearchResult asset={item} />}
                  itemToString={item => item?.assetnum || ''}
                  showDescription
                  queryParams={{
                    where: `location="${form.location}"`,
                    ...{
                      and: getProcessedQuery({
                        siteid: form?.siteid
                      })
                    }
                  }}
                  description={form.assetDesc}
                  showSkeleton={loading}
                  onSelectedItemChange={handleAssetChange}
                />

                <PelTextArea
                  {...getInputProps('locadd')}
                  value={form.locadd || getFormattedAddress(sr?.tkserviceaddress?.[0])}
                  showSkeleton={loading}
                />

                <div className="bx--row">
                  <div className="bx--col-lg-6">
                    <PelTextInput
                      {...getInputProps('pelclientref')}
                      value={form.pelclientref}
                      onChange={handleFieldChange('pelclientref')}
                      showSkeleton={loading}
                      readOnly={isFieldReadOnly}
                    />
                  </div>
                  <div className="bx--col-lg-6 bx--cap">
                    {!!form.pelpomand && (
                      <PelTextInput
                        {...getInputProps('pluspcustponum')}
                        value={form.pluspcustponum}
                        onChange={handleFieldChange('pluspcustponum')}
                        showSkeleton={loading}
                        invalid={
                          (form.pelpomand && isInvalid('pluspcustponum', errors)) ||
                          (form.pluspcustomer && form.pelpomand && !form.pluspcustponum)
                        }
                        readOnly={isFieldReadOnly}
                        labelText="Customer Authorisation (WO/PO)"
                      />
                    )}
                  </div>
                </div>
                <TypeAhead
                  {...getInputProps('owner')}
                  hidden={!['CP', 'CC', 'IN'].includes(form.pelsrtype)}
                  labelText="Owner"
                  objectType="pelperson"
                  initialInputValue={form.owner}
                  itemToString={item => item?.displayname || ''}
                  selectedItem={{ displayname: form.ownerDesc, personid: form.owner }}
                  selectedItemsOnly
                  searchResult={item => <PersonSearchResult person={item} />}
                  showDescription
                  description={form.ownerDesc}
                  showSkeleton={loading || state.loading}
                  onFocusLost={blurOwnerResultsEvent}
                  onSelectedItemChange={handleOwner}
                  handleInputChange={handleOwnerChange}
                  readOnly={isFieldReadOnly}
                />

                {form.mitiscareq && (
                  <>
                    <Checkbox
                      id="mitiscareq"
                      name="mitiscareq"
                      labelText="Client Approval Required?"
                      checked={form.mitiscareq}
                      disabled
                    />

                    <div className="bx--cap">
                      <TypeAhead
                        {...getInputProps('mitcaperson')}
                        disabled={
                          !sr?.ticketid ||
                          (originaldata.mitcapersonid &&
                            form.mitcastatus &&
                            form.mitcastatus !== 'REASSIGNED') ||
                          form.mitcateam
                        }
                        objectType="mitdoalist"
                        labelText="Client Approver Person"
                        initialInputValue=""
                        readOnly={!form.mitiscareq || readOnlyStatus}
                        selectedItem={{
                          mitcaperson: form.mitcapersonid,
                          mitdisplayname: form.mitcadesc
                        }}
                        selectedItemsOnly
                        searchResult={item => <ClientApproverSearchResult clientapprover={item} />}
                        itemToString={item => item?.mitcaperson || ''}
                        showDescription
                        queryParams={{
                          where: `mitcustomer="${form.pluspcustomer?.[0]?.customer}"`,
                          'oslc.pageSize': '100'
                        }}
                        description={form?.mitcadesc ?? ''}
                        showSkeleton={loading}
                        onSelectedItemChange={handleClientApproverChange}
                      />
                    </div>

                    <PelTextInput
                      {...getInputProps('mitcateam')}
                      readOnly
                      showSkeleton={loading}
                      name="mitcateam"
                      labelText="Client Approver Team"
                      value={form.mitcateam}
                    />

                    <PersonApWithFormObject
                      objectType="mitpersongroup"
                      query={`oslc.select=persongroupid,persongroupteam{person{personid,displayname,email{emailaddress}}}&oslc.where=persongroup="${sr?.mitcateam}"`}
                      readOnly={readOnly}
                      hideCreateButton={readOnly}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          {isCreateLayout ? (
            <div className="bx--col-lg-2">
              <ServiceRequestType
                handleTypeChange={handleTypeChange}
                origrecordid={sr?.origrecordid}
                pelsrtype={sr?.pelsrtype}
                pelsrsubtype={sr?.pelsrsubtype}
                ticketId={ticketId}
                readOnly={readOnly}
              />
            </div>
          ) : (
            <div className="bx--col-lg-2">
              <InfoPanel sr={sr} loading={!sr?.ticketid} />
            </div>
          )}
        </div>
      </Form>
      <Modal
        open={capWarning.action}
        modalHeading="Client Approver Person"
        passiveModal
        onRequestClose={() =>
          setCapWarning({
            action: false,
            message: ''
          })
        }
      >
        {capWarning.message}
      </Modal>
      <Modal
        open={controls.customerWarn.active}
        modalHeading="Are you sure?"
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={commitCustomerChange}
        onRequestClose={() => toggleControl('customerWarn')}
      >
        You have already entered customer specific details (e.g. Reported By Person, Building
        Location). Are you sure you want to reset these values and change customer?
      </Modal>
      <Modal
        size="sm"
        open={controls.warnBusinessUnit.active}
        modalHeading="Warning"
        primaryButtonText="Ok"
        onRequestSubmit={() => toggleControl('warnBusinessUnit')}
        onRequestClose={() => toggleControl('warnBusinessUnit')}
      >
        <p>Business Unit has been chosen through service address business unit ranking</p>
      </Modal>
      <Modal
        open={openModalOnBlur}
        modalHeading="Alert"
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={() => {
          SetShowWaringPopup(false)
          setOpenModalOnBlur(false)
          toggleControl('createPersonForm')
          setCreateAffectedPerson(!!form?.reportedby)
        }}
        onRequestClose={() => {
          setOpenModalOnBlur(false)
          SetShowWaringPopup(false)
        }}
      >
        Person record does not exist. Do you want to create a new person record?
      </Modal>
      <CreatePersonModal
        open={controls.createPersonForm.active}
        onRequestClose={person => {
          assignNewPerson(person)
          toggleControl('createPersonForm')
        }}
        pluspcustomer={form.pluspcustomer}
        pelbusunit={form.pelbusunit || sr?.pelbusunit || pelbusunit}
      />
      <LongDescriptionForm
        modalProps={{
          open: controls.longDescForm.active,
          onRequestClose: () => toggleControl('longDescForm')
        }}
        value={form.description_longdescription}
        handleSubmit={handleLongDescChange}
        readOnly={readOnly}
      />
    </>
  )
}

EditPanel.propTypes = {
  busunit: PropTypes.string,
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  personid: PropTypes.string,
  getInputProps: PropTypes.func,
  handleChange: PropTypes.func,
  handleSearchParams: PropTypes.func,
  handleCriteriaChange: PropTypes.func,
  handleSelectTicket: PropTypes.func,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  sr: PropTypes.shape({
    pluspcustomer: PropTypes.any,
    status: PropTypes.string,
    owner: PropTypes.string,
    pelorigsr: PropTypes.any,
    classstructure: PropTypes.arrayOf(
      PropTypes.shape({
        classstructureid: PropTypes.string
      })
    ),
    pelreportashs: PropTypes.any,
    pelreportascrit: PropTypes.any,
    description: PropTypes.string,
    description_longdescription: PropTypes.string,
    origrecordid: PropTypes.string,
    pelsrtype: PropTypes.string,
    pelsrsubtype: PropTypes.string,
    internalpriority: PropTypes.any,
    location: PropTypes.any,
    locations: PropTypes.any,
    pellocpclookup: PropTypes.arrayOf(
      PropTypes.shape({
        builddesc: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string
      })
    ),
    pellocbuilding: PropTypes.string,
    assetnum: PropTypes.string,
    reportdate: PropTypes.string,
    ticketspec: PropTypes.arrayOf(PropTypes.shape({})),
    href: PropTypes.string,
    ticketid: PropTypes.string,
    tkserviceaddress: PropTypes.any,
    ticketuid: PropTypes.any,
    pelbusunit: PropTypes.string
  }),
  ticketId: PropTypes.string,
  pelbusunit: PropTypes.string,
  busUnits: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  ),
  userPluspcustomer: PropTypes.string,
  statusTypes: PropTypes.arrayOf(
    PropTypes.shape({
      maxvalue: PropTypes.string,
      value: PropTypes.string,
      description: PropTypes.string
    })
  ),
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      message: PropTypes.string
    })
  ),
  isCreateLayout: PropTypes.bool,
  readOnly: PropTypes.bool,
  handleTypeChange: PropTypes.func
}
