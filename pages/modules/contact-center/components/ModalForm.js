import React from 'react'
import noop from 'lodash/util'
import PropTypes from 'prop-types'
import { Modal } from 'carbon-components-react'

export const ModalForm = ({
  children,
  onRequestSubmit,
  ...modalProps
}) => {
  const handleSubmit = values =>
    onRequestSubmit(values)

  return (
    <Modal
      {...modalProps}
      onRequestSubmit={handleSubmit}
    >
      {
        React.Children.map(children, child =>
          React.cloneElement(child, {
            handleSubmit
          }))
      }
    </Modal>
  )
}

ModalForm.propTypes = {

}