import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'carbon-components-react'
import _ from 'lodash'

export const PelPersonToolTip = ({
  title,
  fields,
  hoverDisplay,
  iconOnly,
  personData,
  ...props
}) => {
  let { obj } = props
  const [hovered, setHovered] = useState(false)

  if (!obj) {
    obj = _.get(personData, '[0]')
    if (!obj || !obj?.displayname) {
      return null
    }
  }

  const toggleHover = () => setHovered(!hovered)

  const heading = _.get(obj, title)

  
  if (!fields.some(f => _.get(obj, f.field))) {
    return !iconOnly && heading && <div className="bx--tooltip__label">{heading}</div>
  }

  const tooltipProps = {
    direction: 'bottom',
    triggerText: !iconOnly && heading,
    ...props
  }

  if (hoverDisplay) {
    tooltipProps.open = hovered
  }

  return (
    <div className="flex align-center" onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
      <Tooltip {...tooltipProps}>
        <div>
          {heading && <h4 className="bx--tile-heading">{heading}</h4>}
          {fields.map(f => {
            const val = _.get(obj, f.field)
            if (!val) return null

            return [
              f.label && <>{f.label}</>,
              <p key={f.field} className="bx--tile-text">
                {val}
              </p>
            ]
          })}
        </div>
      </Tooltip>
    </div>
  )
}

PelPersonToolTip.propTypes = {
  obj: PropTypes.shape({
    displayname: PropTypes.string,
    primaryemail: PropTypes.string,
    primaryphone: PropTypes.string,
    personid: PropTypes.string
  }),
  title: PropTypes.string,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string
    })
  ),
  personData: PropTypes.arrayOf(
    PropTypes.shape({
      displayname: PropTypes.string.isRequired,
      primaryemail: PropTypes.string,
      primaryphone: PropTypes.string,
      personid: PropTypes.string
    }).isRequired
  ),
  hoverDisplay: PropTypes.bool,
  iconOnly: PropTypes.bool
}
