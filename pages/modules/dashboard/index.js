import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { DefaultHeader } from '../app/components'
import { ToastProvider } from '../../shared/toasts/ToastProvider'
import { OsResultsProvider } from './OSResultsProvider'
import { RegistryProvider } from '../../shared/RegistryProvider'
import { KPIProvider } from './KPIProvider'
import { KPILayout } from './layouts/KPILayout'

export const Dashboard = () => {
  const [open, setOpen] = useState(true)

  return (
    <RegistryProvider>
      <Helmet>
        <base href={process.env.BASE_PATH} />
        <link rel="shortcut icon" href={`${process.env.BASE_PATH}/favicon.ico`} />
        <title>Dashboard</title>
      </Helmet>
      <DefaultHeader />
      <ToastProvider>
        <KPIProvider>
          <OsResultsProvider>
            <KPILayout isOpen />
          </OsResultsProvider>
        </KPIProvider>
      </ToastProvider>
    </RegistryProvider>
  )
}
