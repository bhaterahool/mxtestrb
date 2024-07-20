import React from 'react'
import PropTypes from 'prop-types'
import { ModalWrapper, Form, Select, SelectItem, TextInput } from 'carbon-components-react'
import { useForm } from 'react-hook-form'
import { PelTextInput } from '../../../shared/forms/Inputs'


export const BillingApprovalModal = ({ onSubmit, workOrder, loading, wonum }) => {
  const { register, ...form } = useForm()

  const handleSaveConfig = configuredFieldData => {
    const billingApprovalResponse = configuredFieldData
    billingApprovalResponse.wonum = wonum
    onSubmit(configuredFieldData)
  }

  const modalProps = {
    modalHeading: 'Mandate Approval',
    className: 'pel-modal pel-narrow-modal',
    shouldCloseAfterSubmit: true,
    buttonTriggerText: 'Change Status',
    triggerButtonIconDescription: 'Mandate Approval',
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'billing-status-change-btn',
    handleSubmit: form.handleSubmit(handleSaveConfig)
  }

  return (
    <ModalWrapper {...modalProps}>
      <Form>
        <div>
          <Select
            defaultValue="APPROVED"
            name="pluspeststat"
            id="pluspeststat"
            ref={register}
            labelText="New Status"
          >
            <SelectItem text="Approved" value="APPROVED" />
            <SelectItem text="Rejected" value="REJECTED" />
            <SelectItem text="Query" value="QUERY" />
          </Select>
          <PelTextInput
            id="pelcarapprvalue"
            name="pelcarapprvalue"
            labelText="Approval Value"
            readOnly
            value={workOrder?.pelcarapprvalue}
            showSkeleton={loading}
          />
          <PelTextInput
            id="pelcarapprover"
            name="pelcarapprover"
            labelText="Approval Person Group"
            readOnly
            value={workOrder?.pelcarapprover}
            showSkeleton={loading}
          />
          <PelTextInput
            id="personid"
            name="personid"
            labelText="Approver"
            readOnly
            value={workOrder?.personid}
            showSkeleton={loading}
          />
          <TextInput
            id="pelcarapprref"
            name="pelcarapprref"
            ref={register}
            autoComplete="off"
            labelText="Customer Approval Ref"
          />
          <TextInput
            ref={register}
            autoComplete="off"
            id="pelcustomercomment"
            name="pelcustomercomment"
            labelText="Comments"
          />
        </div>
      </Form>
    </ModalWrapper>
  )
}

BillingApprovalModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  workOrder: PropTypes.shape({}),
  wonum: PropTypes.string.isRequired
}
