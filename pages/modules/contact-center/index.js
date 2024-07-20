import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { Button } from 'carbon-components-react'
import Search32 from '@carbon/icons-react/lib/search/32'
import ChevronLeft32 from '@carbon/icons-react/lib/chevron--left/32'
import { DefaultHeader } from '../app/components'
import { ToastProvider } from '../../shared/toasts/ToastProvider'
import { ServiceRequestProvider } from './ServiceRequestProvider'
import { ServiceRequest, History } from './layouts'
import { RegistryProvider } from '../../shared/RegistryProvider'
import { SearchProvider } from './search/SearchProvider'
import { TicketProvider } from './TicketProvider'
import { SideNavigation } from '../app/containers/SideNavigation'
import { Search } from './search/containers'

export const ContactCenter = () => {
  const [open, setOpen] = useState(true)

  const onSearchFlip = () => {
    setOpen(!open)
  }
  return (
    <RegistryProvider>
      <Helmet>
        <base href={process.env.BASE_PATH} />
        <link rel="shortcut icon" href={`${process.env.BASE_PATH}/favicon.ico`} />
        <title>Contact Centre</title>
      </Helmet>
      <DefaultHeader />
      <ToastProvider>
        <TicketProvider>
          <DndProvider backend={HTML5Backend}>
            <ServiceRequestProvider>
              <SearchProvider>
                <SideNavigation isOpen={open} Search={Search} History={History} />
                <Button
                  renderIcon={open ? ChevronLeft32 : Search32}
                  className="pel--searchlist-toggle-btn"
                  onClick={() => onSearchFlip()}
                  iconDescription={open ? 'Close' : 'Search'}
                  hasIconOnly
                />
                <ServiceRequest isOpen={open} />
              </SearchProvider>
            </ServiceRequestProvider>
          </DndProvider>
        </TicketProvider>
      </ToastProvider>
    </RegistryProvider>
  )
}
