import React from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Form, Select, SelectItem } from 'carbon-components-react'
import DataShare16 from '@carbon/icons-react/lib/data-share/16'
import { PelTextInput } from '../../../../shared/forms'
import { api } from '../../../app/api'
import config from '../../../app/config'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { PelModalWrapper } from '../PelModalWrapper'
import { useServiceRequestProvider, updateServiceRequest } from '../../ServiceRequestProvider'

export const StatusChangeModal = ({ currentStatus, sr, assignmentData }) => {
  const [{ serviceRequests, pending }, dispatchServiceRequest] = useServiceRequestProvider()
  const { register, handleSubmit } = useForm()

  const { addSuccessToast, addPersistentErrorToast } = useToast()
  const srStatusList = [{ value: 'RESOLVED', description: 'Resolved' }]
  const assignmentStatusList = [
    { value: 'WAPPR', description: 'Waiting for approval' },
    { value: 'WAPPT', description: 'Waiting appointment' }
  ]

  const newStatusChangeList = assignmentData ? assignmentStatusList : srStatusList

  const apiCall = async (statusChangeEndPoint, formdata) => {
    try {
      await api
        .post(statusChangeEndPoint, formdata, {
          headers: {
            patchtype: 'MERGE',
            'x-method-override': 'PATCH',
            'Content-Type': 'application/json',
            properties: assignmentData ? config.search.pelsrfull.fields : 'wonum, status'
          }
        })
        .then(res => {
          dispatchServiceRequest(
            updateServiceRequest(
              sr.ticketid,
              assignmentData
                ? res.data
                : {
                    status: res.data.status,
                    status_description: res.data.status_description
                  }
            )
          )
          addSuccessToast({
            subtitle: 'Status changed successfully'
          })
        })
    } catch (error) {
      addPersistentErrorToast({
        subtitle: error.message
      })
    }
  }

  const submitForm = async formdata => {
    const statusChangeEndPoint = assignmentData
      ? assignmentData?.localref
      : `/pelos/pelsrfull/${sr.ticketuid}?lean=1&action=wsmethod:changeStatus`
    const statusChangeData = formdata
    if (assignmentData) {
      statusChangeData.href = assignmentData.href
    }
    apiCall(statusChangeEndPoint, statusChangeData)
  }

  const modalProps = {
    modalHeading: 'Change Status',
    primaryButtonText: 'Save',
    className: 'pel-modal',
    secondaryButtonText: 'Cancel',
    shouldCloseAfterSubmit: true,
    renderTriggerButtonIcon: () => <DataShare16 />,
    triggerButtonKind: 'tertiary',
    handleSubmit: handleSubmit(submitForm),
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border'
  }

  return (
    <PelModalWrapper {...modalProps}>
      <Form>
        <div className="bx--row">
          <div className="bx--col-lg-6 bx--col-md-6">
            <PelTextInput labelText="Current Status" value={currentStatus} readOnly />
          </div>
          <div className="bx--col-lg-6 bx--col-md-6">
            <Select id="status" name="status" labelText="New Status" ref={register}>
              <SelectItem
                key="status-default"
                value="default"
                text="Choose a new status"
                hidden
                disabled
              />
              {newStatusChangeList.map(({ value, description }) => (
                <SelectItem key={`status-${value}`} value={value} text={description} />
              ))}
            </Select>
          </div>
        </div>
      </Form>
    </PelModalWrapper>
  )
}

StatusChangeModal.propTypes = {
  currentStatus: PropTypes.string,
  sr: PropTypes.arrayOf(PropTypes.object),
  assignmentData: PropTypes.arrayOf(PropTypes.object).isRequired
}
