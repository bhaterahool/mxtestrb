import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import PropTypes from 'prop-types'
import { Form, TextInput, Select, SelectItem } from 'carbon-components-react'
import { useForm } from 'react-hook-form'
import CheckmarkOutline32 from '@carbon/icons-react/lib/checkmark--outline/32'
import { PelModalWrapper } from './PelModalWrapper'
import { api } from '../../app/api'
import { useRegistry } from '../../../shared/RegistryProvider'
import { useToast } from '../../../shared/toasts/ToastProvider'

export const CreateDoclink = ({ doclinksData, onUpdate }) => {
  const { register, setValue, getValues, reset, watch, errors, ...form } = useForm()
  const [registry] = useRegistry()
  const [files, setFiles] = useState()
  const { addSuccessToast, addPersistentErrorToast } = useToast()
  const onDrop = useCallback(acceptedFiles => {
    setValue('file', acceptedFiles)
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  
  

  
  
  const handleSubmit1 = async formdata => {
    const [file] = files
    const reader = new FileReader()
    const [, fileNameExtension] = file.name.split('.')

    reader.onload = async () => {
      const binaryStr = reader.result.split(',')[1]
      try {
        const res = await api.post(`${doclinksData.href}`, binaryStr, {
          headers: {
            properties: 'doclinks{*}',
            slug: `${formdata.filename}.${fileNameExtension}`,
            'x-document-description': formdata.description,
            'x-document-meta': `FILE/${formdata.doctype}`,
            'Content-type': 'utf-8',
            'custom-encoding': 'base64'
          }
        })

        if (onUpdate) {
          onUpdate(res?.data)
          addSuccessToast({ subtitle: 'Document added successfully' })
        }
      } catch (error) {
        addPersistentErrorToast({
          subtitle: error.message
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const beforeOpen = () => {
    reset()
    setFiles()
  }

  const modalProps = {
    buttonTriggerText: 'Add Document',
    modalHeading: 'Add Document',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    primaryButtonDisabled: !watch('filename') || !watch('description') || !files,
    handleSubmit: form.handleSubmit(handleSubmit1),
    beforeOpen
  }

  const doctypeProps = {
    labelText: 'Document Type',
    id: 'doctype',
    name: 'doctype',
    placeholder: 'Enter Document Type',
    invalidText: 'Document Type is required',
    ref: register({ required: true })
  }

  const fileNameProps = {
    id: 'filename',
    name: 'filename',
    labelText: 'File Name',
    type: 'text',
    placeholder: 'Enter File Name',
    invalid: !watch('filename'),
    invalidText: 'File Name is required',
    maxLength: 20,
    autoComplete: 'off',
    ref: register({ required: true })
  }

  const descriptionProps = {
    id: 'doclinkdescription',
    name: 'description',
    labelText: 'Description',
    type: 'text',
    placeholder: 'Enter Description',
    invalid: !watch('description'),
    invalidText: 'Description is required',
    maxLength: 254,
    autoComplete: 'off',
    ref: register({ required: true })
  }

  useEffect(() => {
    register({ name: 'file' })
  }, [])

  const Droparea = () => {
    if (isDragActive) {
      return <p>Drop the files here ...</p>
    }

    if (files && files.length > 0) {
      return <CheckmarkOutline32 />
    }

    return <p>Drag files here or click to select files</p>
  }

  return (
    <PelModalWrapper {...modalProps}>
      <Form>
        <Select {...doctypeProps}>
          {registry.srdocTypes?.map((item, index) => {
            return <SelectItem value={item.doctype} text={item.doctype} key={index} />
          })}
        </Select>
        <TextInput {...fileNameProps} />
        <TextInput {...descriptionProps} />
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <Droparea />
          {files && files.map(f => <p>{f.name}</p>)}
        </div>
      </Form>
    </PelModalWrapper>
  )
}

CreateDoclink.propTypes = {
  doclinksData: PropTypes.arrayOf(PropTypes.object),
  onUpdate: PropTypes.func
}
