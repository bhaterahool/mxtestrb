import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, TextInput, Select } from 'carbon-components-react'
import ReactQuill from 'react-quill'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { PelDateTimePicker } from '../../forms'
import { useToast } from '../../toasts/ToastProvider'
import { PelModalWrapper } from '../../../modules/contact-center/components/PelModalWrapper'
import { api } from '../../../modules/app/api'
import 'react-quill/dist/quill.snow.css'
import './scss/createMitigationEvent.scss'

export const CreateMitigationEvent = ({ onUpdate, eventTypes, wonum, siteid }) => {
  const defaultValues = {
    evtdate: '',
    notes_longdescription: '',
    notes: ''
  }

  const addMitigationModelRef = useRef()

  const { register, control, setValue, reset, watch, ...form } = useForm({
    defaultValues
  })
  const { addSuccessToast, addErrorToast, addPersistentErrorToast } = useToast()
  const quillNode = useRef()
  register({ name: 'notes_longdescription' })

  const [details, setDetails] = useState('')

  const [modalOpentime, setModalOpentime] = useState()

  const handleSubmit = async formdata => {
    if (moment(formdata?.evtdate).isBefore(modalOpentime)) {
      addErrorToast({
        subtitle: 'Event Date cant be less than current Date & time'
      })
    } else {
      const mitigationEvent = {
        ...formdata,
        wonum,
        siteid
      }
      try {
        addMitigationModelRef.current.handleClose()
        const res = await api.post(`pelos/PELMTFM_WOMITEVS`, mitigationEvent, {
          headers: {
            properties: '*'
          }
        })

        if (onUpdate) {
          addSuccessToast({
            subtitle: `Mitigation event added successfully`
          })
          onUpdate(res?.data)
        }
      } catch (err) {
        addPersistentErrorToast({
          subtitle: `Failed to add mitigation event`,
          caption: err.message
        })
      }
    }
  }

  useEffect(() => {
    setValue('evtdate', new Date())
  }, [form])

  const handleQuillChange = value => {
    const editor = quillNode.current.getEditor()
    const textLength = editor.getLength()
    if (textLength > 32000) {
      setValue('notes_longdescription', details)
      return addErrorToast({
        subtitle: 'Characters limit 32000',
        caption: 'Limit exceed'
      })
    }
    setDetails(value)
    setValue('notes_longdescription', value)
  }

  const handleNotesChange = event => {
    if (event.target.value.length >= 250) {
      return addErrorToast({
        subtitle: 'Characters limit 250',
        caption: 'Limit exceed'
      })
    }
  }

  const beforeOpen = e => {
    reset()
    setDetails('')
    setModalOpentime(new Date())
    if (quillNode && quillNode.setContents) quillNode.setContents([])
  }

  const modalProps = {
    buttonTriggerText: 'Add Mitigation Event',
    modalHeading: 'Add Mitigation Event',
    className: 'pel-modal',
    shouldCloseAfterSubmit: false,
    handleSubmit: form.handleSubmit(handleSubmit),
    beforeOpen,
    primaryButtonDisabled: !watch('notes')
  }

  const notesProps = {
    id: 'notes',
    name: 'notes',
    labelText: 'Notes',
    type: 'text',
    placeholder: 'Enter notes',
    invalid: !watch('notes'),
    ref: register,
    maxLength: '250',
    onChange: handleNotesChange
  }

  const notesDescriptionProps = {
    value: details,
    ref: quillNode,
    onChange: handleQuillChange
  }

  return (
    <PelModalWrapper {...modalProps} ref={addMitigationModelRef}>
      <Form className="pel--create-mitigation-event">
        <PelDateTimePicker.Rhf label="Event Date" name="evtdate" control={control} readOnly />
        <TextInput {...notesProps} className="pel--text-inpt" />
        <Select id="mitevt" name="mitevt" labelText="Event Type" ref={register}>
          {eventTypes.map(eventType => (
            <option key={eventType.value} value={eventType.value}>
              {eventType.description}
            </option>
          ))}
        </Select>
        <span className="bx--label">Details</span>
        <ReactQuill {...notesDescriptionProps} />
      </Form>
    </PelModalWrapper>
  )
}

CreateMitigationEvent.propTypes = {
  onUpdate: PropTypes.func,
  eventTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  wonum: PropTypes.string.isRequired,
  siteid: PropTypes.string.isRequired
}
