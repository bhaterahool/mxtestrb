import React from 'react'
import { DefaultHeader } from '../app/components/DefaultHeader'
import { RegistryProvider } from '../../shared/RegistryProvider'
import { ToastProvider } from '../../shared/toasts/ToastProvider'
import { GridProvider } from './context/grid-context'
import { FileProvider } from './context/file-context'
import { Wrapper } from './components/Wrapper'

import './index.scss'

export const Wopricing = () => (
  <ToastProvider>
    <RegistryProvider>
      <DefaultHeader />
      <FileProvider>
        <GridProvider>
          <Wrapper />
        </GridProvider>
      </FileProvider>
    </RegistryProvider>
  </ToastProvider>
)
