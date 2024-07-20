import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Select, SelectItem, DatePicker, DatePickerInput, TextInput } from 'carbon-components-react'
import { useForm, FormProvider } from 'react-hook-form'
import _ from 'lodash'
import moment from 'moment'
import Collapsible from 'react-collapsible'
import { TypeAhead } from '../containers'
import { ServiceRequestTypes, SRStatusList, priorityList, AdvancedSearchOptionalCpFields } from '../../../contact-center/constants'
import { AdvancedConfigModal } from '../../../contact-center/search/components/AdvancedConfigModal'
import { AssetSearchResult } from "../../components/AssetSearchResult"
import { PersonSearchResult } from "../../components/PersonSearchResult"
import { LocationSearchResultSmall } from '../../../contact-center/components/LocationSearchResultSmall'

export const SearchAdvanced = ({ onSubmit, onReset }) => {

  const form = useForm()

  const [isOpen, setIsOpen] = useState(true)

  const [resetTypeAhead, setResetTypeAhead] = useState(false)

  const [advancedSearchConfig, setAdvancedSearchConfig] = useState(() => {
    const persistedState =
      localStorage.getItem('advancedSearchConfigCp') !== 'undefined' ? localStorage.getItem('advancedSearchConfigCp') : null
    return persistedState ? JSON.parse(persistedState) : AdvancedSearchOptionalCpFields
  })

  const registerFields = () => {
    form.register({ name: 'datefrom', value: '' })
    form.register({ name: 'dateto', value: '' })
    form.register({ name: 'reportedby', value: '' })
    form.register({ name: 'affectedperson', value: '' })
    form.register({ name: 'assetnum', value: '' })
    form.register({ name: 'pelclientref', value: '' })
    form.register({ name: 'ticketid', value: '' })
    form.register({ name: 'internalpriority', value: '' })
    form.register({ name: 'affectedemail', value: '' })
    form.register({ name: 'location', value: '' })
    form.register({ name: 'reportedemail', value: '' })
    form.register({ name: 'status', value: '' })
    form.register({ name: 'pelsrtype', value: '' })
  }
  useEffect(() => {
    registerFields()
  }, [])
  
  const defaultSearchFormValues = {
    status: '',
    pelsrtype: '',
    datefrom: '',
    dateto: '',
    reportedby: '',
    affectedperson: '',
    assetnum: '',
    pelclientref: '',
    ticketid: '',
    internalpriority: '',
    affectedemail: '',
    location: '',
    reportedemail: ''
  };

  const onDateChange = name => (e) => {
    const [selectedDateValue] = e
    form.setValue(name, selectedDateValue)
  }

  const onDateInputChange = name => (e) => {
    const {
      target: {
        value
      }
    } = e
    const dateVal = moment(value, 'DD/MM/YYYY').toDate();
    form.setValue(name, dateVal)
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
    localStorage.setItem('advancedSearchConfigCp', JSON.stringify(value))
    setAdvancedSearchConfig(value)
  }

  const handleAssetChange = ({ selectedItem }) => {
    form.setValue('assetnum', selectedItem?.assetnum)
  }

  const handleReportedByChange = ({ selectedItem }) => {
    form.setValue('reportedby', selectedItem?.personid)
    form.setValue('reportedemail', selectedItem?.primaryemail)
  }

  const handleLocationChange = ({ selectedItem }) => {
    form.setValue('location', selectedItem?.location)        
  }

  const handleAffectedByChange = ({ selectedItem }) => {
    form.setValue('affectedperson', selectedItem?.personid)
    form.setValue('affectedemail', selectedItem?.primaryemail)
  }

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
        <AdvancedConfigModal onSubmit={onSearchFieldConfigSave} searchFields={advancedSearchConfig} />
      </div>
        <FormProvider {...form} >          
          <Form onSubmit={form.handleSubmit(onSubmitRequested)} className="bx--form-advanced-search">
            <div className="pel--searcharea-scroll">
              {advancedSearchConfig.Status && (<Select
                defaultValue=""
                name="status"
                id="status"
                ref={form.register}
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
                ref={form.register}>
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
              {advancedSearchConfig.Ticketid && (<TextInput
                id="ticketid"
                name="ticketid"
                ref={form.register}
                labelText="Ticket Id"
              />)}
              {advancedSearchConfig.Priority && (<Select
                defaultValue=""
                name="internalpriority"
                id="internalpriority"
                ref={form.register}
                invalidText="A valid value is required"
                labelText="Priority">
                <SelectItem
                  text="Any"
                  value=""
                />
                {Object.entries(priorityList).map(([key, value]) => {
                  return <SelectItem value={key} text={value} key={key} />
                })}
              </Select>)}
              {advancedSearchConfig.Asset && (<TypeAhead
                id="assetnum"
                name="assetnum"
                labelText="Asset"
                objectType="pelasset"
                searchResult={item => <AssetSearchResult asset={item} />}
                itemToString={item => item?.assetnum || ''}
                onSelectedItemChange={handleAssetChange}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                selectedItem={{
                  assetnum: form.assetnum
                }}
              />)}
              {advancedSearchConfig.Reportedby && (
                <TypeAhead
                  id="reportedby"
                  name="reportedby"
                  labelText="Reported By"
                  objectType="pelperson"
                  searchResult={item => <PersonSearchResult person={item} />}
                  itemToString={item => item?.displayname || ''}
                  onSelectedItemChange={handleReportedByChange}
                  resetTypeAhead={resetTypeAhead}
                  setResetTypeAhead={setResetTypeAhead}
                  selectedItem={{
                    reportedby: form.reportedby
                  }}
                />
              )}
              {advancedSearchConfig.Reportedbyemail && (<TextInput
                id="reportedemail"
                name="reportedemail"
                ref={form.register}
                labelText="Reported by email"
              />)}
              {advancedSearchConfig.Location && (<TypeAhead
                searchResult={item => <LocationSearchResultSmall location={item} />}
                itemToString={item => item?.location || ''}
                selectedItemsOnly
                onSelectedItemChange={handleLocationChange}                
                objectType="pellocfull"     
                labelText='Location'           
              />)}
              {advancedSearchConfig.pelclientref && (<TextInput
                id="pelclientref"
                name="pelclientref"
                ref={form.register}
                labelText="Customer Ref"
              />)}
              {advancedSearchConfig.Afftected && ( <TypeAhead
                id="affectedperson"
                name="affectedperson"
                labelText="Affected Person"
                objectType="pelperson"
                searchResult={item => <PersonSearchResult person={item} />}
                itemToString={item => item?.displayname || ''}
                onSelectedItemChange={handleAffectedByChange}
                resetTypeAhead={resetTypeAhead}
                setResetTypeAhead={setResetTypeAhead}
                selectedItem={{
                  affectedperson: form.affectedperson
                }}
              />)}
              {advancedSearchConfig.Affectedemail && (<TextInput
                id="affectedemail"
                name="affectedemail"
                ref={form.register}
                labelText="Affected Email"
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
