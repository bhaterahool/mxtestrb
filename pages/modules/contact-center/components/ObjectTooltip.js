import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'carbon-components-react'
import _ from 'lodash'
import { api } from '../../app/api'
import { useObject } from '../../../shared/hooks/useObject'

export const ObjectTooltip = ({
  loadingElement,
  title,
  fields,
  objectType,
  query,
  hoverDisplay,
  iconOnly,
  refresh,
  ...props
}) => {
  let { obj } = props
  const [hovered, setHovered] = useState(false)

  if (!obj) {
    const { loading, data } = useObject(api, objectType, query, false, refresh)

    if (loading) {
      return iconOnly ?? loadingElement ?? <>Loading</>
    }

    obj = _.get(data, `member[${data.member.length - 1}]`)

    if (!obj) {
      return null
    }
  }

  const toggleHover = () => setHovered(!hovered)

  const heading = _.get(obj, title)

  if (!heading) return null

  
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

ObjectTooltip.propTypes = {
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  obj: PropTypes.shape(PropTypes.any),
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string
    })
  ),
  objectType: PropTypes.string,
  query: PropTypes.string,
  hoverDisplay: PropTypes.bool,
  loadingElement: PropTypes.element,
  iconOnly: PropTypes.bool
}
