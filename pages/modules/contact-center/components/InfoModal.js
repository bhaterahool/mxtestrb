import React from 'react'
import PropTypes from 'prop-types'
import { ComposedModal, ModalHeader, ModalBody, ModalFooter } from 'carbon-components-react'

export const InfoModal = ({
  open,
  label,
  title,
  primaryButtonText,
  secondaryButtonText,
  onRequestClose,
  onRequestSubmit
}) => (
  <ComposedModal open={open} size="sm" className="info-modal">
    <ModalHeader iconDescription="Close" label={label} title={title} />
    <ModalBody />
    <ModalFooter
      primaryButtonText={primaryButtonText || 'OK'}
      secondaryButtonText={secondaryButtonText || ''}
      onRequestClose={onRequestClose}
      onRequestSubmit={onRequestSubmit || onRequestClose}
    />
  </ComposedModal>
)

InfoModal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  label: PropTypes.string,
  primaryButtonText: PropTypes.string,
  secondaryButtonText: PropTypes.string,
  onRequestClose: PropTypes.func,
  onRequestSubmit: PropTypes.func
}
