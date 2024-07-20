import PropTypes from 'prop-types'
import { TrashCan16 } from '@carbon/icons-react'
import { ModalWrapper, Button } from 'carbon-components-react'

import React from 'react'

import { hasGridItems } from './CurrentFilename'
import { ARE_YOU_SURE } from '../../grid/constants'


const modalTrigger = 'file-menu__modal-trigger--delete-all'

export const DeleteAllFiles = ({ fileState, handleDeleteAll, gridItemName }) => {
  const { selectedFileId } = fileState
  const { files } = fileState
  const selectedFile = files && files[selectedFileId]
  const hasBeenSaved = hasGridItems(gridItemName, selectedFile)

  const handleModalTrigger = () => {
    
    document.querySelector(`.${modalTrigger}`).click()
  }
  const primaryButtonText = 'Delete All Files'
  return hasBeenSaved ? (
    <div className="file-menu__btn-delete-all">
      <ModalWrapper
        buttonTriggerClassName={modalTrigger}
        buttonTriggerText=""
        primaryButtonText={primaryButtonText}
        modalHeading={primaryButtonText}
        handleSubmit={handleDeleteAll}
        shouldCloseAfterSubmit
      >
        <h5 className="file-menu__are-you-sure">{ARE_YOU_SURE}</h5>
      </ModalWrapper>
      <Button onClick={handleModalTrigger} className="file-menu__trash" labelText="Delete All">
        <span className="file-menu__delete-all">Delete All files</span> <TrashCan16 />
      </Button>
    </div>
  ) : null
}

DeleteAllFiles.propTypes = {
  fileState: PropTypes.any,
  handleDeleteAll: PropTypes.func.isRequired,
  gridItemName: PropTypes.string.isRequired
}
