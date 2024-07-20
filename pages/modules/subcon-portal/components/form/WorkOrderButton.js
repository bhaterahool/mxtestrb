import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'carbon-components-react'
import Launch16 from '@carbon/icons-react/lib/launch/16'
import * as Props from './props'

const openWorkOrder = href => {

}

export const WorkOrderButton = ({ workOrder }) => {
  return (
    <Button
      key="openWorkOrder"
      renderIcon={Launch16}
      kind="tertiary"
      iconDescription="Open Work Order"
      tooltipPosition="top"
      hasIconOnly
      size="small"
      onClick={openWorkOrder}
    />
  )
}

WorkOrderButton.propTypes = {
  workOrder: Props.workOrder
}