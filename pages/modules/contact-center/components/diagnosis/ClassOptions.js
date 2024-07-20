import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { RadioButton } from 'carbon-components-react'

export const ClassOptions = ({ options, path, onChange }) => {
  const handleChange = (option, handler) => () => handler(option)

  return _.map(options, (option, index) => {
    if (
      !path.length ||
      path[path.length - 1] === option.parent ||
      (path[path.length - 1] === option.classstructureid && !option.haschildren)
    ) {
      return (
        <RadioButton
          key={`option-${index}`}
          checked={path.includes(option.classstructureid)}
          name={option.parent}
          value={option.classstructureid}
          labelText={option.description}
          onChange={handleChange(option, onChange)}
        />
      )
    }

    return null
  })
}

ClassOptions.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      classstructureid: PropTypes.string.isRequired,
      parent: PropTypes.string,
      description: PropTypes.string.isRequired
    })
  ),
  path: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired
}
