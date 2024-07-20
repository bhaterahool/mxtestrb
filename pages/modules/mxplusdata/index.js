import React from 'react'

import { Helmet } from 'react-helmet'
import { api } from '../app/api'
import { useSession } from '../auth/SessionProvider'
import { DefaultHeader } from '../app/components/DefaultHeader'
import { RegistryProvider } from '../../shared/RegistryProvider'

import { Loading } from '../shared-components/Loading'

export const MxPlusData = () => {
  const [session] = useSession()
  return (
    <RegistryProvider>
      <Helmet>
        <base href={process.env.BASE_PATH} />
        <link rel="shortcut icon" href={`${process.env.BASE_PATH}/favicon.ico`} />
        <title>Mx+ Data</title>
      </Helmet>
      <DefaultHeader />
      {}
    </RegistryProvider>
  )
}
