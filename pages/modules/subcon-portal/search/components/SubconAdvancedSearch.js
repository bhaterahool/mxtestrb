import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Button, DatePicker, DatePickerInput, TextInput } from 'carbon-components-react'
import { useForm, FormProvider } from 'react-hook-form'
import _ from 'lodash'
import moment from 'moment'
import Collapsible from 'react-collapsible'
import { TypeAhead } from '../../../contact-center/search/containers'
import { AdvancedSearchOptionalSubconFields } from '../../../contact-center/constants'
import { AdvancedConfigModal } from '../../../contact-center/search/components/AdvancedConfigModal'
import { AssignmentSearchResult, PelSelectInput } from '../../../../shared/forms'
import { useRegistry } from '../../../../shared/RegistryProvider'
import {
  SUB_STATUS_SUBACK,
  SUB_STATUS_SUBASSIGNED,
  SUB_STATUS_SUBWFIN,
  SUB_STATUS_SUBRETURNED,
  SUB_STATUS_SUBWNOTIFY
} from '../../../../shared/grid/constants'

export const SubconSearchAdvanced = ({ onSubmit, onReset }) => {
  const form = useForm()
  const [{ assignmentStatusList, workOrderTypeList }] = useRegistry()
  const [isOpen, setIsOpen] = useState(true)

  const assignmentStatusListfiltered = assignmentStatusList.filter(
    assignmentStatus =>
      ![
        SUB_STATUS_SUBACK,
        SUB_STATUS_SUBASSIGNED,
        SUB_STATUS_SUBWFIN,
        SUB_STATUS_SUBRETURNED,
        SUB_STATUS_SUBWNOTIFY
      ].includes(assignmentStatus.value) && assignmentStatus.value.startsWith('SUB')
  )

  const [advancedSearchConfig, setAdvancedSearchConfig] = useState(() => {
    const persistedState = localStorage.getItem('subconAdvancedSearchConfig')
    return persistedState ? JSON.parse(persistedState) : AdvancedSearchOptionalSubconFields
  })

  const registerFields = () => {
    form.register({ name: 'assignmentid', value: '' })
    form.register({ name: 'wonum', value: '' })
    form.register({ name: 'assignmentstatus', value: '' })
    form.register({ name: 'woworktype', value: '' })
    form.register({ name: 'createddatefrom', value: '' })
    form.register({ name: 'createddateto', value: '' })
    form.register({ name: 'targstartdatefrom', value: '' })
    form.register({ name: 'targstartdateto', value: '' })
    form.register({ name: 'targcompdatefrom', value: '' })
    form.register({ name: 'targcompdateto', value: '' })
    form.register({ name: 'actstartfrom', value: '' })
    form.register({ name: 'actstartto', value: '' })
    form.register({ name: 'actfinishfrom', value: '' })
    form.register({ name: 'actfinishto', value: '' })
    form.register({ name: 'schedstartfrom', value: '' })
    form.register({ name: 'schedstartto', value: '' })
    form.register({ name: 'schedfinishfrom', value: '' })
    form.register({ name: 'schedfinishto', value: '' })
  }

  useEffect(() => {
    registerFields()
  }, [])

  const defaultSearchFormValues = {
    assignmentid: '',
    wonum: '',
    assignmentstatus: '',
    woworktype: '',
    ponum: '',
    postcode: '',
    streetaddress: '',
    createddatefrom: '',
    createddateto: '',
    targstartdatefrom: '',
    targstartdateto: '',
    targcompdatefrom: '',
    targcompdateto: '',
    actstartfrom: '',
    actstartto: '',
    actfinishfrom: '',
    actfinishto: '',
    schedstartfrom: '',
    schedstartto: '',
    schedfinishfrom: '',
    schedfinishto: ''
  }

  const onDateChange = name => e => {
    let [selectedDateValue] = e
    if (name.includes('to')) {
      selectedDateValue = moment(selectedDateValue)
        .add(1, 'days')
        .toDate()
    }
    form.setValue(name, selectedDateValue)
  }

  const onDateInputChange = name => e => {
    const {
      target: { value }
    } = e
    const dateVal = moment(value, 'DD/MM/YYYY').toDate()
    form.setValue(name, dateVal)
  }

  const getProcessedQuery = data => {
    const queryString = Object.entries(data)
      .map(([field, value]) => {
        switch (field) {
          case 'createddatefrom':
            return `createddate>=${`"${moment(value).toISOString()}"`}`
          case 'createddateto':
            return `createddate<=${`"${moment(value).toISOString()}"`}`
          case 'targstartdatefrom':
            return `workorder.targstartdate>=${`"${moment(value).toISOString()}"`}`
          case 'targstartdateto':
            return `workorder.targstartdate<=${`"${moment(value).toISOString()}"`}`
          case 'targcompdatefrom':
            return `workorder.targcompdate>=${`"${moment(value).toISOString()}"`}`
          case 'targcompdateto':
            return `workorder.targcompdate<=${`"${moment(value).toISOString()}"`}`
          case 'actstartfrom':
            return `pelassignstart>=${`"${moment(value).toISOString()}"`}`
          case 'actstartto':
            return `pelassignstart<=${`"${moment(value).toISOString()}"`}`
          case 'actfinishfrom':
            return `pelassignfinish>=${`"${moment(value).toISOString()}"`}`
          case 'actfinishto':
            return `pelassignfinish<=${`"${moment(value).toISOString()}"`}`
          case 'schedstartfrom':
            return `startdate>=${`"${moment(value).toISOString()}"`}`
          case 'schedstartto':
            return `startdate<=${`"${moment(value).toISOString()}"`}`
          case 'schedfinishfrom':
            return `finishdate>=${`"${moment(value).toISOString()}"`}`
          case 'schedfinishto':
            return `finishdate<=${`"${moment(value).toISOString()}"`}`
          case 'assignmentid':
            return `${field}=${value}`
          case 'postcode':
            return `workorder.serviceaddress.postalcode=${`"${value}%"`}`
          case 'streetaddress':
            return `workorder.serviceaddress.streetaddress=${`"${value}%"`}`
          case 'woworktype':
            return `workorder.worktype=${`"${value}"`}`
          case 'ponum':
            return `poline.ponum=${`"${value}"`}`
          case 'assignmentstatus':
            return `status=${`"${value}"`}`
          default:
            return `${field}=${`"${value}"`}`
        }
      })
      .join(' and ')
    return queryString
  }

  const onSubmitRequested = searchForm => {
    const searchObject = _.pickBy(searchForm)
    const where = getProcessedQuery(searchObject)
    const searchparams = {
      ...(where && { where }),
      savedQuery: ''
    }
    setIsOpen(false)
    onSubmit(searchparams)
  }

  const onSearchFieldConfigSave = value => {
    localStorage.setItem('subconAdvancedSearchConfig', JSON.stringify(value))
    setAdvancedSearchConfig(value)
  }

  const handleAssignmentChange = value => {
    form.setValue('assignmentid', value)
  }

  const handleWorkOrderChange = value => {
    form.setValue('wonum', value)
  }

  const [resetTypeAhead, setResetTypeAhead] = useState(false)
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
      <Collapsible
        open={isOpen}
        onTriggerOpening={onOpen}
        triggerWhenOpen="Hide Fields"
        trigger="Show Fields"
        easing="ease-out"
      >
        <div className="advanced-search-config-btn">
          <AdvancedConfigModal
            onSubmit={onSearchFieldConfigSave}
            searchFields={advancedSearchConfig}
          />
        </div>
        <FormProvider {...form}>
          <Form
            onSubmit={form.handleSubmit(onSubmitRequested)}
            className="bx--form-advanced-search"
          >
            <div className="pel--searcharea-scroll">
              {advancedSearchConfig.Assignmentid && (
                <TypeAhead
                  id="assignmentid"
                  name="assignmentid"
                  labelText="Assignment Id"
                  objectType="pelassignment"
                  type="number"
                  searchResult={item => <AssignmentSearchResult assignment={item} />}
                  itemToString={item => item?.assignmentid || ''}
                  onChange={handleAssignmentChange}
                  resetTypeAhead={resetTypeAhead}
                  setResetTypeAhead={setResetTypeAhead}
                  autoComplete="off"
                />
              )}

              {advancedSearchConfig.Wonum && (
                <TypeAhead
                  id="wonum"
                  name="wonum"
                  labelText="Work Order"
                  objectType="pelwo"
                  searchResult={item => <>{item.wonum}</>}
                  itemToString={item => item?.wonum || ''}
                  onChange={handleWorkOrderChange}
                  resetTypeAhead={resetTypeAhead}
                  setResetTypeAhead={setResetTypeAhead}
                  autoComplete="off"
                />
              )}

              {advancedSearchConfig.AssignmentStatus && (
                <PelSelectInput
                  ref={form.register}
                  name="assignmentstatus"
                  labelText="Assignment status"
                  defaultText="Select Status"
                  defaultValue=""
                  options={assignmentStatusListfiltered?.map(({ value, description }) => ({
                    text: `${value}: ${description}`,
                    value
                  }))}
                />
              )}

              {advancedSearchConfig.Woworktype && (
                <PelSelectInput
                  ref={form.register}
                  name="woworktype"
                  labelText="Work order type"
                  defaultText="Choose a work type"
                  defaultValue=""
                  options={workOrderTypeList?.map(({ worktype, wtypedesc }) => ({
                    text: `${worktype}: ${wtypedesc}`,
                    value: worktype
                  }))}
                />
              )}

              {advancedSearchConfig.ponum && (
                <TextInput id="ponum" name="ponum" ref={form.register} labelText="PO Number" />
              )}

              {advancedSearchConfig.Postcode && (
                <TextInput id="postcode" name="postcode" ref={form.register} labelText="Postcode" />
              )}

              {advancedSearchConfig.Streetaddress && (
                <TextInput
                  id="streetaddress"
                  name="streetaddress"
                  ref={form.register}
                  labelText="Street Address"
                />
              )}

              {advancedSearchConfig.CreatedDate && (
                <DatePicker
                  id="createddatefrom"
                  name="createddatefrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('createddatefrom')}
                >
                  <DatePickerInput
                    id="createdDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Created Date From"
                    type="text"
                    onChange={onDateInputChange('createddatefrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.CreatedDate && (
                <DatePicker
                  id="createddateto"
                  name="createddateto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('createddateto')}
                >
                  <DatePickerInput
                    id="createdDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Created Date To"
                    type="text"
                    onChange={onDateInputChange('createddateto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.TargetStartDate && (
                <DatePicker
                  id="targstartdatefrom"
                  name="targstartdatefrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('targstartdatefrom')}
                >
                  <DatePickerInput
                    id="targetDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Target Start Date From"
                    type="text"
                    onChange={onDateInputChange('targstartdatefrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.TargetStartDate && (
                <DatePicker
                  id="targstartdateto"
                  name="targstartdateto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('targstartdateto')}
                >
                  <DatePickerInput
                    id="targetStartDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Target Start Date To"
                    type="text"
                    onChange={onDateInputChange('targstartdateto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.TargetFinishDate && (
                <DatePicker
                  id="targcompdatefrom"
                  name="targcompdatefrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('targcompdatefrom')}
                >
                  <DatePickerInput
                    id="targetCompDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Target Finish Date From"
                    type="text"
                    onChange={onDateInputChange('targcompdatefrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.TargetFinishDate && (
                <DatePicker
                  id="targcompdateto"
                  name="targcompdateto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('targcompdateto')}
                >
                  <DatePickerInput
                    id="targetCompDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Target Finish Date To"
                    type="text"
                    onChange={onDateInputChange('targcompdateto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.ActualStartDate && (
                <DatePicker
                  id="actstartfrom"
                  name="actstartfrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('actstartfrom')}
                >
                  <DatePickerInput
                    id="actStartDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Actual Start From"
                    type="text"
                    onChange={onDateInputChange('actstartfrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.ActualStartDate && (
                <DatePicker
                  id="actstartto"
                  name="actstartto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('actstartto')}
                >
                  <DatePickerInput
                    id="actStartDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Actual Start To"
                    type="text"
                    onChange={onDateInputChange('actstartto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.ActualFinishDate && (
                <DatePicker
                  id="actfinishfrom"
                  name="actfinishfrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('actfinishfrom')}
                >
                  <DatePickerInput
                    id="actFinishDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Actual Finish From"
                    type="text"
                    onChange={onDateInputChange('actfinishfrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.ActualFinishDate && (
                <DatePicker
                  id="actfinishto"
                  name="actfinishto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('actfinishto')}
                >
                  <DatePickerInput
                    id="actFinishDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Actual Finish To"
                    type="text"
                    onChange={onDateInputChange('actfinishto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.EstimatedStartDate && (
                <DatePicker
                  id="schedstartfrom"
                  name="schedstartfrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('schedstartfrom')}
                >
                  <DatePickerInput
                    id="schedStartDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Estimated Start From"
                    type="text"
                    onChange={onDateInputChange('schedstartfrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.EstimatedStartDate && (
                <DatePicker
                  id="schedstartto"
                  name="schedstartto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('schedstartto')}
                >
                  <DatePickerInput
                    id="schedStartDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Estimated Start To"
                    type="text"
                    onChange={onDateInputChange('schedstartto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.EstimatedFinishDate && (
                <DatePicker
                  id="schedfinishfrom"
                  name="schedfinishfrom"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('schedfinishfrom')}
                >
                  <DatePickerInput
                    id="schedFinishDateFromInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Estimated Finish From"
                    type="text"
                    onChange={onDateInputChange('schedfinishfrom')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}

              {advancedSearchConfig.EstimatedFinishDate && (
                <DatePicker
                  id="schedfinishto"
                  name="schedfinishto"
                  dateFormat="d/m/Y"
                  datePickerType="single"
                  onChange={onDateChange('schedfinishto')}
                >
                  <DatePickerInput
                    id="schedFinishDateToInput"
                    placeholder="dd/mm/yyyy"
                    labelText="Estimated Finish To"
                    type="text"
                    onChange={onDateInputChange('schedfinishto')}
                    autoComplete="off"
                  />
                </DatePicker>
              )}
            </div>
            <Button className="advanced-search-btn" type="submit">
              Search
            </Button>
            <Button type="button" onClick={resetForm}>
              Reset
            </Button>
          </Form>
        </FormProvider>
      </Collapsible>
    </>
  )
}

SubconSearchAdvanced.propTypes = {
  onSubmit: PropTypes.func,
  onReset: PropTypes.func
}
