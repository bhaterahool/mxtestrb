import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { TextInput } from 'carbon-components-react'

export const FreeText = ({
  assetattribute,
  assetattrid,
  type,
  classspecid,
  handleAttribute,
  freeTextValue,
  readOnly,
  maxlength = 200
}) => {
  const question = assetattribute[0]?.description

  const textValue = !['alnvalue', 'numvalue'].includes(freeTextValue) ? freeTextValue : ''

  const handleChange = e => {
    const {
      target: { value }
    } = e

    const inputText = value.length > maxlength ? value.slice(0, maxlength) : value
    const val = type === 'NUMERIC' ? inputText.replace(/\D/, '') : inputText

    handleAttribute(assetattrid, classspecid, val, type)
  }

  return (
    <TextInput
      id={`diag-ft-${assetattrid}`}
      labelText={question}
      onChange={handleChange}
      value={textValue ?? ''}
      readOnly={readOnly}
    />
  )
}

FreeText.propTypes = {
  assetattribute: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string
    })
  ),
  classspecid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  type: PropTypes.string,
  handleAttribute: PropTypes.func.isRequired,
  freeTextValue: PropTypes.string.isRequired,
  assetattrid: PropTypes.string,
  readOnly: PropTypes.bool,
  maxlength: PropTypes.number
}
