import PropTypes from 'prop-types'
import React from 'react'
import { TableCell } from 'carbon-components-react'
import { ObjectTooltip } from '../../modules/contact-center/components/ObjectTooltip'
import { PelPersonToolTip } from '../../modules/shared-components/PelPersonToolTip'

export const TooltipCell = ({ value, personData, ...props }) => {
  return (
    <TableCell>
      {value && <ObjectTooltip {...props} />}
      {personData && <PelPersonToolTip personData={personData} {...props} />}
    </TableCell>
  )
}

TooltipCell.propTypes = {
  value: PropTypes.string,
  personData: PropTypes.arrayOf(PropTypes.shape({}))
}
