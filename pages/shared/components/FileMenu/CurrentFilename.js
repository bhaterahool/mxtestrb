import PropTypes from 'prop-types'
import { Button } from 'carbon-components-react'
import React from 'react'
import { UNTITLED } from '../../grid/constants'
import { DeleteFileAsModal } from './DeleteFile'

export const hasGridItems = (gridItemName, selectedFile) => {
  const currentFileCustomers = (selectedFile && selectedFile[gridItemName]) || {}
  return Object.keys(currentFileCustomers).length > 0
}

export const CurrentFilename = ({
  fileState,
  handleSelectCurrentFile,
  gridItemName,
  handleDeleteFile
}) => {
  const { files, selectedFileId } = fileState
  const selectedFile = files && files[selectedFileId]
  const currentFileName = selectedFile?.fileName || UNTITLED

  return hasGridItems(gridItemName, selectedFile) ? (
    <div className="file-menu__current-filename-wrapper">
      <h5>Current:</h5>
      <div className="file-menu__filemenu-actions">
        <Button className="file-menu__current-filename" onClick={handleSelectCurrentFile}>
          {currentFileName}
        </Button>
        <DeleteFileAsModal
          fileName={currentFileName}
          fileId={selectedFileId}
          handleDeleteFile={handleDeleteFile}
        />
      </div>
    </div>
  ) : null
}

CurrentFilename.propTypes = {
  fileState: PropTypes.any,
  handleSelectCurrentFile: PropTypes.func.isRequired,
  gridItemName: PropTypes.string.isRequired,
  handleDeleteFile: PropTypes.func.isRequired
}
