import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ReactQuill from 'react-quill'
import DOMPurify from 'dompurify'
import { Form, Modal } from 'carbon-components-react'

export const LongDescriptionForm = ({ value, handleSubmit, readOnly, modalProps }) => {
  const [longDesc, setLongDesc] = useState()

  
  useEffect(() => {
    setLongDesc(value)
  }, [value])

    const handleChange = value => setLongDesc(value)

  if (readOnly) {
    return (
      <Modal {...modalProps} modalHeading="Long Description" primaryButtonText="Ok" passiveModal>
        <div
          
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(longDesc)
          }}
        />
      </Modal>
    )
  }

  return (
    <Modal
      {...modalProps}
      modalHeading="Edit Long Description"
      primaryButtonText="Save Changes"
      secondaryButtonText="Cancel"
      onRequestSubmit={() => handleSubmit(longDesc)}
    >
      <Form>
        <ReactQuill value={longDesc} onChange={handleChange} />
      </Form>
    </Modal>
  )
}

LongDescriptionForm.defaultProps = {
  readOnly: false,
  value: ''
}

LongDescriptionForm.propTypes = {
  readOnly: PropTypes.bool,
  value: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  modalProps: PropTypes.any
}
