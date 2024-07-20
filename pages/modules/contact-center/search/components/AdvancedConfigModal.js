import React from 'react'
import PropTypes from 'prop-types'
import ListBoxes16 from '@carbon/icons-react/lib/list--boxes/16'
import { ModalWrapper, Form, Checkbox } from 'carbon-components-react'
import { useForm } from 'react-hook-form'

export const AdvancedConfigModal = ({ onSubmit, searchFields }) => {
  const { register, ...form } = useForm()

  const advancedSearchFields = searchFields

  const handleSaveConfig = configuredFieldData => {
    onSubmit(configuredFieldData)
  }

  const modalProps = {
    modalHeading: 'Choose Search Fields',
    className: 'pel-modal pel-narrow-modal',
    shouldCloseAfterSubmit: true,
    renderTriggerButtonIcon: () => <ListBoxes16 />,
    triggerButtonIconDescription: 'Advanced Field Configuration',
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    handleSubmit: form.handleSubmit(handleSaveConfig)
  }

  return (
    <ModalWrapper {...modalProps}>
      <Form>
        {Object.entries(advancedSearchFields).map(([key, value]) => {
          const labelText = {
            [key]: key,
            EndCustomer: 'Customer Know As',
            Reporteddate: 'Reported Date',
            Ticketid: 'Ticket Id',
            Reportedby: 'Reported by',
            Reportedbyemail: 'Reported Email',
            pelclientref: 'Customer Ref',
            Affected: 'Affected by',
            Affectedemail: 'Affected Email',
            Assignmentid: 'Assignment Id',
            Wonum: 'Work Order',
            AssignmentStatus: 'Assignment Status',
            Woworktype: 'Work Type',
            ponum: 'PO Number',
            CreatedDate: 'Created Date',
            Streetaddress: 'Street Address',
            TargetStartDate: 'Target Start Date',
            TargetFinishDate: 'Target Finish Date',
            ActualStartDate: 'Actual Start Date',
            ActualFinishDate: 'Actual Finish Date',
            EstimatedStartDate: 'Estimated Start Date',
            EstimatedFinishDate: 'Estimated Finish Date',
            afpnum: 'AFP Number',
            statusdate: 'Status Date',
            startdate: 'Start Date',
            enddate: 'End Date',
            type: 'Type',
            description: 'Description',
            status: 'Status'
          }

          return (
            <Checkbox
              id={key}
              key={`${key}-${key.length}}`}
              defaultChecked={value}
              labelText={labelText[key]}
              name={key}
              ref={register}
            />
          )
        })}
      </Form>
    </ModalWrapper>
  )
}

AdvancedConfigModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  searchFields: PropTypes.shape({})
}
