import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Launch16 from '@carbon/icons-react/lib/launch/16'

export const WorkOrderSelector = ({ workOrderIndex, workOrders, onWorkOrderSelected }) => {
  const openWorkOrder = workorder => {
    const [mx] = workorder.localref.split('/oslc/')
    window.open(
      `${mx}/ui/login?login=url&event=loadapp&value=pelpluspwo&uniqueid=${workorder.workorderid}`,
      '_blank',
      'noopener noreferrer'
    )
  }

  const onClick = (workOrder, index) => e => {
    e.preventDefault()

    if (workOrders.length === 1) {
      
      return openWorkOrder(workOrder, index)
    }

    return onWorkOrderSelected(index)
  }

  const onOpenClick = (workOrder, index) => e => {
    e.preventDefault()

    openWorkOrder(workOrder)

    return onWorkOrderSelected(index)
  }

  return (
    <>
      <h4 className="pel--sub-header pel--indent">Work Orders</h4>
      <ul>
        {workOrders.map((workOrder, index) => {
          const className = classnames({
            'pel--pill-button': true,
            active: index === workOrderIndex
          })

          return (
            <li key={workOrder.workorderid} className={className}>
              <button type="button" onClick={onClick(workOrder, index)}>
                <span>{workOrder.wonum}</span>
              </button>
              <button type="button" onClick={onOpenClick(workOrder, index)}>
                <Launch16 />
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

WorkOrderSelector.propTypes = {
  onWorkOrderSelected: PropTypes.func.isRequired,
  workOrders: PropTypes.arrayOf(
    PropTypes.shape({
      wonum: PropTypes.string.isRequired
    })
  ).isRequired,
  workOrderIndex: PropTypes.number.isRequired
}
