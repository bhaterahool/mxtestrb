import React, { useState } from 'react'
import { SideNav, Tabs, Tab } from 'carbon-components-react'
import PropTypes from 'prop-types'

export const SideNavigation = ({ isOpen, Search, History }) => {
  const [selected, setSelected] = useState(0)

  const onClick = () => {
    
    setSelected(0)
  }

  return (
    <SideNav
      className={`pel--bx-side ${isOpen ? '' : 'pel--searchlist-toggle'}`}
      isFixedNav
      expanded={isOpen}
      aria-label="Side navigation"
    >
      <Tabs aria-label="listbox" selected={selected} onSelectionChange={setSelected}>
        <Tab className="pel--search-tab" id="search-tab" label="Search">
          <Search />
        </Tab>
        {History && (
          <Tab id="history-tab" label="History">
            <History handleClick={onClick} />
          </Tab>
        )}
      </Tabs>
    </SideNav>
  )
}

SideNavigation.defaultProps = {
  History: null
}

SideNavigation.propTypes = {
  isOpen: PropTypes.bool,
  Search: PropTypes.func,
  History: PropTypes.func
}
