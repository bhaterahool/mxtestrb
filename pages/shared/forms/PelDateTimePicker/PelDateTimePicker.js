import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { DatePicker, DatePickerInput, TimePicker, TextInputSkeleton } from 'carbon-components-react'
import { Controller } from 'react-hook-form'
import moment from 'moment'
import classNames from 'classnames'
import './PelDateTimePicker.scss'

export const PelDateTimePicker = forwardRef(
  (
    {
      value = '',
      label,
      onChange = () => {},
      readOnly = false,
      minDate,
      maxDate,
      name,
      dateReadOnly,
      withTime = true,
      light,
      invalid,
      invalidText,
      showSkeleton
    },
    ref
  ) => {
    let dateTime = moment(value)
    const dateValue = dateTime.format('DD-MMM-YYYY')
    let timeValue = dateTime.format('HH:mm')
    const minTime = moment(minDate).format('HH:mm')
    const minDateFormatted = moment(minDate).format('DD-MMM-YYYY')
    const maxDateFormatted = maxDate ? moment(maxDate).format('DD-MMM-YYYY') : ''

    const handleDateChange = ([value]) => {
      const newDate = moment(value)
      const day = newDate.date()
      const month = newDate.month()
      const year = newDate.year()
      if (dateTime.format() === 'Invalid date') {
        dateTime = moment(new Date())
        timeValue = dateTime.format('HH:mm')
      }
      dateTime
        .year(year)
        .month(month)
        .date(day)
      onChange(dateTime.format())
    }

    const handleTimeChange = ({ target }) => {
      const { value } = target
      const [hours, minutes] = value.split(':')
      dateTime.hour(hours).minute(minutes)
      onChange(dateTime.format())
    }

    const datePickerClass = classNames({
      'pel-date-picker': true,
      'pel-date-picker-readonly': readOnly ? false : dateReadOnly
    })

    if (showSkeleton) return <TextInputSkeleton />

    return (
      <div className="pel-date-time-picker">
        <div className="pel-date-time-picker--date-wrapper">
          <DatePicker
            className={datePickerClass}
            dateFormat="d-M-Y"
            datePickerType="single"
            minDate={minDateFormatted}
            maxDate={maxDateFormatted}
            value={dateValue ?? ''}
            onChange={handleDateChange}
            light={light}
          >
            <DatePickerInput
              name={`${name}-date`}
              id={`${name}-date`}
              value={value ? dateValue : ''}
              placeholder="dd-mmm-yyyy"
              disabled={readOnly}
              labelText={label}
              pattern=".*"
              readOnly={dateReadOnly}
              autoComplete="off"
              invalid={invalid}
              invalidText={invalidText}
            />
          </DatePicker>
        </div>
        {withTime ? (
          <div className="pel-date-time-picker--time-wrapper">
            <TimePicker
              id={`${name}-time`}
              value={value ? timeValue : ''}
              type="time"
              onChange={handleTimeChange}
              name={`${name}-time`}
              readOnly={readOnly}
            />
          </div>
        ) : null}
      </div>
    )
  }
)

PelDateTimePicker.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
  name: PropTypes.string,
  dateReadOnly: PropTypes.bool,
  withTime: PropTypes.bool,
  light: PropTypes.bool,
  invalid: PropTypes.bool,
  invalidText: PropTypes.string
}


PelDateTimePicker.Rhf = ({ control, name, label, rules, ...props }) => {
  return (
    <Controller
      {...props}
      control={control}
      label={label}
      name={name}
      rules={rules}
      defaultValue=""
      as={<PelDateTimePicker label={label} />}
    />
  )
}
PelDateTimePicker.Rhf.propTypes = {
  
  ...PelDateTimePicker.propTypes,
  control: PropTypes.object,
  name: PropTypes.string.isRequired,
  rules: PropTypes.shape({ required: PropTypes.bool })
}
