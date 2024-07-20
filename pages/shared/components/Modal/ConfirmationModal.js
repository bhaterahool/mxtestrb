import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'carbon-components-react'

export const ConfirmationModal = ({
  open = false,
  modalHeading,
  modalDescription = '',
  primaryButtonText = 'Ok',
  secondaryButtonText = 'Cancel',
  onCancel = () => {},
  onClose = () => {},
  onSubmit = () => {},
  preventCloseOnClickOutside = true
}) => {
  const [isModalOpen, setModalOpenStatus] = useState(false)

  const onRequestClose = () => {
    setModalOpenStatus(false)
    onClose()
  }

  const onRequestSubmit = () => {
    setModalOpenStatus(false)
    onSubmit()
  }

  const onSecondarySubmit = () => {
    setModalOpenStatus(false)
    onCancel()
  }

  useEffect(() => {
    setModalOpenStatus(open)
  }, [open])

  return (
    <Modal
      open={isModalOpen}
      buttonTriggerText=""
      modalHeading={modalHeading}
      primaryButtonText={primaryButtonText}
      secondaryButtonText={secondaryButtonText}
      onRequestSubmit={onRequestSubmit}
      onSecondarySubmit={onSecondarySubmit}
      onRequestClose={onRequestClose}
      shouldCloseAfterSubmit
      preventCloseOnClickOutside={preventCloseOnClickOutside}
    >
      {modalDescription && <h5 className="confirmation-dailog__description">{modalDescription}</h5>}
    </Modal>
  )
}

ConfirmationModal.propTypes = {
  open: PropTypes.bool,
  modalHeading: PropTypes.string.isRequired,
  modalDescription: PropTypes.string,
  primaryButtonText: PropTypes.string,
  secondaryButtonText: PropTypes.string,
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  preventCloseOnClickOutside: PropTypes.bool
}
