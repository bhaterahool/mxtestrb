import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { PelModalWrapper } from './PelModalWrapper'
import { api } from '../../app/api'

import { useToast } from '../../../shared/toasts/ToastProvider'

export const CancelAppointmentModal = ({ assignmentid, wonum, reload, ticketid, ...props }) => {
  if (!assignmentid) {
    return null
  }

  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const handleSubmit = async e => {
    const data = {
      RecordKey: 'assignmentid',
      KeyValue: Number(assignmentid),
      WoNum: wonum
    }

    try {
      const result = await api.post(
        `/pelos/PELAPPOINTREQUEST?&action=wsmethod:cancelAppointment`,
        data
      )

      if (result?.data['Status-Code'] === '200') {
        addSuccessToast({
          subtitle: 'Appointment cancelled'
        })

        reload(ticketid)
      } else {
        addPersistentErrorToast({
          subtitle: 'Failed to cancel appointment',
          caption: result.data['Status-Reason']
        })
      }
    } catch (err) {
      const message = _.get(err, 'response.data.Error.message', err.message)
      addPersistentErrorToast({
        subtitle: 'Failed to cancel appointment',
        caption: message
      })
    }
  }

  const modalProps = {
    modalHeading: 'Cancel Appointment',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    buttonTriggerText: 'Cancel Appointment',
    buttonTriggerClassName: 'bx--btn--sm  pel--btn-small',
    handleSubmit,
    ...props
  }

  return (
    <PelModalWrapper {...modalProps}>
      <p className="bx--modal-content__text">Are you sure you want to cancel this appointment?</p>
    </PelModalWrapper>
  )
}

CancelAppointmentModal.propTypes = {
  objectStructure: PropTypes.string,
  assignmentid: PropTypes.number,
  wonum: PropTypes.string,
  reload: PropTypes.func.isRequired,
  ticketid: PropTypes.string
}
