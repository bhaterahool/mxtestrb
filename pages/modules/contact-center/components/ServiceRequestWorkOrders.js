import React, { useState } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { WorkOrderSelector } from './WorkOrderSelector'
import { WorkOrderDetails } from './WorkOrderDetails'
import { WorkOrderLabour } from './WorkorderLabour'
import { WorkOrderMaterials } from './WorkorderMaterials'

const getWorkOrders = data => _.flatMap(_.get(data, 'relatedrecord'), 'workorder')


export const ServiceRequestWorkOrders = ({ sr, reload }) => {
  const [workOrderIndex, setWorkOrderIndex] = useState(0)
  const onWorkOrderSelected = index => setWorkOrderIndex(index)

  const workOrders = getWorkOrders(sr)?.filter(row => row?.workorderid) || []
  const workOrder = workOrders[workOrderIndex]

  if (!workOrders.length || !workOrder) {
    return null
  }

  return (
    <>
      <WorkOrderSelector
        workOrders={workOrders}
        workOrderIndex={workOrderIndex}
        onWorkOrderSelected={onWorkOrderSelected}
      />
      <WorkOrderDetails wo={workOrder} />
      <WorkOrderLabour wo={workOrder} sr={sr} reload={reload} />
      <WorkOrderMaterials wo={workOrder} />
    </>
  )
}

ServiceRequestWorkOrders.propTypes = {
  sr: PropTypes.shape({
    relatedRecord: PropTypes.arrayOf(
      PropTypes.shape({
        workorder: PropTypes.shape({
          wonum: PropTypes.string
        })
      })
    )
  }),
  reload: PropTypes.func.isRequired
}
