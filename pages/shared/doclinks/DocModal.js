import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm, FormProvider } from 'react-hook-form'
import { Modal } from 'carbon-components-react'
import { useToast } from '../toasts/ToastProvider'
import { UploadForm } from './UploadForm'
import { DropArea } from './DropArea'
import { FileList } from './FileList'
import { useFileManager } from './hooks/useFileManager'
import { Loading } from '../../modules/shared-components/Loading'
import { api } from '../../modules/app/api'
import getRelativePath from '../../util/getRelativePath'
import './scss/required-docs.scss'
import { useSubcontractSearchProvider } from '../../modules/subcon-portal/search/SubcontractSearchProvider'


const upload = (href, file, meta, requiredDocs, siteId) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    try {
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1]
        try {
          const res = await api.post(getRelativePath(href), base64Data, {
            headers: {
              properties: 'doclinks{*}',
              slug: file.name,
              'x-document-encdescription': btoa(meta.description),
              'x-document-meta': `FILE/${meta.doctype}`,
              'Content-type': 'utf-8',
              'custom-encoding': 'base64'
            }
          })
          
          if (meta.required) {
            const doclinksid = res.headers.location.split('/').slice(-1)[0]

            if (!doclinksid) {
              throw new Error('could not retrieve doclink id from response header')
            }
            const doc = requiredDocs.find(
              requiredDoc => requiredDoc.pelreqdocswoid === parseInt(meta.required, 10)
            )

            await api.post(
              getRelativePath(doc.href),
              {
                doclinksid: parseInt(doclinksid, 10),
                
                notprovided: false,
                notprovideddesc: '',
                notprovidedreason: '',
                peldocdate: meta.documentdate,
                ...(siteId && { siteid: siteId })
              },
              {
                headers: {
                  'x-method-override': 'PATCH',
                  patchtype: 'MERGE'
                }
              }
            )
          }

          return resolve()
        } catch (e) {
          const errorMsg = e?.message.split('.')
          return reject(new Error(`${errorMsg[0]}`))
        }
      }

      reader.readAsDataURL(file)
    } catch (err) {
      return reject(new Error(`failed to save file: ${err?.message}`))
    }
  })
}

export const DocModal = ({
  docTypes,
  requiredDocs,
  href,
  open,
  onRequestClose,
  siteId = '',
  isSubCon,
  updateDocument: { isUpdate, data: documentData },
  handleCreateDoclink = () => {}
}) => {
  const methods = useForm()
  const fileManager = useFileManager()
  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const [errors, setErrors] = useState([])
  const [serverdate, setServerdate] = useState()

  const [showLoader, setShowLoader] = useState(false)

  const { refresh } = useSubcontractSearchProvider()

  const clearFiles = () => {
    fileManager.files.forEach(function(value, index) {
      fileManager.handleFileDelete(index)
    })
    methods.reset()
    onRequestClose()
  }

  const handleSubmit = async () => {
    const { files: meta } = methods.getValues()

    // Validate.
    const formErrors = meta.map(m => {
      return !m.title || !m.doctype || !m.description
    })

    setErrors(formErrors)

    // Upload and update files in succession.
    // TODO: Account for partial failures?
    if (!formErrors.some(error => error === true)) {
      // show loader
      setShowLoader(true)
      onRequestClose()
      await Promise.all(
        fileManager.files.map((file, index) =>
          upload(href, file, meta[index], requiredDocs, siteId)
            .then(() => {
              addSuccessToast({
                title: 'File Uploaded',
                subtitle: `File ${index + 1} of ${fileManager.files.length} uploaded`
              })
              handleCreateDoclink()
            })
            .catch(e => {
              addPersistentErrorToast({
                title: 'Failed to save file',
                subtitle: `${e}`
              })
              handleCreateDoclink()
            })
        )
      )

      
      methods.reset()

      
      refresh()
      setShowLoader(false)
      return clearFiles()
    }
  }

  const getServerDate = async () => {
    try {
      await api.get(`ping`).then(res => {
        setServerdate(new Date(res.headers.date))
      })
    } catch (err) {
      throw new Error(`Cound not retrieve server date. Reason: ${err.message}`)
    }
  }

  useEffect(() => {
    getServerDate()
  }, [open])

  useEffect(() => {
    if (isUpdate) {
      const blob = new Blob([''], { type: 'text/html' })
      blob.lastModifiedDate = ''
      blob.name = 'filename'

      const fakeF = blob

      fileManager.handleFiles([fakeF])
    }
  }, [isUpdate])

  useEffect(() => {
    if (isUpdate) {
      const { setValue } = methods

      setValue('files[0].title', documentData?.title)
      setValue('files[0].description', documentData?.description)
      setValue('files[0].required', documentData?.required)
    }
  }, [fileManager?.files])

  return (
    <>
      {showLoader && <Loading modal />}
      <Modal
        size="sm"
        open={open}
        hasForm
        className={
          !isUpdate && fileManager.files.length === 0
            ? 'pel--required-docs-modal initial-drop-zone-footer'
            : 'pel--required-docs-modal'
        }
        primaryButtonText={`${showLoader ? 'Saving..' : 'Save'}`}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSubmit}
        onRequestClose={clearFiles}
        primaryButtonDisabled={showLoader}
      >
        <div>
          {!isUpdate && (
            <DropArea handleDrop={fileManager.handleFiles} fileCount={fileManager.files.length} />
          )}
          {(isUpdate || fileManager.files.length > 0) && (
            <div className="row">
              {!isUpdate && (
                <div className="column pel--file-manager">
                  <FileList
                    files={fileManager.files}
                    handleSelect={fileManager.handleFileSelect}
                    handleDelete={fileManager.handleFileDelete}
                    errors={errors}
                    isSubCon={isSubCon}
                    serverdate={serverdate}
                    isUpdate
                    documentData={documentData}
                  />
                </div>
              )}
              <div className="column">
                <FormProvider {...methods}>
                  <UploadForm
                    files={fileManager.files}
                    selectedFile={fileManager.selectedFile}
                    docTypes={docTypes}
                    requiredDocs={requiredDocs}
                    errors={errors}
                  />
                  {!isUpdate && (
                    <DropArea
                      handleDrop={fileManager.handleFiles}
                      fileCount={fileManager.files.length}
                    />
                  )}
                </FormProvider>
              </div>
            </div>
          )}
        </div>
      </Modal>
      {showLoader && (
        <div className="pg-viewer-wrapper pel-docloader">
          <div className="pg-viewer" id="pg-viewer">
            <div className="loading-container">
              <span className="loading" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

DocModal.propTypes = {
  updateDocument: PropTypes.arrayOf(
    PropTypes.shape({
      isUpdate: PropTypes.bool,
      data: PropTypes.shape(PropTypes.any)
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
  href: PropTypes.string.isRequired,
  open: PropTypes.bool,
  handleCreateDoclink: PropTypes.func,
  siteId: PropTypes.string,
  isSubCon: PropTypes.bool,
  onRequestClose: PropTypes.func.isRequired
}
