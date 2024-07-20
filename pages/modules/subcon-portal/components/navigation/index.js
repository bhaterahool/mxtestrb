import React from 'react'
import PropTypes from 'prop-types'

export const Navigation = ({
  items,
  selectedItem,
  itemRenderer,
  handleSelect,
  handleClose,
  isOpen,
  showSummary,
  handleSummaryRefresh
}) => {
  const summaryItem = [
    {
      assignmentid: 'summary'
    }
  ]
  const tabItems = [...summaryItem, ...items]

  const tabs = tabItems.length
    ? tabItems.map((item, index) =>
        itemRenderer({
          key: `nav-tab-${index}`,
          item,
          selectedItem,
          handleClose,
          handleSelect,
          showSummary,
          handleSummaryRefresh
        })
      )
    : []

  return (
    <div className={`pel--nav-bar ${isOpen ? '' : 'pel--searchlist-toggle'}`}>
      <ul className="pel--sr-tabs">{tabs}</ul>
    </div>
  )
}

Navigation.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})),
  selectedItem: PropTypes.shape({}),
  itemRenderer: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  showSummary: PropTypes.bool.isRequired,
  handleSummaryRefresh: PropTypes.func
}
