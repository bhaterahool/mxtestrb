import React, { useEffect, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Form, Button } from 'carbon-components-react'
import { useForm, FormProvider } from 'react-hook-form'
import { pickBy, capitalize } from 'lodash'
import moment from 'moment'
import Collapsible from 'react-collapsible'
import { AdvancedConfigModal } from '../../../contact-center/search/components/AdvancedConfigModal'
import { AFP_STATUS } from '../AfpForm/formUtils'
import {
  PelDateTimePicker,
  PelSelectInput,
  PelTextArea,
  PelTextInput
} from '../../../../shared/forms'
import { getList } from '../../services/afpApiService'

const initValues = {
  afpnum: '',
  status: '',
  statusdate: '',
  startdate: '',
  enddate: '',
  type: '',
  description: ''
}
const formFields = Object.keys(initValues).reduce((acc, curr) => {
  acc[curr] = true
  return acc
}, {})
const todayDate = new Date().toISOString()

export const SearchAdvanced = ({ defaultValues, onSubmit, onReset }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [typeOts, setTypeOpts] = useState([])
  const [advancedSearchConfig, setAdvancedSearchConfig] = useState(() => {
    const persistedState = localStorage.getItem('advancedAfpSearchConfig') ?? null
    return persistedState ? JSON.parse(persistedState) : formFields
  })
  const formMethods = useForm({ defaultValues: { ...initValues, ...defaultValues } })
  const { control, reset, register, handleSubmit, watch, getValues } = formMethods
  const { statusdatefrom, startdatefrom, enddatefrom } = watch()

  useEffect(() => {
    getList('type', { select: 'value' }).then(types =>
      setTypeOpts(() => types.map(({ value }) => ({ text: value, value })))
    )
  }, [])

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues])

  const getProcessedQuery = data => {
    const queryString = Object.entries(data)
      .map(([field, value]) => {
        switch (field) {
          case 'startdatefrom':
            return `startdate>=${`"${moment(value)
              .startOf('day')
              .format()}"`}`
          case 'startdateto':
            return `startdate<=${`"${moment(value)
              .startOf('day')
              .format()}"`}`
          case 'enddatefrom':
            return `enddate>=${`"${moment(value)
              .endOf('day')
              .format()}"`}`
          case 'enddateto':
            return `enddate<=${`"${moment(value)
              .endOf('day')
              .format()}"`}`
          case 'statusdatefrom':
            return `statusdate>=${`"${moment(value)
              .startOf('day')
              .format()}"`}`
          case 'statusdateto':
            return `statusdate<=${`"${moment(value)
              .endOf('day')
              .format()}"`}`
          default:
            return `${field}=${`"${value}"`}`
        }
      })
      .join(' and ')
    return queryString
  }

  const onSubmitRequested = searchForm => {
    const formOpts = pickBy(searchForm)
    const where = getProcessedQuery(formOpts)
    const searchparams = {
      ...(where && { where }),
      savedQuery: ''
    }
    setIsOpen(false)
    onSubmit(searchparams, formOpts)
  }

  const onSearchFieldConfigSave = value => {
    localStorage.setItem('advancedAfpSearchConfig', JSON.stringify(value))
    setAdvancedSearchConfig(value)
  }

  const resetForm = () => {
    reset(initValues)
    onReset()
  }

  const onOpen = () => {
    setIsOpen(true)
  }

  const statusOpts = useMemo(
    () =>
      Object.entries(AFP_STATUS)
        .filter(([, status]) => status !== AFP_STATUS.draft)
        .map(([text, value]) => ({ text: capitalize(text), value })),
    []
  )

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
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(onSubmitRequested)} className="bx--form-advanced-search">
            <div className="pel--searcharea-scroll">
              <PelTextInput ref={register} name="afpnum" labelText="AFP Reference" />
              {advancedSearchConfig.status && (
                <PelSelectInput
                  ref={register}
                  name="status"
                  labelText="AFP Status"
                  defaultText="Select Status"
                  options={statusOpts}
                />
              )}
              {advancedSearchConfig.type && (
                <PelSelectInput
                  ref={register}
                  name="type"
                  labelText="AFP Type"
                  defaultText="Select AFP type"
                  options={typeOts}
                  skeleton={typeOts.length === 0}
                />
              )}
              {advancedSearchConfig.statusdate && (
                <>
                  <PelDateTimePicker.Rhf
                    name="statusdatefrom"
                    label="Status Date From"
                    control={control}
                    withTime={false}
                    minDate=""
                    maxDate={todayDate}
                  />
                  <PelDateTimePicker.Rhf
                    control={control}
                    label="Status Date To"
                    name="statusdateto"
                    withTime={false}
                    maxDate={todayDate}
                    minDate={statusdatefrom || ''}
                  />
                </>
              )}
              {advancedSearchConfig.startdate && (
                <>
                  <PelDateTimePicker.Rhf
                    name="startdatefrom"
                    label="AFP Start Date From"
                    control={control}
                    withTime={false}
                    minDate=""
                    maxDate={todayDate}
                  />
                  <PelDateTimePicker.Rhf
                    name="startdateto"
                    label="AFP Start Date To"
                    control={control}
                    withTime={false}
                    maxDate={todayDate}
                    minDate={startdatefrom || ''}
                  />
                </>
              )}
              {advancedSearchConfig.enddate && (
                <>
                  <PelDateTimePicker.Rhf
                    control={control}
                    label="AFP End Date From"
                    name="enddatefrom"
                    withTime={false}
                    minDate=""
                    maxDate={todayDate}
                  />
                  <PelDateTimePicker.Rhf
                    control={control}
                    label="AFP End Date To"
                    name="enddateto"
                    withTime={false}
                    maxDate={todayDate}
                    minDate={enddatefrom || ''}
                  />
                </>
              )}

              {advancedSearchConfig.description && (
                <PelTextArea
                  id="description"
                  name="description"
                  ref={register}
                  labelText="Description"
                />
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

SearchAdvanced.propTypes = {
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  defaultValues: PropTypes.shape(initValues)
}
