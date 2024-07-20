import React from 'react'
import {
  Form,
  Select,
  SelectItem,
  Checkbox,
  TextArea,
  DatePicker,
  DatePickerInput
} from 'carbon-components-react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { PelTextInput } from '../../../../shared/forms'
import './scss/form.scss'
import { asset } from './props'
import { assignment } from '../form/props/assignment'

const todayDate = new Date().toISOString()

export const AssetForm = ({
  multiassetlocci,
  assignment,
  workOutcomes,
  pelAssetConds,
  nonCompletionReasons,
  hideCreateButton,
  handleChange,
  workOutcomeMandatory,
  completionNotesMandatory
}) => {
  const {
    multiid,
    asset,
    pelworkcomp,
    pelnoncompreason,
    pelworkoutcome,
    pelcompdate,
    pelcompnotes,
    newreading = '',
    pelcompby
  } = multiassetlocci || {}

  const handleWorkCompleteChange = (value, id) => {
    handleChange({
      target: {
        name: id,
        value
      }
    })
  }

  const dateTime = moment(pelcompdate || Date.now())
  const dateValue = pelworkcomp ? dateTime.format('DD-MMM-YYYY') : ''

  const srCreatedDate = assignment?.workorder?.sr?.reportdate
    ? new Date(assignment?.workorder?.sr?.reportdate).toISOString()
    : ''

  const isReadOnly = hideCreateButton

  const handlePelnoncompreason = e => {
    const {
      target: { value }
    } = e

    handleChange({
      target: {
        name: 'pelnoncompreason',
        value
      }
    })
  }

  const lastReadingValue = pelAssetConds?.find(
    pelAssetCond => pelAssetCond?.value === asset?.[0]?.assetmeter?.[0]?.lastreading
  )?.description

  const handleWorkOutcomeChange = e => {
    const {
      target: { value }
    } = e

    handleChange({
      target: {
        name: 'pelworkoutcome',
        value
      }
    })
  }

  const onDateChange = name => e => {
    const [selectedDateValue] = e
    handleChange({
      target: {
        name,
        value: selectedDateValue
      }
    })
  }

  const workOutcomesList = [
    { value: '', description: 'Select Work Outcome' },
    ...workOutcomes?.filter(opt => opt?.alnvalue?.includes(assignment?.workorder?.worktype))
  ]
  const nonCompletionReasonsList = [
    { value: '', description: 'Select a Reason' },
    ...nonCompletionReasons
  ]
  const pelAssetCondsList = [{ value: '', description: 'Select New Condition' }, ...pelAssetConds]

  return (
    <Form className="pel--asset-form">
      <div className="bx--row">
        <div className="bx--col-lg-6 bx--col-md-6">
          <PelTextInput
            name="id"
            id="id"
            labelText="ID"
            value={asset?.[0]?.assetnum ?? ''}
            readOnly
          />

          <PelTextInput
            name="lastreading"
            id="lastreading"
            labelText="Current Condition"
            value={lastReadingValue ?? ''}
            readOnly
          />

          <Select
            name="pelworkoutcome"
            id="pelworkoutcome"
            labelText="Work Outcome"
            value={pelworkoutcome}
            disabled={isReadOnly || !pelworkcomp}
            onChange={handleWorkOutcomeChange}
            invalid={workOutcomeMandatory}
          >
            {(pelworkoutcome || (!isReadOnly && pelworkcomp)) &&
              workOutcomesList?.map((workOutcome, index) => (
                <SelectItem
                  key={`outcome-${index}`}
                  text={
                    workOutcome.value
                      ? `${workOutcome.value}: ${workOutcome.description}`
                      : `${workOutcome.description}`
                  }
                  value={workOutcome.value}
                />
              ))}
          </Select>

          <Select
            name="pelnoncompreason"
            id="pelnoncompreason"
            labelText="Non Completion Reason"
            disabled={!!pelworkcomp || isReadOnly}
            onChange={handlePelnoncompreason}
            value={pelnoncompreason}
          >
            {(pelnoncompreason || (!pelworkcomp && !isReadOnly)) &&
              nonCompletionReasonsList?.map((noncompreason, index) => (
                <SelectItem
                  key={`non-comp-${index}`}
                  text={
                    noncompreason.value
                      ? `${noncompreason.value}: ${noncompreason.description}`
                      : `${noncompreason.description}`
                  }
                  value={noncompreason.value}
                />
              ))}
          </Select>
          <Checkbox
            labelText="Work Complete"
            name="pelworkcomp"
            id="pelworkcomp"
            checked={pelworkcomp}
            disabled={isReadOnly || pelnoncompreason}
            onChange={handleWorkCompleteChange}
          />
        </div>
        <div className="bx--col-lg-6 bx--col-md-6">
          <PelTextInput
            name=""
            id=""
            labelText="Asset"
            value={asset?.[0]?.description ?? ''}
            readOnly
          />
          <Select
            name="newreading"
            id="newreading"
            type="number"
            labelText="New Condition"
            disabled={isReadOnly || !asset || !pelworkcomp}
            onChange={handleChange}
            value={newreading}
          >
            {!isReadOnly &&
              asset &&
              pelworkcomp &&
              pelAssetCondsList?.map((pelAssetCond, index) => (
                <SelectItem
                  key={`asset-cond-${index}`}
                  text={
                    pelAssetCond.value
                      ? `${pelAssetCond.value}: ${pelAssetCond.description}`
                      : `${pelAssetCond.description}`
                  }
                  value={pelAssetCond.value}
                />
              ))}
          </Select>

          <PelTextInput
            name="pelcompby"
            id="pelcompby"
            labelText="Completed By"
            value={pelcompby}
            readOnly
          />
          <DatePicker
            id="pelcompdate"
            datePickerType="single"
            dateFormat="d/m/Y"
            maxDate={todayDate}
            minDate={srCreatedDate}
            onChange={onDateChange('pelcompdate')}
          >
            <DatePickerInput
              id="pelcompdateinput"
              value={dateValue}
              placeholder="dd/mm/yyyy"
              labelText="Completion Date"
              disabled={isReadOnly || !pelworkcomp}
            />
          </DatePicker>
          <TextArea
            name="pelcompnotes"
            id="pelcompnotes"
            value={pelcompnotes}
            labelText="Completion Notes"
            onChange={handleChange}
            disabled={isReadOnly}
            invalid={completionNotesMandatory}
            maxLength="500"
          />
          <div className="pel--asset-options" />
        </div>
      </div>
    </Form>
  )
}

AssetForm.propTypes = {
  multiassetlocci: PropTypes.shape({
    href: PropTypes.string,
    multiid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pelcompdate: PropTypes.string,
    pelcompnotes: PropTypes.string,
    pelnoncompreason: PropTypes.string,
    pelworkcomp: PropTypes.bool,
    pelworkoutcome: PropTypes.string,
    sequence: PropTypes.string,
    assets: PropTypes.arrayOf(asset),
    locations: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string
      })
    )
  }),
  assignment,
  workOutcomes: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  ),
  pelAssetConds: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  ),
  nonCompletionReasons: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  ),
  hideCreateButton: PropTypes.bool.isRequired,
  handleChange: PropTypes.func,
  workOutcomeMandatory: PropTypes.bool,
  completionNotesMandatory: PropTypes.bool
}
