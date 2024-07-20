import React from 'react'
import { useFileCtx } from '../context/file-context'
import { LABEL_WOPRICING } from '../../../util/persistState'
import { populateFileState, selectFile, deleteFile, deleteAllFiles } from '../context/file-reducer'
import { overwriteAll } from '../context/grid-reducer'
import { useGridCtx } from '../context/grid-context'
import { FileMenu } from '../../../shared/components/FileMenu/FileMenu'

export const FileMenuWopricing = () => {
  const { dispatchFile, fileState } = useFileCtx()
  const { dispatchGrid } = useGridCtx()
  const { selectedFileId, files } = fileState

  
  
  
  

  const populateLoaded = loadedFileState => {
    dispatchFile(
      populateFileState({
        fileState: loadedFileState
      })
    )
    const { selectedFileId, files } = loadedFileState
    const customers = files[selectedFileId]?.customers
    if (customers) {
      dispatchGrid(
        overwriteAll({
          customers
        })
      )
    }
  }
  const handleSelectFile = evt => {
    const fileId = evt.target.getAttribute('data-fileId')
    dispatchFile(selectFile({ fileId }))
    dispatchGrid(
      overwriteAll({
        customers: files[fileId].customers
      })
    )
  }

  const handleSelectCurrentFile = () => {
    dispatchFile(selectFile({ fileId: selectedFileId }))
    dispatchGrid(
      overwriteAll({
        customers: files[selectedFileId].customers
      })
    )
  }

  const handleDeleteFile = fileId => {
    dispatchFile(deleteFile({ fileId }))
    return true
  }

  const handleDeleteAll = () => {
    dispatchFile(deleteAllFiles())
    return true
  }

  return (
    <FileMenu
      fileState={fileState}
      LABEL_CACHE={LABEL_WOPRICING}
      populateLoaded={populateLoaded}
      handleSelectFile={handleSelectFile}
      handleSelectCurrentFile={handleSelectCurrentFile}
      handleDeleteFile={handleDeleteFile}
      handleDeleteAll={handleDeleteAll}
      gridItemName="customers"
    />
  )
}
