import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'carbon-components-react'
import * as Helpers from '../form/helpers'
import { PelTextInput } from '../../../../shared/forms'

export const NotificationDetailModal = ({ details, modalProps }) => {
  return (
    <Modal
      {...modalProps}
      modalHeading="Notification Detail"
      className="pel-modal pel-narrow-modal"
      passiveModal
    >
      <div className="bx--row">
        <div className="bx--col-lg-6 bx--col-md-6">
          <PelTextInput
            labelText="Date"
            name="details?.postdate"
            readOnly
            value={Helpers.toShortDate(details?.postdate)}
          />
        </div>
        <div className="bx--col-lg-6 bx--col-md-6">
          <PelTextInput
            labelText="Status"
            name="details?.status_description"
            readOnly
            value={details?.status_description}
          />
        </div>
      </div>
      <div className="notification-modal-detail">{details.message}</div>
    </Modal>
  )
}

NotificationDetailModal.propTypes = {
  details: PropTypes.array.isRequired,
  modalProps: PropTypes.object.isRequired
}
