import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'

import { useSession } from '../../auth/SessionProvider'
import {
  getManualBillFeeType,
  getManualBillStatus,
  getWopricingCustomersActive
} from '../services/wopricingService'
import { useToast } from '../../../shared/toasts/ToastProvider'
import {
  saveManualBillFeeType,
  saveManualBillStatus,
  setMainDropdownOptions
} from '../context/grid-reducer'
import { useGridCtx } from '../context/grid-context'

import { DataGrid } from './DataGrid/DataGrid'
import { FileMenuWopricing } from './FileMenuWopricing'
import { Form } from './Form/Form'
import { WORK_ORDER_PRICING } from '../../../shared/grid/constants'
import { FileImportExport } from './FileImportExport/FileImportExport'
import { TopBarSelectionFilters } from './TopBarSelectionFilters'

const compareTextAsc = key => (a, b) => {
  if (a[key] < b[key]) {
    return -1
  }
  if (b[key] < a[key]) {
    return 1
  }
  return 0
}

export const Wrapper = () => {
  const { gridState, dispatchGrid } = useGridCtx()
  const { customers } = gridState
  const customerKeys = Object.keys(customers || {})

  const { addErrorToast } = useToast()

  const [session] = useSession()
  const { sessionId, applications } = session
  const applicationsString = JSON.stringify(applications || {})

  useEffect(() => {
    if (sessionId && applicationsString) {
      getWopricingCustomersActive()
        .then(data => {
          dispatchGrid(
            setMainDropdownOptions({
              mainDropdownOptions: data.sort(compareTextAsc('name')).map(item => ({
                id: item.customer,
                text: item.name,
                value: item.href
              }))
            })
          )
        })
        .catch(({ message = '' } = {}) => {
          addErrorToast({
            subtitle: 'Error loading wopricing - active customers',
            caption: message
          })
        })

      getManualBillFeeType()
        .then(resp => {
          dispatchGrid(saveManualBillFeeType({ manualBillFeeType: resp.data.return }))
        })
        .catch(({ message = '' } = {}) => {
          addErrorToast({
            subtitle: 'Error - getting manual bill fee type. Cannot post data',
            caption: message
          })
        })

      getManualBillStatus()
        .then(resp => {
          dispatchGrid(saveManualBillStatus({ manualBillStatus: resp.data.return }))
        })
        .catch(({ message = '' } = {}) => {
          addErrorToast({
            subtitle: 'Error - getting manual bill status. Cannot post data',
            caption: message
          })
        })
    }
  }, [sessionId, applicationsString])

  return (
    <div className="wopricing--wrapper">
      <Helmet>
        <title>{WORK_ORDER_PRICING}</title>
      </Helmet>
      <FileMenuWopricing />
      <section className="wopricing-main">
        <nav className="wopricing-main-nav">
          <TopBarSelectionFilters />
          {customerKeys.length ? <Form /> : null}
        </nav>
        <DataGrid />
        {customerKeys.length ? <FileImportExport /> : null}
      </section>
    </div>
  )
}
