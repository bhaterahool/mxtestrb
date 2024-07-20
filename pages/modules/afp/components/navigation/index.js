import React from 'react'
import PropTypes from 'prop-types'

export const Navigation = ({
  items,
  selectedItem,
  itemRenderer,
  handleSelect,
  handleClose,
  isOpen
}) => {
  const tabs = items.length
    ? items.map((item, index) =>
        itemRenderer({
          key: `nav-tab-${index}`,
          item,
          selectedItem,
          handleClose,
          handleSelect
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
  items: PropTypes
    .arrayOf
    
    (),
  selectedItem: PropTypes.string,
  itemRenderer: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
}
