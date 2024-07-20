import { ModalWrapper, TextInput } from 'carbon-components-react'
import React, { useEffect, useState } from 'react'
import { useFileCtx } from '../../context/file-context'
import { updateFile } from '../../context/file-reducer'
import { useGridCtx } from '../../context/grid-context'
import { createTimeStamp, getTimeAgo, INTERVAL_TIMEAGO_1_MINUTE } from '../../../../util/datetime'
import { hasGridItems } from '../../../../shared/components/FileMenu/CurrentFilename'

import { useToast } from '../../../../shared/toasts/ToastProvider'

import './index.scss'
import { cloneObj } from '../../../../util/clone'
import { UNTITLED } from '../../../../shared/grid/constants'

export const Save = () => {
  const { addErrorToast } = useToast()
  const { gridState } = useGridCtx()
  const { customers } = gridState
  const customerKeys = Object.keys(customers || {})

  const { fileState, dispatchFile } = useFileCtx()
  const { selectedFileId } = fileState
  const { files } = fileState

  const fileKeys = (files && Object.keys(files)) || []

  const selectedFile = files && files[selectedFileId]
  const currentFileName = selectedFile?.fileName
  const hasBeenSaved = hasGridItems('customers', selectedFile)

  const [fileName, setFileName] = useState(UNTITLED)

  useEffect(() => {
    setFileName(currentFileName)
  }, [currentFileName])

  const handleFileNameChange = evt => {
    setFileName(evt.target.value)
  }

  const lastSaved = selectedFile?.lastSaved
  const [niceLastSaved, setNiceLastSaved] = useState(getTimeAgo(lastSaved))

  useEffect(() => {
    setNiceLastSaved(getTimeAgo(lastSaved))
    const timer = setInterval(() => {
      setNiceLastSaved(getTimeAgo(lastSaved))
    }, INTERVAL_TIMEAGO_1_MINUTE)
    return () => {
      clearInterval(timer)
    }
  }, [lastSaved])

  const saveFile = fileId => {
    const saveFileId = fileId || createTimeStamp()
    const gridCustomers = cloneObj(gridState.customers) || {}
    const gidCustomersKeys = Object.keys(gridCustomers)
    if (gidCustomersKeys.length > 0) {
      dispatchFile(
        updateFile({
          fileName,
          fileId: saveFileId,
          customers: gridCustomers
        })
      )
      return true
    }
    addErrorToast({
      subtitle: 'Error - Saving File',
      caption: 'Table not ready. Pleas wait for table to load.'
    })
    return false
  }

  const handleSave = () => saveFile(selectedFileId)
  const handleSaveAs = () => saveFile()

  const handleFocusRename = () => {
    if (currentFileName && fileName === UNTITLED) {
      setFileName(currentFileName)
    }
  }
  const handleFocusSaveAs = () => {
    if (fileName === currentFileName) {
      setFileName(UNTITLED)
    }
  }

  const primaryButtonText = 'Save'
  return (
    <>
      {customerKeys.length > 0 && (
        <ModalWrapper
          buttonTriggerText="Save"
          modalHeading="Save File"
          handleSubmit={handleSave}
          primaryButtonText={primaryButtonText}
          shouldCloseAfterSubmit
          onFocus={handleFocusRename}
        >
          <TextInput
            labelText=""
            className="wopricing__customer-filename"
            id="wopricing__filename"
            placeholder="Enter Filename..."
            value={fileName}
            onChange={handleFileNameChange}
          />
        </ModalWrapper>
      )}

      {fileKeys.length > 0 && (
        <ModalWrapper
          buttonTriggerText="Save as"
          modalHeading="Save File as"
          handleSubmit={handleSaveAs}
          primaryButtonText="Save as"
          shouldCloseAfterSubmit
          onFocus={handleFocusSaveAs}
        >
          <TextInput
            labelText=""
            id="wopricing__files-filename"
            className="wopricing__filename"
            placeholder="Enter Filename..."
            value={fileName}
            onChange={handleFileNameChange}
          />
        </ModalWrapper>
      )}
      {hasBeenSaved && (
        <p className="wopricing__last-saved">
          <strong>Last Saved:</strong> {niceLastSaved}
        </p>
      )}
    </>
  )
}
