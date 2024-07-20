import React, { useRef } from 'react'
import { Helmet } from 'react-helmet'
import { LicenseManager } from 'ag-grid-enterprise'
import { DefaultHeader } from '../app/components/DefaultHeader'
import { RegistryProvider } from '../../shared/RegistryProvider'
import { ToastProvider } from '../../shared/toasts/ToastProvider'
import { TabBar } from './components/TabBar/TabBar'
import { AfpProvider } from './context/afp-context'
import { UIProvider } from './context/ui-context/ui-context'
import { AfpSearch } from './components/Search'
import { LICENSE_KEY } from '../../shared/grid/grid'
import { SearchButton } from './components/Search/SearchButton'
import './index.scss'

LicenseManager.setLicenseKey(LICENSE_KEY)

export const Afp = () => {
  const searchRef = useRef()
  return (
    <div className="afp--wrapper">
      <Helmet>
        <title>Application For Payment</title>
      </Helmet>
      <ToastProvider>
        <RegistryProvider>
          <DefaultHeader />
          <AfpProvider>
            <UIProvider>
              <AfpSearch searchRef={searchRef} />
              <TabBar searchRef={searchRef} />
              <SearchButton />
            </UIProvider>
          </AfpProvider>
        </RegistryProvider>
      </ToastProvider>
    </div>
  )
}
