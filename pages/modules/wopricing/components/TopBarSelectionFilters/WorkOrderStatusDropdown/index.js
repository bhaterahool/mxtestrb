import React from 'react'
import { MultiSelect } from 'carbon-components-react'
import PropTypes from 'prop-types'

export const WorkOrderStatusDropdown = ({
  items = [],
  handleChange,
  selectedItems,
  initialSelectedItems = []
}) => {
  return (
    <div className="workorder-status__multiselect">
      <MultiSelect.Filterable
        id="wordOrderStatus"
        placeholder="Work Order Status"
        items={items}
        initialSelectedItems={initialSelectedItems}
        onChange={handleChange}
        selectedItems={selectedItems}
        itemToString={item => item.text}
      />
    </div>
  )
}

WorkOrderStatusDropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
      defaultSelected: PropTypes.bool
    })
  ),
  handleChange: PropTypes.func,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
      defaultSelected: PropTypes.bool
    })
  ),
  initialSelectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
      defaultSelected: PropTypes.bool
    })
  )
}
