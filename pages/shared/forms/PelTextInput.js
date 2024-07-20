import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { TextInputSkeleton, TextInput } from 'carbon-components-react'
import { Remarks } from './Remarks'
import { useFieldRemarks } from './useFieldRemarks'
import { DescriptionText } from './DescriptionText'

export const PelTextInput = forwardRef(
  (
    {
      showSkeleton,
      hidden,
      buttons,
      remarks,
      showDescription,
      descriptionField,
      description,
      value,
      wrapperClassName,
      onChange,
      invalid,
      name,
      onlyNumeric,
      ...props
    },
    ref
  ) => {
    const { showRemarks, handleKeyDown, handleKeyUp } = useFieldRemarks()

    if (showSkeleton) return <TextInputSkeleton />

    if (hidden) return null

    return (
      <div
        className={`flex pel--text-input ${wrapperClassName ?? ''} ${
          showDescription ? 'has-description' : ''
        }`}
      >
        <TextInput
          ref={ref}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          value={value}
          onChange={onChange}
          name={name}
          invalid={invalid || false}
          id={name}
          autoComplete="new-password"
          {...props}
        />
        {showDescription && <DescriptionText text={description} />}
        {buttons && <div className="button-container">{buttons}</div>}
        {showRemarks && remarks && <Remarks text={remarks} />}
      </div>
    )
  }
)

PelTextInput.propTypes = {
  descriptionField: PropTypes.string,
  error: PropTypes.shape({
    type: PropTypes.string,
    
    types: PropTypes.array,
    message: PropTypes.string,
    ref: PropTypes.element
  }),
  buttons: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  remarks: PropTypes.string,
  hidden: PropTypes.bool,
  showDescription: PropTypes.bool,
  description: PropTypes.string,
  showSkeleton: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  wrapperClassName: PropTypes.string,
  onChange: PropTypes.func,
  invalid: PropTypes.any,
  name: PropTypes.string.isRequired,
  onlyNumeric: PropTypes.bool
}
