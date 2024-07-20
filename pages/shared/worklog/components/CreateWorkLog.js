import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, TextInput, Select, SelectItem, Checkbox } from 'carbon-components-react'
import ReactQuill from 'react-quill'
import { useForm } from 'react-hook-form'
import { PelModalWrapper } from '../../../modules/contact-center/components/PelModalWrapper'
import { api } from '../../../modules/app/api'
import getRelativePath from '../../../util/getRelativePath'
import { useToast } from '../../toasts/ToastProvider'
import 'react-quill/dist/quill.snow.css'
import { serviceRequest } from '../../../modules/contact-center/props/serviceRequest'
import './scss/createWorkLog.scss'
import { PelTextInput } from '../../forms/Inputs'

export const CreateWorkLog = ({ sr, onUpdate, logTypes, forceClientViewable, isSubCon }) => {
  const { register, setValue, getValues, reset, watch, ...form } = useForm()
  const quillNode = useRef()
  const [description, setDescription] = useState('')
  const { addErrorToast, addSuccessToast, addPersistentErrorToast } = useToast()
  // manually register longdescription (change handled manually as using react-quill)
  register({ name: 'description_longdescription', value: '' })

  const handleSubmit = async formdata => {
    const wl = {
      worklog: [
        {
          ...formdata,
          description,
          createdate: new Date().toISOString()
        }
      ]
    }
    if (!wl.worklog[0].description || !wl.worklog[0].description_longdescription) {
      const errField = !wl.worklog[0].description ? `Please enter summary` : `Please enter details`

      return addErrorToast({
        subtitle: 'Add Worklog is missing required information.',
        caption: errField
      })
    }
    if (isSubCon) {
      wl.worklog[0].logtype = 'SUBCON'
    }
    if (forceClientViewable) {
      wl.worklog[0].clientviewable = true
      wl.worklog[0].logtype = 'CLIENTNOTE'
    }
    try {
      const res = await api.post(getRelativePath(sr.href), wl, {
        headers: {
          properties: '*',
          patchtype: 'MERGE',
          'x-method-override': 'PATCH',
          'Content-Type': 'application/json'
        }
      })
      if (onUpdate) {
        onUpdate(res?.data)
        addSuccessToast({ subtitle: 'Work log added successfully' })
      }
    } catch (error) {
      addPersistentErrorToast({
        subtitle: 'Failed to add work log',
        caption: error.message
      })
    }
  }

  const handleQuillChange = value => {
    const editor = quillNode.current.getEditor()
    const textLength = editor.getLength()
    if (textLength > 32000) {
      setValue('description_longdescription', getValues().description_longdescription)
      return addErrorToast({
        subtitle: 'Characters limit 32000',
        caption: 'Limit exceed'
      })
    }
    setValue('description_longdescription', value)
  }

  const beforeOpen = e => {
    reset()
    setDescription('')
    if (quillNode && quillNode.setContents) quillNode.setContents([])
  }

  const modalProps = {
    buttonTriggerText: 'Add Log',
    modalHeading: 'Add Work Log',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    handleSubmit: form.handleSubmit(handleSubmit),
    beforeOpen
  }

  const handleSummaryChange = e => {
    const { value } = e.target
    
    if (value.length <= 104) {
      setDescription(value)
    } else {
      addErrorToast({
        subtitle: 'Characters limit 104',
        caption: 'Limit exceed'
      })
    }
  }

  const descriptionProps = {
    id: 'wldescription',
    name: 'description',
    labelText: 'Summary',
    type: 'text',
    placeholder: 'Enter summary',
    
    onChange: handleSummaryChange
  }

  const longDescriptionProps = {
    value: getValues().description_longdescription,
    ref: quillNode,
    onChange: handleQuillChange
  }
  return (
    <PelModalWrapper {...modalProps}>
      <Form className="pel--create-worklog pel--quill-blank">
        <TextInput
          {...descriptionProps}
          className="pel--text-inpt"
          value={description}
          invalid={!description}
          autoComplete="off"
        />
        {isSubCon ? (
          <PelTextInput
            value="Sub-Contractor Update"
            readOnly
            name="Log Type"
            labelText="Log Type"
          />
        ) : (
          !forceClientViewable && (
            <div className="pel--create-worklog-row">
              <Select id="logtype" name="logtype" labelText="Log Type" ref={register}>
                {logTypes.map(logType => (
                  <SelectItem
                    key={logType.value}
                    value={logType.value}
                    text={logType.description}
                  />
                ))}
              </Select>
              <div className="pel--worklog-viewable-container">
                <Checkbox
                  id="clientviewable"
                  name="clientviewable"
                  ref={register}
                  defaultChecked={false}
                  labelText="Client Viewable"
                />
              </div>
            </div>
          )
        )}

        <span className="bx--label">Details</span>
        <ReactQuill {...longDescriptionProps} />
      </Form>
    </PelModalWrapper>
  )
}

CreateWorkLog.propTypes = {
  sr: serviceRequest,
  onUpdate: PropTypes.func,
  forceClientViewable: PropTypes.bool,
  logTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired
}
