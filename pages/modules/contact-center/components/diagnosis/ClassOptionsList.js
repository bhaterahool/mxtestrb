import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { FormGroup, RadioButton } from 'carbon-components-react'

export const ClassOptionsList = ({ nodes, handleSelection, classstructureid, question }) => {
  const options = _.map(nodes, node => {
    return (
      <RadioButton
        name={node.parent}
        checked={node.classstructureid === classstructureid}
        value={node.classstructureid}
        labelText={node.classificationdesc || node.description}
        onChange={value => handleSelection(value)}
        key={node.classstructureid}
      />
    )
  })

  const message = question || 'Please Select a Classification'

  return (
    <div>
      {message && <h4>{message}</h4>}
      <FormGroup legendText="">{options}</FormGroup>
    </div>
  )
}

ClassOptionsList.propTypes = {
  nodes: PropTypes.shape({
    classstructureid: PropTypes.string
  }),
  handleSelection: PropTypes.func.isRequired,
  classstructureid: PropTypes.string.isRequired,
  question: PropTypes.string
}
