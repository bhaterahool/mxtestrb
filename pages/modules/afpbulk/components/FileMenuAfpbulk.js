import React from 'react'
import { useFileCtx } from '../context/file-context'
import { LABEL_AFPBULK } from '../../../util/persistState'
import { populateFileState, selectFile, deleteFile, deleteAllFiles } from '../context/file-reducer'
import { overwriteAll } from '../context/grid-reducer'
import { useGridCtx } from '../context/grid-context'
import { FileMenu } from '../../../shared/components/FileMenu/FileMenu'

export const FileMenuAfpbulk = () => {
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
    const groupedTableData = files[selectedFileId]?.groupedTableData
    if (groupedTableData) {
      dispatchGrid(
        overwriteAll({
          groupedTableData
        })
      )
    }
  }

  const handleSelectFile = evt => {
    const fileId = evt.target.getAttribute('data-fileId')
    dispatchFile(selectFile({ fileId }))
    dispatchGrid(
      overwriteAll({
        groupedTableData: files[fileId].groupedTableData
      })
    )
  }
  const handleSelectCurrentFile = () => {
    dispatchFile(selectFile({ fileId: selectedFileId }))
    dispatchGrid(
      overwriteAll({
        groupedTableData: files[selectedFileId].groupedTableData
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
      LABEL_CACHE={LABEL_AFPBULK}
      populateLoaded={populateLoaded}
      handleSelectFile={handleSelectFile}
      handleSelectCurrentFile={handleSelectCurrentFile}
      handleDeleteFile={handleDeleteFile}
      handleDeleteAll={handleDeleteAll}
      gridItemName="groupedTableData"
    />
  )
}
