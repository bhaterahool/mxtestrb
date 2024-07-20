import React, { useState } from 'react'
import { Modal } from 'carbon-components-react'
import { ARE_YOU_SURE } from '../../../../shared/grid/constants'

export const ResetTableWithFilter = ({ isOpen, onRequestSubmit, onRequestClose }) => {
  return  (
    <Modal
      open={isOpen}
      modalHeading='Reset Table'
      primaryButtonText="OK"
      secondaryButtonText="Cancel"
      onRequestSubmit={onRequestSubmit}
      onRequestClose={onRequestClose}
    >
      <h5 className="afpbulk__are-you-sure">{ARE_YOU_SURE}</h5>
    </Modal>
  )
}
