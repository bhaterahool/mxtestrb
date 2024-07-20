import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Select, SelectItem, DatePicker, DatePickerInput, TextInput } from 'carbon-components-react'
import { useForm, FormProvider } from 'react-hook-form'
import _ from 'lodash'
import moment from 'moment'
import Collapsible from 'react-collapsible'
import { TypeAhead } from '../containers'
import { ServiceRequestTypes, SRStatusList, AdvancedSearchOptionalFields } from '../../constants'
import { AdvancedConfigModal } from './AdvancedConfigModal'
import { AssetSearchResult } from "../../components/AssetSearchResult"
import { PersonSearchResult } from "../../components/PersonSearchResult"
import { CustomerSearchResult } from "../../components/CustomerSearchResult"
import { LocationSearchResultSmall } from '../../components/LocationSearchResultSmall'

export const SearchAdvanced = ({ onSubmit, onReset }) => {

  const {
    formState,
    register,
    setValue,
    getValues,
    ...form
  } = useForm()

  const [isOpen, setIsOpen] = useState(true)
  const [resetTypeAhead, setResetTypeAhead] = useState(false)
  let checkCustomerListSelect = null
  const [isEndCustomerOpen, setIsEndCustomerOpen] = useState(true)
  const [isCustomerOpen, setIsCustomerOpen] = useState(true)
  const [isReportedbyOpen, setIsReportedbyOpen] = useState(false)
  const [isAffectedbyOpen, setIsAffectedbyOpen] = useState(false)
  const [isAssetOpen, setIsAssetOpen] = useState(false)

  const [advancedSearchConfig, setAdvancedSearchConfig] = useState(() => {
    const persistedState =
      localStorage.getItem('advancedSearchConfig') !== 'undefined' ? localStorage.getItem('advancedSearchConfig') : null
    return persistedState ? JSON.parse(persistedState) : AdvancedSearchOptionalFields
  })

  const registerFields = () => {
    register({ name: 'datefrom', value: '' })
    register({ name: 'dateto', value: '' })
    register({ name: 'pluspcustomer', value: '' })
    register({ name: 'pelknownascust', value: '' })
    register({ name: 'reportedby', value: '' })
    register({ name: 'affectedperson', value: '' })
    register({ name: 'assetnum', value: '' })
    register({ name: 'location', value: '' })
  }
  useEffect(() => {
    registerFields()
  }, [])
  
  const defaultSearchFormValues = {
    status: '',
    pelsrtype: '',
    datefrom: '',
    dateto: '',
    pluspcustomer: '',
    reportedby: '',
    affectedperson: '',
    assetnum: '',
    location: ''
  };

  const onDateChange = name => (e) => {
    let [selectedDateValue] = e
    if(name === 'dateto'){
      selectedDateValue = moment(selectedDateValue).add(1,'days').toDate()
    }
    setValue(name, selectedDateValue)
  }

  const onDateInputChange = name => (e) => {
    const {
      target: {
        value
      }
    } = e
    const dateVal = moment(value, 'DD/MM/YYYY').toDate();
    setValue(name, dateVal)
  }

  const getProcessedQuery = (data) => {
    const queryString = Object.entries(data).map(([field, value]) => {
      switch (field) {
        case 'datefrom':
          return `reportdate>=${`"${moment(value).startOf('day').format()}"`}`
        case 'dateto':
          return `reportdate<=${`"${moment(value).endOf('day').format()}"`}`
        case 'internalpriority':
          return `${field}=${`${value}`}`
        default:
          return `${field}=${`"${value}"`}`
      }
    }).join(' and ')
    return queryString;
  }

  const onSubmitRequested = searchForm => {
    const searchObject = _.pickBy(searchForm)
    const where = getProcessedQuery(searchObject)
    const searchparams = {
      ...(where && {where}),
      savedQuery: ''
    }
    setIsOpen(false)
    onSubmit(searchparams)
  }

  const onSearchFieldConfigSave = value => {
    localStorage.setItem('advancedSearchConfig', JSON.stringify(value))
    setAdvancedSearchConfig(value)
  }

  
  const handleCustomerInput = ({ inputValue }) => {
    if (inputValue !== '') {
      setIsCustomerOpen(true)
    } else {
      setValue('pluspcustomer', '')
      setIsCustomerOpen(true)
    }
  }

  const handleAssetsInput = ({ inputValue }) => {
    if (inputValue !=='') {
      setIsAssetOpen(true)
    }
  }

  const handleAssetChange = ({ selectedItem }) => {
    setValue('assetnum', selectedItem?.assetnum)
    setIsAssetOpen(false)
  }

  const handleCustomerChange = ({ selectedItem }) => {
    checkCustomerListSelect = true
    setValue('pluspcustomer', selectedItem?.customer)
    setIsCustomerOpen(false)
  }

  const blurCustomerResultsEvent = (e, items) => {
    const selectedItem = items?.[0]
    if (items.length === 1) {
      handleCustomerChange({ selectedItem })
      setIsCustomerOpen(false)
    }
    if (items.length > 1) {
      setTimeout(() => {
        if (!checkCustomerListSelect && formState?.pluspcustomer?.length === 0)
        setValue('pluspcustomer', selectedItem?.customer)
          setIsCustomerOpen(false)
      }, 2000)
    }
  }

  const handleReportedByInput = ({ inputValue }) => {
    if(inputValue !=='') {
      setIsReportedbyOpen(true)
    }
  }

  const handleReportedByChange = ({ selectedItem }) => {
    setValue('reportedby', selectedItem?.personid)
    setValue('reportedemail', selectedItem?.primaryemail)
    setIsReportedbyOpen(false)
  }

  const handleLocationChange = ({ selectedItem }) => {
    setValue('location', selectedItem?.location)        
  }

  const handleAffectedByInput = ({ inputValue }) => {
    if(inputValue !=='') {
      setIsAffectedbyOpen(true)
    }
  }

  const handleAffectedByChange = ({ selectedItem }) => {
    setValue('affectedperson', selectedItem?.personid)
    setValue('affectedemail', selectedItem?.primaryemail)
    setIsAffectedbyOpen(false)
  }

    
  const handleEndCustomerInputChange = () => setIsEndCustomerOpen(true)

  const handleEndCustomerChange = ({ selectedItem }) => {
    setValue('pelknownascust', selectedItem?.pelknownascust)
  }

  const handleEndCustomerFocusLost = () => {}

  
  const resetForm = () => {
    setResetTypeAhead(true)
    form.reset(defaultSearchFormValues)
    registerFields()
    onReset()
  }

  const onOpen = () => {
    setIsOpen(true)
  }

  return (
    <>
     
    <Collapsible open={isOpen} onTriggerOpening={onOpen} triggerWhenOpen="Hide Fields" trigger="Show Fields" easing="ease-out">
      <div className="advanced-search-config-btn">
        <AdvancedConfigModal 
          onSubmit={onSearchFieldConfigSave} 
          searchFields={advancedSearchConfig} 
        />
      </div>
        <FormProvider {...form} >          
          <Form onSubmit={form.handleSubmit(onSubmitRequested)} className="bx--form-advanced-search">
            <div className="pel--searcharea-scroll">
              {advancedSearchConfig.Status && (<Select
                defaultValue=""
                name="status"
                id="status"
                ref={register}
                invalidText="A valid value is required"
                labelText="Status">
                <SelectItem
                  text="Any"
                  value=""
                />
                {Object.entries(SRStatusList).map(([key, value]) => {
                  return <SelectItem value={key} text={value} key={key} />
                })}
              </Select>)}
              {advancedSearchConfig.Type && (<Select
                defaultValue=""
                name="pelsrtype"
                id="pelsrtype"
                invalidText="A valid value is required"
                labelText="Type"
                ref={register}>
                <SelectItem
                  text="Any"
                  value=""
                />
                {Object.entries(ServiceRequestTypes).map(([key, value]) => {
                  return <SelectItem value={key} text={value} key={key} />
                })}
              </Select>)}
              {advancedSearchConfig.Reporteddate && (<DatePicker
                id="datefrom"
                name="datefrom"
                dateFormat="d/m/Y"
                datePickerType="single" onChange={onDateChange('datefrom')}>
                <DatePickerInput
                  id="dateFromInput"
                  placeholder="dd/mm/yyyy"
                  labelText="Date From"
                  type="text"
                  onChange={onDateInputChange('datefrom')}
                  autoComplete="off"
                />
              </DatePicker>)}
              {advancedSearchConfig.Reporteddate && (<DatePicker
                id="dateto"
                name="dateto"
                dateFormat="d/m/Y"
                datePickerType="single"
                onChange={onDateChange('dateto')}>
                <DatePickerInput
                  id="dateToInput"
                  placeholder="dd/mm/yyyy"
                  labelText="Date To"
                  type="text"
                  onChange={onDateInputChange('dateto')}
                  autoComplete="off"
                />
              </DatePicker>)}
              {advancedSearchConfig.EndCustomer && (<TypeAhead
                id="pelknownascust"
                name="pelknownascust"
                labelText="Customer Known As"
                objectType="pelcustomer"
                searchResult={item => <CustomerSearchResult customer={item} pelKnownAsCust />}
                itemToString={item => item?.pelknownascust || ''}
                selectedItem={{
                  pelknownascust: getValues('pelknownascust')
                }}
                onSelectedItemChange={handleEndCustomerChange}
                onFocusLost={handleEndCustomerFocusLost}
                handleInputChange={handleEndCustomerInputChange}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                modalOpen={isEndCustomerOpen}
                pelKnownAsCust
                skipSaveHistory={false}
              />)}
              {advancedSearchConfig.Customer && (<TypeAhead
                id="pluspcustomer"
                name="pluspcustomer"
                labelText="Customer"
                objectType="pelcustomer"
                searchResult={item => <CustomerSearchResult customer={item} />}
                itemToString={customer => customer?.customer || ''}
                selectedItem={{
                  customer: getValues('pluspcustomer')
                }}
                onSelectedItemChange={handleCustomerChange}
                onFocusLost={blurCustomerResultsEvent}
                handleInputChange={handleCustomerInput}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                modalOpen={isCustomerOpen}
                skipSaveHistory={false}
              />)}
              {advancedSearchConfig.Ticketid && (<TextInput
                id="ticketid"
                name="ticketid"
                ref={register}
                labelText="Ticket Id"
                autoComplete="off"
              />)}
              {advancedSearchConfig.Priority && (<TextInput
                id="internalpriority"
                name="internalpriority"
                ref={register}
                type="number"
                labelText="Priority"
                autoComplete="off"
              />)}
              {advancedSearchConfig.Asset && (<TypeAhead
                id="assetnum"
                name="assetnum"
                labelText="Asset"
                objectType="pelasset"
                searchResult={item => <AssetSearchResult asset={item} />}
                itemToString={item => item?.assetnum || ''}
                onSelectedItemChange={handleAssetChange}
                handleInputChange={handleAssetsInput}
                onFocusLost={() => setIsAssetOpen(false)}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                modalOpen={isAssetOpen}
                skipSaveHistory={false}
              />)}
              {advancedSearchConfig.Reportedby && ( <TypeAhead
                id="reportedby"
                name="reportedby"
                labelText="Reported By"
                objectType="pelperson"
                searchResult={item => <PersonSearchResult person={item} />}
                itemToString={item => item?.displayname || ''}
                onSelectedItemChange={handleReportedByChange}
                handleInputChange={handleReportedByInput}
                onFocusLost={() => setIsReportedbyOpen(false)}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                modalOpen={isReportedbyOpen}
                skipSaveHistory={false}
              />)}
              {advancedSearchConfig.Reportedbyemail && (<TextInput
                id="reportedemail"
                name="reportedemail"
                ref={register}
                labelText="Reported by email"
                autoComplete="off"
              />)}
              {advancedSearchConfig.Location && (  <TypeAhead
                searchResult={item => <LocationSearchResultSmall location={item} />}
                itemToString={item => item?.location || ''}
                onSelectedItemChange={handleLocationChange}                
                objectType="pellocfull"     
                labelText='Location'
                onFocusLost={() => {}}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                skipSaveHistory={false}
                usePelSearchTerms
              />)}
              {advancedSearchConfig.pelclientref && (<TextInput
                id="pelclientref"
                name="pelclientref"
                ref={register}
                labelText="Customer Ref"
                autoComplete="off"
              />)}
              {advancedSearchConfig.Afftected && ( <TypeAhead
                id="affectedperson"
                name="affectedperson"
                labelText="Affected Person"
                objectType="pelperson"
                searchResult={item => <PersonSearchResult person={item} />}
                itemToString={item => item?.displayname || ''}
                onSelectedItemChange={handleAffectedByChange}
                handleInputChange={handleAffectedByInput}
                onFocusLost={() => setIsAffectedbyOpen(false)}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                modalOpen={isAffectedbyOpen}
                skipSaveHistory={false}
              />)}
              {advancedSearchConfig.Affectedemail && (<TextInput
                id="affectedemail"
                name="affectedemail"
                ref={register}
                labelText="Affected Email"
                autoComplete="off"
              />)}
            </div>
            <Button className="advanced-search-btn" type="submit">Search</Button>
            <Button type="button" onClick={resetForm}>Reset</Button>
          </Form>
        </FormProvider>
      </Collapsible>      
    </>
  )
}

SearchAdvanced.propTypes = {
  onSubmit: PropTypes.func,
  onReset: PropTypes.func
}
