import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

export const WorkOrderSelector = ({ workOrderIndex, workOrders, onWorkOrderSelected }) => {
  const onClick = index => e => {
    e.preventDefault()
    return onWorkOrderSelected(index)
  }

  return (
    <>
      <h4 className="pel--sub-header pel--indent">Work Orders</h4>
      <ul>
        {workOrders.map((workOrder, index) => {
          const className = classnames({
            'pel--pill-button pel-button-border': true,
            active: index === workOrderIndex
          })

          return (
            <li key={workOrder.workorderid} className={className}>
              <button type="button" onClick={onClick(index)}>
                <span>{workOrder.wonum}</span>
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
