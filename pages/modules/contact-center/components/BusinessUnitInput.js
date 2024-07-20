import React from 'react'
import PropTypes from 'prop-types'
import { Select, SelectItem, TextInputSkeleton } from 'carbon-components-react'
import { PelTextInput } from '../../../shared/forms'

export const BusinessUnitInput = ({
  busUnits,
  handleChange,
  showSkeleton,
  pelbusunit,
  isDisabled,
  invalid,
  readOnly
}) => {
  if (showSkeleton) return <TextInputSkeleton />

  if (readOnly) {
    const businessUnit = busUnits.find(bu => bu.value === pelbusunit)?.description ?? pelbusunit
    return (
      <PelTextInput
        id="pelbusunit-readonly"
        name="pelbusunit-readonly"
        labelText="Business Unit"
        value={businessUnit}
        readOnly
        light
      />
    )
  }

  return (
    <Select
      labelText="Business Unit"
      onChange={handleChange}
      value={pelbusunit}
      invalid={invalid}
      disabled={isDisabled}
      id={`pelbusunit-${pelbusunit}`}
      className="pelbusunit"
    >
      {busUnits?.map(({ value, description }) => (
        <SelectItem key={btoa(`${value}${description}`)} text={description} value={value} />
      ))}
    </Select>
  )
}

BusinessUnitInput.propTypes = {
  handleChange: PropTypes.func,
  pelbusunit: PropTypes.string.isRequired,
  showSkeleton: PropTypes.bool,
  isDisabled: PropTypes.bool,
  invalid: PropTypes.bool,
  readOnly: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  busUnits: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired
    })
  )
}
