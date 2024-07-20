import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { DomainValueSelector, Yorn, FreeText } from './domains'

export const isBinaryChoice = attribute => {
  const domainid = attribute?.assetattribute?.[0].domainid

  if (domainid === 'YORN') return true

  if (domainid === 'PELMETAQUES') {
    return _.xor(_.map(attribute.pelmetadata, 'value'), ['YES', 'NO']).length === 0
  }

  return false
}

export const ClassAttributesList = ({
  attributes,
  handleAttribute,
  selectedAttributes,
  readOnly
}) => {
  if (!attributes.length) return null

  
  const dataTypeDomains = {
    NUMERIC: 'numericdomain',
    ALN: 'alndomain',
    TABLE: 'pelmetadata'
  }

  const fieldTypes = {
    NUMERIC: 'numvalue',
    ALN: 'alnvalue',
    TABLE: 'tablevalue'
  }

  return (
    <div className="attributes">
      <h4>Additional Attributes</h4>
      {_.map(_.orderBy(attributes, ['assetattributeid'], ['asc']), attribute => {
        const dataType = _.get(attribute, 'assetattribute[0].datatype')

        
        const selectedAttr =
          selectedAttributes &&
          selectedAttributes?.find(
            selectedAttr => selectedAttr.assetattrid === attribute.assetattrid
          )

        let value
        if (selectedAttr) {
          value = selectedAttr.value ? selectedAttr.value : selectedAttr[fieldTypes[dataType]]
        } else {
          value = ''
        }

        // Handle domain.
        if (attribute.domainid) {
          const domainKey = dataTypeDomains[dataType]

          // Handle domain data based on corresponding key in data.
          if (attribute[domainKey]) {
            // Handle YORN domains separately.
            if (attribute.domainid === 'YORN') {
              return (
                <Yorn
                  {...attribute}
                  key={`yorn-${attribute.assetattributeid}`}
                  type={fieldTypes[dataType]}
                  yes="Y"
                  no="N"
                  handleAttribute={handleAttribute}
                  value={value}
                  readOnly={readOnly}
                />
              )
            }

            
            
            const isBinaryOption =
              _.xor(_.map(attribute[domainKey], 'value'), ['YES', 'NO']).length === 0

            
            if (isBinaryOption) {
              return (
                <Yorn
                  {...attribute}
                  key={`yorn-${attribute.assetattributeid}`}
                  type={fieldTypes[dataType]}
                  yes="YES"
                  no="NO"
                  handleAttribute={handleAttribute}
                  value={value}
                  readOnly={readOnly}
                />
              )
            }

            
            return (
              <DomainValueSelector
                {...attribute}
                key={`dvs-${attribute.assetattributeid}`}
                type={fieldTypes[dataType]}
                values={attribute[domainKey]}
                handleAttribute={handleAttribute}
                value={value}
                readOnly={readOnly}
              />
            )
          }
        }

        
        
        return (
          <FreeText
            {...attribute}
            key={`freetext-${attribute.assetattributeid}`}
            type={fieldTypes[dataType]}
            handleAttribute={handleAttribute}
            freeTextValue={value}
            readOnly={readOnly}
          />
        )
      })}
    </div>
  )
}

ClassAttributesList.propTypes = {
  handleAttribute: PropTypes.func.isRequired,
  attributes: PropTypes.array,
  selectedAttributes: PropTypes.array,
  ticketspec: PropTypes.arrayOf(
    PropTypes.shape({
      ticketspecid: PropTypes.number
    })
  ),
  readOnly: PropTypes.bool
}
