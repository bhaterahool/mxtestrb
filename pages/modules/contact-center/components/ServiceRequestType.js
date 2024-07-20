import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { FormGroup, RadioButton, Select, SelectItem } from 'carbon-components-react'
import { UsableRequestTypes } from '../constants'
import { useRegistry } from '../../../shared/RegistryProvider'
import { PelTextInput } from '../../../shared/forms'

export const getAvailableOptions = (types, params) =>
  _.reduce(
    types,
    (typesList, label, type) => {
      let enabled = true
      
      if (['CH', 'RC'].includes(type) && !params.origrecordid) {
        enabled = false
      }

      
      if (
        params.origrecordid &&
        type !== params.pelsrtype &&
        !['CP', 'CC', 'IN', 'CH'].includes(type)
      ) {
        enabled = false
      }

      return [...typesList, { type, label, enabled }]
    },
    []
  )

export const getSubTypes = (subTypeMetaData, srType) => {
  const subTypes = subTypeMetaData?.filter(subType =>
    subType.pelmetaspecvalue.some(
      metaSpec => metaSpec.alnvalue === 'Y' && metaSpec.metaspecvalue === `VALIDFOR${srType}`
    )
  )
  if (subTypes) {
    return subTypes.map(({ value, description }) => ({
      type: value,
      label: description,
      enabled: true
    }))
  }

  return []
}

export const ServiceRequestType = ({
  pelsrtype,
  pelsrsubtype,
  origrecordid,
  ticketId,
  handleTypeChange,
  readOnly
}) => {
  const [registry] = useRegistry()

  const handleChange = ticketId => value => {
    const srType = {
      pelsrtype: value,
      pelsrsubtype: value !== 'CH' ? '' : 'PROGRESS'
    }

    handleTypeChange(ticketId, srType)
  }

  
  const handleSubTypeChange = ticketId => e => {
    const srType = {
      pelsrsubtype: e.target.value
    }
    handleTypeChange(ticketId, srType)
  }

  const options = getAvailableOptions(UsableRequestTypes, {
    origrecordid,
    pelsrtype
  })

  let subTypes = getSubTypes(registry.srSubType, pelsrtype)
  if (ticketId?.includes('new')) {
    subTypes = subTypes.filter(substype => substype.type !== 'NOTENTITLED')
  }

  if (readOnly) {
    const srType = options.find(opt => opt.type === pelsrtype)?.label ?? pelsrtype
    const srSubType = subTypes.find(subType => subType.type === pelsrsubtype)?.label ?? pelsrsubtype

    return [
      <PelTextInput
        id="srtype-readonly"
        name="srtype-readonly"
        labelText="Type"
        value={srType}
        readOnly
        light
      />,
      srSubType && (
        <PelTextInput
          id="srsubtype-readonly"
          name="srsubtype-readonly"
          labelText="SR Sub-Type"
          value={srSubType}
          readOnly
          light
        />
      )
    ]
  }

  const buttons = _.map(options, ({ type, label, enabled }) => {
    const id = `sr-type-${type}`

    if (type === pelsrtype && subTypes.length) {
      return (
        <React.Fragment key={`${id}-wrapper`}>
          <RadioButton
            name="pelsrtype"
            key={id}
            id={id}
            value={type}
            labelText={label}
            disabled={!enabled}
            checked
            onChange={handleChange(ticketId)}
          />
          <Select
            key={`${id}-subtypes`}
            onChange={handleSubTypeChange(ticketId)}
            value={pelsrsubtype}
            name="pelsrsubtype"
            hideLabel
            id={id}
          >
            {type === 'IN' && (
              <SelectItem key="status-default" value="" text="Please select a reason" disabled />
            )}
            {subTypes.map(subType => (
              <SelectItem key={subType.type} value={subType.type} text={subType.label} />
            ))}
          </Select>
        </React.Fragment>
      )
    }

    return (
      <RadioButton
        name="pelsrtype"
        key={id}
        id={id}
        value={type}
        labelText={label}
        disabled={!enabled}
        checked={pelsrtype === type}
        onChange={handleChange(ticketId)}
      />
    )
  })

  return (
    <FormGroup className="pel--sr-type-selector" legendText="">
      <label htmlFor="id-srtypelist" className="bx--label">
        Type
      </label>
      <div
        id="id-srtypelist"
        className="bx--radio-button-group bx--radio-button-group--label-right"
      >
        {buttons}
      </div>
    </FormGroup>
  )
}

ServiceRequestType.defaultProps = {
  pelsrtype: 'RW'
}

ServiceRequestType.propTypes = {
  pelsrtype: PropTypes.string,
  pelsrsubtype: PropTypes.string,
  origrecordid: PropTypes.string,
  handleTypeChange: PropTypes.func.isRequired,
  ticketId: PropTypes.string,
  readOnly: PropTypes.bool
}
