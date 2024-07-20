import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { TextInputSkeleton, DatePicker, DatePickerInput } from 'carbon-components-react'
import moment from 'moment'
import { useFormContext } from 'react-hook-form'
import { useFieldRemarks } from './useFieldRemarks'
import { Remarks } from './Remarks'
import { PelTextInput } from './PelTextInput'

export const PelDateInput = ({
  date,
  format,
  showSkeleton,
  name,
  hidden,
  buttons,
  remarks,
  readOnly,
  ...props
}) => {
  const { register, setValue } = useFormContext()
  const { showRemarks, handleKeyDown, handleKeyUp } = useFieldRemarks()

  useEffect(() => {
    register({ name })
  }, [register])

  if (showSkeleton) return <TextInputSkeleton />

  
  if (hidden) return null

  const value = date ? moment(date).toDate() : null
  const datetime = date ? moment(date).format('DD-MMM-YYYY HH:mm') : null

  return (
    <>
      <PelTextInput name={name} readOnly={readOnly} {...props} value={datetime} />

      {buttons && <div className="button-container">{buttons}</div>}
      {showRemarks && remarks && <Remarks text={remarks} />}
    </>
  )
}

PelDateInput.defaultProps = {
  readOnly: false,
  hidden: false
}

PelDateInput.propTypes = {
  date: PropTypes.string,
  format: PropTypes.string,
  buttons: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  remarks: PropTypes.string,
  hidden: PropTypes.bool,
  labelText: PropTypes.string,
  maxlength: PropTypes.number,
  name: PropTypes.string,
  readOnly: PropTypes.bool,
  showSkeleton: PropTypes.bool
}
