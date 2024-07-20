import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Select, SelectItem, SelectSkeleton } from 'carbon-components-react'
import './PelSelectInput.scss'

export const PelSelectInput = forwardRef(
  (
    {
      defaultValue = 'default',
      disabled = false,
      defaultText = 'Choose an option',
      options,
      name,
      labelText,
      invalid = false,
      onChange,
      skeleton
    },
    ref
  ) =>
    skeleton ? (
      <SelectSkeleton />
    ) : (
      <Select
        id={name}
        name={name}
        className="pel-select-input"
        defaultValue={defaultValue}
        ref={ref}
        labelText={labelText}
        invalid={invalid}
        disabled={disabled}
        onChange={onChange}
      >
        <SelectItem key={btoa(`${name}${defaultValue}`)} text={defaultText} disabled hidden />
        {options &&
          options.map(({ value, text, disabled = false }, index) => (
            <SelectItem
              key={btoa(`${name}${value}${index}`)}
              value={value}
              text={text}
              disabled={disabled}
            />
          ))}
      </Select>
    )
)

PelSelectInput.propTypes = {
  defaultValue: PropTypes.string,
  defaultText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      text: PropTypes.string
    })
  ),
  name: PropTypes.string.isRequired,
  labelText: PropTypes.string,
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  skeleton: PropTypes.bool
}
