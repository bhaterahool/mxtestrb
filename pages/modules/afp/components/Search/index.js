import React, { useState } from 'react'
import { Tabs, Tab, SideNav } from 'carbon-components-react'
import { useUI } from '../../context/ui-context/ui-context'
import { Search } from './Search'
import { History } from './History'

const initSearchState = {
  id: null,
  type: null,
  date: null,
  data: {},
  searchParams: {
    savedQuery: null
  },
  skipSearch: true
}

export const AfpSearch = ({ searchRef }) => {
  const [searchState, setSearchState] = useState(initSearchState)
  const [selectedTab, setSelectedTab] = useState(0)
  const { searchOpen } = useUI()

  const onSearch = opts => {
    setSelectedTab(0)
    setSearchState({
      ...opts,
      date: new Date()
    })
  }

  return (
    <SideNav
      className={`pel--bx-side ${searchOpen ? '' : 'pel--searchlist-toggle'}`}
      isFixedNav
      expanded={searchOpen}
      aria-label="Side navigation"
    >
      <Tabs aria-label="listbox" selected={selectedTab} onSelectionChange={setSelectedTab}>
        <Tab className="pel--search-tab" id="search-tab" label="Search">
          <Search currSearch={searchState} onSearch={onSearch} searchRef={searchRef} />
        </Tab>
        <Tab id="history-tab" label="History">
          <History onClick={onSearch} currSearch={searchState} />
        </Tab>
      </Tabs>
    </SideNav>
  )
}
