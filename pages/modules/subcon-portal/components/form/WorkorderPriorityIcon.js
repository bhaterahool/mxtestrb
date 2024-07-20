import React from 'react'
import PropTypes, { oneOfType } from 'prop-types'
import WarningAlt16 from '@carbon/icons-react/es/warning--alt/16'
import { useMaxProp } from '../../../../shared/hooks/useMaxProp'

export const WorkorderPriorityIcon = ({ priority }) => {
  const priorityWarningMaxProp = useMaxProp('pel.mxplus.subcon.prioritywarning')
  const isHighPriority = priorityWarningMaxProp?.maxpropvalue?.propvalue?.includes(priority)

  if (priority && isHighPriority) {
    return <WarningAlt16 className="input-icon-position pel--form-red-color pel--rm-padding" />
  }
  return null
}

WorkorderPriorityIcon.defaultProps = {}

WorkorderPriorityIcon.propTypes = {
  priority: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}
