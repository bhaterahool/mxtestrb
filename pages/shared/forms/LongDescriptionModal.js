import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Document16 from '@carbon/icons-react/lib/document/16'
import { ModalWrapper, Form } from 'carbon-components-react'
import DOMPurify from 'dompurify'
import { useForm } from 'react-hook-form'
import ReactQuill from 'react-quill'
import { api } from '../../modules/app/api'
import { useToast } from '../toasts/ToastProvider'

export const LongDescriptionModal = ({ longdescription, href, handleChange, ...props }) => {
  const { addSuccessToast, addPersistentErrorToast } = useToast()

  if (!longdescription && handleChange === undefined) {
    return null
  }

  const [state, setState] = useState({ pending: false, error: null })

  const { register, setValue, getValues } = useForm()

  
  register({ name: 'description_longdescription', value: longdescription })

  const handleQuillChange = value => {
    setValue('description_longdescription', value)
  }

    const handleSubmit = async e => {
    
    const path = `/${href.split('/maximo/oslc/')[1]}`

    setState({ pending: true, error: null })

    handleChange('description_longdescription', getValues().description_longdescription)

    try {
      await api.post(path, getValues(), {
        headers: {
          'x-method-override': 'PATCH',
          patchtype: 'MERGE'
        }
      })

      setState({ pending: false, error: null })

      addSuccessToast({
        subtitle: `Long Description updated successfully.`
      })
    } catch (err) {
      setState({ pending: false, error: err.message })

      addPersistentErrorToast({
        subtitle: `Long Description failed to update.`,
        caption: err.message
      })
    }
  }

  const modalProps = {
    modalHeading: 'Long Description',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: handleChange === undefined,
    renderTriggerButtonIcon: () => <Document16 />,
    triggerButtonIconDescription: 'Edit Long Description',
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    handleSubmit,
    ...props
  }
  return (
    <ModalWrapper {...modalProps}>
      {handleChange ? (
        <Form onSubmit={handleSubmit}>
          <ReactQuill
            bounds=".bx--modal-content"
            value={getValues().description_longdescription || ''}
            onChange={handleQuillChange}
          />
        </Form>
      ) : (
        <div
          
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(longdescription)
          }}
        />
      )}
    </ModalWrapper>
  )
}

LongDescriptionModal.propTypes = {
  handleChange: PropTypes.func,
  href: PropTypes.string,
  longdescription: PropTypes.string
}
