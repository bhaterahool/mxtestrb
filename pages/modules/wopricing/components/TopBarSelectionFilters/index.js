import React, { useState } from 'react'
import { Button } from 'carbon-components-react'
import { useForm } from 'react-hook-form'
import moment from 'moment'

import { CustomerSelection } from './CustomerSelection'
import { WorkOrderStatusDropdown } from './WorkOrderStatusDropdown'
import { Loading } from '../../../shared-components/Loading'

import { useGridCtx } from '../../context/grid-context'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { getWopricingWONUM } from '../../services/wopricingService'
import { wopricingSearchStatus } from '../../services/wopricingSearchStatus'

import {
  clearGrid,
  setMainDropdownOptionHasData,
  createCustomer,
  updateCustomerTableData
} from '../../context/grid-reducer'

import { PelDateTimePicker } from '../../../../shared/forms'

export const TopBarSelectionFilters = () => {
  const {
    gridState: { customers },
    dispatchGrid
  } = useGridCtx()
  const { addErrorToast } = useToast()

  const dropdownItems = wopricingSearchStatus()

  const initialSelectedItems = dropdownItems?.filter(row => row?.defaultSelected) ?? []
  const [workOrderStatus, setWorkOrderStatus] = useState(initialSelectedItems)
  const [customer, setCustomer] = useState({})
  const [isLoading, setLoading] = useState(false)

  const formMethods = useForm({
    statusdate: ''
  })
  const { control, reset, watch } = formMethods
  const { statusdateto, statusdatefrom } = watch()
  const todayDate = new Date().toISOString()

  const handleWorkOrderStatusChange = ({ selectedItems }) => setWorkOrderStatus(selectedItems)

  const handleCustomerChange = ({ selectedItem }) => setCustomer(selectedItem)

  const handleLoadClick = () => {
    const statuses = workOrderStatus?.map(row => row.id) ?? []
    const { id = '', name = '' } = customer

    if (id && statuses?.length) {
      // add filter dates
      const statusDateFrom = statusdatefrom
        ? moment(statusdatefrom)
            .startOf('day')
            .format()
        : ''
      // eslint-disable-next-line no-nested-ternary
      const statusDateTo = statusdateto
        ? moment(statusdateto)
            .endOf('day')
            .format()
        : statusdatefrom
        ? moment(todayDate)
            .endOf('day')
            .format()
        : ''

      setLoading(true)
      getWopricingWONUM(id, statuses, statusDateFrom, statusDateTo)
        .then(member => {
          dispatchGrid(setMainDropdownOptionHasData({ id, hasData: !!member.length }))
          if (customers[id]) {
            const data = member?.reduce((acc, current) => {
              const x = acc.find(
                item => item?.wonum === current?.wonum && item?.siteid === current?.siteid
              )
              return !x ? acc.concat(current) : acc
            }, customers[id]?.tableData || [])

            dispatchGrid(updateCustomerTableData({ customerId: id, tableData: data, reload: true }))
          } else {
            dispatchGrid(createCustomer({ customerId: id, customerName: name, tableData: member }))
          }
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: `Error loading work order numbers for customer - ${id}`,
            caption: message
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  const resetForm = () => {
    formMethods.setValue('statusdatefrom', '')
    formMethods.setValue('statusdateto', '')
    reset({ statusdate: '' })
    //dispatchGrid(clearGrid())
  }

  return (
    <>
      {isLoading ? <Loading modal /> : null}
      <div className="worpricing-selection-filters">
        <CustomerSelection handleSelection={handleCustomerChange} />
        <WorkOrderStatusDropdown
          items={dropdownItems}
          initialSelectedItems={initialSelectedItems}
          handleChange={handleWorkOrderStatusChange}
          selectedItems={workOrderStatus}
        />
        <PelDateTimePicker.Rhf
          control={control}
          label="Status Date From"
          name="statusdatefrom"
          withTime={false}
          minDate=""
          maxDate={todayDate}
        />
        <PelDateTimePicker.Rhf
          control={control}
          label="Status Date To"
          name="statusdateto"
          withTime={false}
          maxDate={todayDate}
          minDate={statusdatefrom || ''}
        />
        <Button
          onClick={handleLoadClick}
          className="bx--btn wopricing-load--btn__secondary"
          disabled={!customer?.id || !workOrderStatus?.length}
        >
          Load
        </Button>
        <Button onClick={resetForm} className="bx--btn wopricing-load--btn__secondary">
          Reset Dates
        </Button>
      </div>
    </>
  )
}
