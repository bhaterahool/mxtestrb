import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { Form, Select, SelectItem, TextInput, TextArea } from 'carbon-components-react'
import { useFormContext } from 'react-hook-form'
import { useToast } from '../toasts/ToastProvider'
import { PelDateTimePicker } from '../forms'

export const UploadForm = ({
  files,
  selectedFile,
  docTypes,
  requiredDocs,
  isUpdate,
  serverdate
}) => {
  const { register, watch, setValue, control, getValues } = useFormContext()
  const defaultSelectedFile = selectedFile ?? 0
  const [availableOptions, setAvailableOptions] = useState()
  const { addErrorToast } = useToast()

  const defaultDocumentType = 'Attachments'
  useEffect(() => {
    setAvailableOptions(requiredDocs)
  }, [requiredDocs])

  useEffect(() => {
    if (files?.length) {
      files.forEach((file, index) => {
        setValue(`files[${index}].documentdate`, serverdate)
      })
    }
  }, [files])

  const checkRequiredDocument = document => {
    return !requiredDocs.some(reqDoc => reqDoc.description === document && reqDoc.doclinksid)
  }

  const getRequiredDocumentType = pelreqdocswoid => {
    return (
      availableOptions.find(availableOption => availableOption.pelreqdocswoid === pelreqdocswoid)
        ?.doctype || ''
    )
  }

  const changeDocTypeByRequiredDoc = requiredDoc => {
    const docTypeField = `files[${defaultSelectedFile}].doctype`
    let requiredDocType = getRequiredDocumentType(+requiredDoc)
    const isDoctypeExist = docTypes.some(item => item.doctype === requiredDocType)

    if (!isDoctypeExist) {
      requiredDocType = defaultDocumentType
    }

    setValue(docTypeField, requiredDocType)
  }

  const handleRequiredDocument = e => {
    const { name, value } = e.target

    changeDocTypeByRequiredDoc(value)

    setAvailableOptions(
      availableOptions.map(doc => {
        const nextDoc = doc
        if (!value && nextDoc.usedBy === name) {
          nextDoc.usedBy = undefined
        } else if (value && doc.pelreqdocswoid === parseInt(value, 10)) {
          nextDoc.usedBy = name
        }

        return nextDoc
      })
    )
  }

  const handleCharLength = (event, maxlength) => {
    if (event.target.value.length >= maxlength) {
      return addErrorToast({
        subtitle: `Characters limit ${maxlength}`,
        caption: 'Limit exceed'
      })
    }
  }

  if (!isUpdate && !files.length) return null

  return (
    <div className="pel--form-container">
      <h4>{files?.[defaultSelectedFile]?.name}</h4>
      <p>Please complete the document information below.</p>
      <Form className="pel--required-docs-form">
        {files?.map((file, index) => (
          <div
            className={cx({
              hidden: index !== defaultSelectedFile
            })}
          >
            <div className="row">
              <div className="column">
                <input
                  type="hidden"
                  ref={register}
                  name={`files[${index}].doctype`}
                  defaultValue={defaultDocumentType}
                />
                <PelDateTimePicker.Rhf
                  label="Document Date"
                  name={`files[${index}].documentdate`}
                  control={control}
                  minDate=""
                  maxDate={serverdate}
                  invalid={!watch(`files[${index}].documentdate`)}
                />
              </div>
              <div className="column">
                <Select
                  name={`files[${index}].required`}
                  labelText="Required Document (Optional)"
                  ref={register}
                  onChange={handleRequiredDocument}
                >
                  <SelectItem text="Not a required document" />
                  {availableOptions?.map((item, rdIndex) => {
                    if (
                      (!item.usedBy || item.usedBy === `files[${index}].required`) &&
                      checkRequiredDocument(item.description)
                    ) {
                      return (
                        <SelectItem
                          value={item.pelreqdocswoid}
                          text={`${item.description}`}
                          key={`docType-${index}-${rdIndex}`}
                        />
                      )
                    }

                    return null
                  })}
                </Select>
              </div>
            </div>
            <div className="row">
              <div className="column">
                <TextInput
                  name={`files[${index}].title`}
                  labelText="Title"
                  ref={register}
                  invalidText="File Name is required"
                  invalid={!watch(`files[${index}].title`)}
                  maxLength="20"
                  onChange={event => handleCharLength(event, 20)}
                />
              </div>
              <div className="column" />
            </div>
            <div className="row">
              <TextArea
                name={`files[${index}].description`}
                labelText="Notes"
                invalid={!watch(`files[${index}].description`)}
                ref={register}
                maxLength="254"
                onChange={event => handleCharLength(event, 254)}
              />
            </div>
          </div>
        ))}
      </Form>
    </div>
  )
}

UploadForm.propTypes = {
  selectedFile: PropTypes.number,
  isUpdate: PropTypes.bool.isRequired,
  isSubCon: PropTypes.bool,
  serverdate: PropTypes.string,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      doctype: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  docTypes: PropTypes.arrayOf(
    PropTypes.shape({
      app: PropTypes.string,
      appdoctypeid: PropTypes.number,
      doctype: PropTypes.string
    })
  ).isRequired,
  requiredDocs: PropTypes.arrayOf(
    PropTypes.shape({
      assignmentid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      doctype: PropTypes.string,
      description: PropTypes.string,
      objectname: PropTypes.string
    })
  ).isRequired,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string,
      index: PropTypes.number
    })
  )
}
