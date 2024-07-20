import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { NoResults } from './NoResults'
import { CostBillingTable } from './CostBillingTable'
import { CustomerPricingTable } from './CustomerPricingTable'
import { CarStatusHistoryModal } from './CarStatusHistoryModal'
import { MandateStatusHistoryModal } from './MandateStatusHistoryModal'
import { EstimateStatusHistoryModal } from './EstimateStatusHistoryModal'
import { PelTextInput, PelDateInput } from '../../../shared/forms/Inputs'
import { serviceRequest } from '../props/serviceRequest'

const getWorkOrders = sr => _.flatMap(_.get(sr, 'relatedrecord'), 'workorder')


export const CostBillingForm = ({ getInputProps, sr, loading }) => {
  const [workOrders, setWorkOrders] = useState([])
  const [workOrderIndex, setWorkOrderIndex] = useState(0)

  const ticketid = _.get(sr, 'ticketid', '')

  useEffect(() => {
    setWorkOrders(getWorkOrders(sr))
  }, [ticketid])

  if (sr && !workOrders.length) {
    return (
      <NoResults
        heading="No Work Orders Found"
        description="This service request does not currently have any work orders."
      />
    )
  }

  const workOrder = workOrders[workOrderIndex]

  const onBillingApprovalResponse = data => {
    // console.log(data)
  }

  return (
    <div className="bx--col-lg-12">
      <div className="bx--row pel-row-margin">
        <div className="bx--col-lg-4">
          <h4>Approval Details</h4>
        </div>
      </div>
      <div className="bx--row pel-row-margin">
        <div className="bx--col-lg-2">
          <PelTextInput
            {...getInputProps('pelcarapprvalue')}
            value={sr?.pelcarapprvalue}
            showSkeleton={loading}
            name="pelcarapprvalue"
          />

          <PelTextInput
            {...getInputProps('pelcarapprover')}
            value={sr?.pelcarapprover}
            showSkeleton={loading}
            name="pelcarapprover"
          />
          <PelTextInput
            {...getInputProps('pelcarapprref')}
            value={sr?.pelcarapprref}
            showSkeleton={loading}
            name="pelcarapprref"
          />
          {workOrder?.pelmandatestatus && (
            <div className="flex history-button">
              <PelTextInput
                {...getInputProps('pelmandatestatus')}
                value={workOrder?.pelmandatestatus}
                showSkeleton={loading}
                readOnly
                name="pelmandatestatus"
              />

              <div className="button-container">
                <MandateStatusHistoryModal
                  objectStructure="PELMANDATELOG"
                  query={`oslc.select=*&oslc.where=wonum="${workOrder?.wonum}"`}
                />
              </div>
            </div>
          )}
          {workOrder?.pelpropmandateprice && (
            <PelTextInput
              {...getInputProps('pelpropmandateprice')}
              value={workOrder?.pelpropmandateprice}
              showSkeleton={loading}
              readOnly
              name="pelpropmandateprice"
            />
          )}
        </div>
        <div className="bx--col-lg-2">
          <div className="flex history-button">
            <PelTextInput
              {...getInputProps('pelcarstatus')}
              value={sr?.pelcarstatus}
              showSkeleton={loading}
              name="pelcarstatus"
            />
            <div className="button-container">
              <CarStatusHistoryModal
                objectStructure="PELCARSTATHIST"
                query={`oslc.where=ticketid="${sr?.ticketid}"&oslc.select=*`}
              />
            </div>
          </div>
        </div>
        <div className="bx--col-lg-2">
          <PelDateInput
            {...getInputProps('pelcarstdate')}
            date={sr?.pelcarstdate}
            format="d-M-Y"
            showSkeleton={loading}
          />
        </div>
      </div>
      <div className="bx--row pel-row-margin">
        <div className="bx--col-lg-12">
          <h4>Customer Prices</h4>
          <CustomerPricingTable
            relatedWorkOrders={workOrders}
            workOrder={workOrder}
            showNoDataFoundMsg
            onBillingApprovalResponse={onBillingApprovalResponse}
          />
        </div>
      </div>

      <div className="bx--row pel-row-margin">
        <div className="bx--col-lg-12">
          <h4>Customer Billing</h4>
          <CostBillingTable relatedWorkOrders={workOrders} showNoDataFoundMsg />
        </div>
      </div>
    </div>
  )
}

CostBillingForm.propTypes = {
  sr: serviceRequest
}
