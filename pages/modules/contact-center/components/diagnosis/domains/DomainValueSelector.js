import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { RadioButton, RadioButtonGroup, FormGroup } from 'carbon-components-react'

export const DomainValueSelector = ({
  assetattribute,
  assetattrid,
  assetattributeid,
  classspecid,
  type,
  values,
  handleAttribute,
  value,
  readOnly
}) => {
  const question = assetattribute[0]?.description

  const handleChange = value => handleAttribute(assetattrid, classspecid, value, type)

  return (
    <FormGroup legendText={question}>
      <RadioButtonGroup
        legendText={question}
        onChange={handleChange}
        valueSelected={value}
        name={`dvs-rbg-${assetattributeid})`}
        readOnly={readOnly}
      >
        {_.map(values, ({ description, value: buttonvalue }) => (
          <RadioButton
            key={`dvs-rbg-${assetattributeid}-${value})`}
            value={buttonvalue}
            labelText={description}
            disabled={readOnly && buttonvalue !== value}
          />
        ))}
      </RadioButtonGroup>
    </FormGroup>
  )
}

DomainValueSelector.propTypes = {
  assetattribute: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string
    })
  ),
  assetattrid: PropTypes.string,
  handleAttribute: PropTypes.func.isRequired,
  type: PropTypes.string,
  classspecid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  assetattributeid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  values: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ),
  readOnly: PropTypes.bool
}
