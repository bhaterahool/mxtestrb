import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button } from 'carbon-components-react'
import { TrashCan16 } from '@carbon/icons-react'

export const DeleteConfirmationModal = ({
  data={},
  buttonProps = {
    size: 'sm',
    kind: 'tertiary',
    iconDescription: 'Delete'
  },
  modalHeading='Are you sure you want to delete this?',
  modalDescription='',
  primaryButtonText='Delete',
  secondaryButtonText='Cancel',
  handleOnCancel = () => {},
  handleOnClose = () => {},
  handleOnDelete = () => {},
  preventCloseOnClickOutside=true
}) => {
  const [isModalOpen, setModalOpenStatus] = useState(false)

  const onRequestClose = () => {
    setModalOpenStatus(false)
    handleOnClose(data)
  }

  const onRequestSubmit = () => {
    setModalOpenStatus(false)
    handleOnDelete(data)
  }
  
  const onSecondarySubmit = () => {
    setModalOpenStatus(false)
    handleOnCancel(data)
  }

  return (
    <div className="delete-confirmation__delete-file-btn">
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
        {modalDescription && <h5 className="delete-confirmation__are-you-sure">{modalDescription}</h5>}
      </Modal>

      <Button
        hasIconOnly 
        onClick={() => setModalOpenStatus(true)}
        className="delete-confirmation__trash no-border"
        renderIcon={TrashCan16}
        {...buttonProps}
      />
    </div>
  )
}

DeleteConfirmationModal.propTypes = {
  data: PropTypes.any,
  buttonProps: PropTypes.objectOf({
    size: PropTypes.string,
    kind: PropTypes.string,
    iconDescription: PropTypes.string,
  }),
  modalHeading: PropTypes.string,
  modalDescription: PropTypes.string,
  primaryButtonText: PropTypes.string,
  secondaryButtonText: PropTypes.string,
  handleOnCancel: PropTypes.func,
  handleOnClose: PropTypes.func,
  handleOnDelete: PropTypes.func,
  preventCloseOnClickOutside: PropTypes.bool
}
