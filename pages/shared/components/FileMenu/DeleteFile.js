import React from 'react'
import PropTypes from 'prop-types'
import { ModalWrapper, Button } from 'carbon-components-react'
import { TrashCan16 } from '@carbon/icons-react'

import { ARE_YOU_SURE } from '../../grid/constants'

export const DeleteFileAsModal = ({ fileName, fileId, handleDeleteFile }) => {
  
  const modalTrigger = `file-menu__modal-trigger--delete-${fileId}`

  const primaryButtonText = `Delete File "${fileName}"`

  const handleModalTrigger = () => {
    document.querySelector(`.${modalTrigger}`).click()
  }

  const handleConfirmDelete = () => handleDeleteFile(fileId)

  return (
    <div className="file-menu__delete-file-btn">
      <ModalWrapper
        buttonTriggerText=""
        primaryButtonText={primaryButtonText}
        modalHeading={primaryButtonText}
        handleSubmit={handleConfirmDelete}
        shouldCloseAfterSubmit
        buttonTriggerClassName={modalTrigger}
      >
        <h5 className="file-menu__are-you-sure">{ARE_YOU_SURE}</h5>
      </ModalWrapper>

      <Button onClick={handleModalTrigger} className="file-menu__trash" labelText="Delete file">
        <TrashCan16 />
      </Button>
    </div>
  )
}

DeleteFileAsModal.propTypes = {
  fileName: PropTypes.string,
  fileId: PropTypes.string.isRequired,
  handleDeleteFile: PropTypes.func.isRequired
}
