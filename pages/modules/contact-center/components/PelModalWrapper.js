import React from 'react'
import { ModalWrapper, Button, Modal, Loading } from 'carbon-components-react'

export class PelModalWrapper extends ModalWrapper {
  handleOpen = e => {
    if (this.props.beforeOpen) this.props.beforeOpen(e)
    if (this.props.saveFn && this.props.formData) {
      this.setState({
        isLoading: true
      })

      if (this.props.saveFn) {
        this.props.saveFn(this.props.formData(this.props.data))
      }

      setTimeout(() => {
        this.setState({
          isOpen: true,
          isLoading: false
        })
      }, 5500)
    } else {
      this.setState({
        isOpen: true
      })
    }
  }

  handleClose = e => {
    this.setState({
      isOpen: false
    })
  }

  handleClose = e => {
    this.setState({
      isOpen: false
    })
  }

  render() {
    const {
      children,
      onKeyDown,
      buttonTriggerText,
      buttonTriggerClassName,
      renderTriggerButtonIcon,
      triggerButtonIconDescription,
      triggerButtonKind,
      disabled,
      handleSubmit, 
      shouldCloseAfterSubmit, 
      selectorPrimaryFocus,
      primaryButtonDisabled,
      beforeOpen,
      isAutoSave,
      formData,
      data,
      saveFn,
      ...other
    } = this.props

    const props = {
      ...other,
      selectorPrimaryFocus,
      open: this.state.isOpen,
      onRequestClose: this.handleClose,
      primaryButtonDisabled,
      onRequestSubmit: this.handleOnRequestSubmit
    }
    return (
      <div
        role="presentation"
        onKeyDown={evt => {
          if (evt.which === 27) {
            this.handleClose()
            onKeyDown(evt)
          }
        }}
      >
        <Button
          className={buttonTriggerClassName}
          disabled={disabled}
          kind={triggerButtonKind}
          renderIcon={renderTriggerButtonIcon}
          iconDescription={triggerButtonIconDescription}
          onClick={this.handleOpen}
          ref={this.triggerButton}
        >
          {buttonTriggerText}
        </Button>
        {this.state.isLoading && <Loading description="Active loading indicator" withOverlay />}
        <Modal {...props}>{children}</Modal>
      </div>
    )
  }
}
