import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Provider } from 'react-redux'
import { SideNav, Tabs, Tab, Button } from 'carbon-components-react'
import Search32 from '@carbon/icons-react/lib/search/32'
import ChevronLeft32 from '@carbon/icons-react/lib/chevron--left/32'
import { DefaultHeader } from '../app/components'
import { Assignment } from './layouts/Assignment'
import { ToastProvider } from '../../shared/toasts/ToastProvider'
import PropTypes from 'prop-types'


import { SubcontractHistory } from './components/history/SubcontractHistory'
import { SubcontractSearch } from './search/components'
import { SubcontractSearchProvider } from './search/SubcontractSearchProvider'


import { RegistryProvider } from '../../shared/RegistryProvider'

import * as state from './state'
import * as actions from './state/actions'

export const SubCon = ({
  showHeader = true,
  showSideNav = true, 
  assignmentId = 0,
  loadAssignmentDetail = false
}) => {

  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(true)

  const onSearchFlip = () => {
    setOpen(!open)
  }

  const onClick = () => {
    
    setSelected(0)
  }

  return (
    <>
      {showHeader && <DefaultHeader />}
      <SubcontractSearchProvider>
        <Provider store={state.store}>
          {showSideNav && <>
            <SideNav
              className={`pel--bx-side ${open ? '' : 'pel--searchlist-toggle'}`}
              isFixedNav
              expanded={open}
              aria-label="Side navigation"
            >
              <Tabs
                aria-label="listbox"
                className="pel--search-tabs"
                selected={selected}
                onSelectionChange={setSelected}
              >
                <Tab className="pel--search-tab" id="search-tab" label="Search">
                  <SubcontractSearch />
                </Tab>
                <Tab id="history-tab" label="History">
                  <SubcontractHistory handleClick={onClick} />
                </Tab>
              </Tabs>
            </SideNav>
            <Button
              renderIcon={open ? ChevronLeft32 : Search32}
              className="pel--searchlist-toggle-btn"
              onClick={() => onSearchFlip()}
              iconDescription={open ? 'Close' : 'Search'}
              hasIconOnly
            />
          </>}
          <Assignment loadAssignmentDetail={loadAssignmentDetail} assignmentId={assignmentId} isOpen={open} />
        </Provider>
      </SubcontractSearchProvider>
    </>

  )
}

export const SubConPortal = () => {
  return (
    <>
      <Helmet>
        <base href={process.env.BASE_PATH} />
        <title>Subcon Portal</title>
      </Helmet>

      <ToastProvider>
        <RegistryProvider>
          <SubCon/>
        </RegistryProvider>
      </ToastProvider>
    </>
  )
}

SubConPortal.propTypes = {
  assignmentId: PropTypes.number,
  loadAssignmentDetail: PropTypes.bool
}