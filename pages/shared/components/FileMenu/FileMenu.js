import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { SideNav, Button } from 'carbon-components-react'
import { loadState } from '../../../util/persistState'
import { CurrentFilename } from './CurrentFilename'
import { DeleteFileAsModal } from './DeleteFile'
import { DeleteAllFiles } from './DeleteAllFiles'
import './index.scss'

export const FileMenu = ({
  fileState,
  LABEL_CACHE,
  populateLoaded,
  handleSelectFile,
  handleSelectCurrentFile,
  handleDeleteFile,
  handleDeleteAll,
  gridItemName
}) => {
  const { selectedFileId, files } = fileState
  useEffect(() => {
    const loadedFileState = loadState(LABEL_CACHE)
    if (loadedFileState) {
      populateLoaded(loadedFileState)
    }
  }, [])

  if (Object.keys(files).length === 0) {
    return null
  }

  const fileKeys = Object.keys(files || {})

  return (
    <SideNav
      className="pel--bx-side file-menu__filemenu"
      isFixedNav
      expanded
      aria-label="Side navigation"
    >
      <CurrentFilename
        fileState={fileState}
        handleSelectCurrentFile={handleSelectCurrentFile}
        gridItemName={gridItemName}
        handleDeleteFile={handleDeleteFile}
      />

      {fileKeys.length > 1 && (
        <>
          <h5>Load Previous</h5>
          <ul>
            {fileKeys.map(fileId =>
              fileId !== selectedFileId ? (
                <li className="file-menu__filemenu-li" key={`File-load-${fileId}`}>
                  <Button
                    data-fileId={fileId}
                    onClick={handleSelectFile}
                    className="file-menu__filemenu-btn"
                    labelText="Select File"
                  >
                    {fileState.files[fileId].fileName}
                  </Button>
                  <DeleteFileAsModal
                    fileName={files[fileId].fileName}
                    fileId={fileId}
                    handleDeleteFile={handleDeleteFile}
                  />
                </li>
              ) : null
            )}
          </ul>
          <DeleteAllFiles
            fileState={fileState}
            handleDeleteAll={handleDeleteAll}
            gridItemName={gridItemName}
          />
        </>
      )}
    </SideNav>
  )
}

FileMenu.propTypes = {
  fileState: PropTypes.any,
  LABEL_CACHE: PropTypes.string.isRequired,
  populateLoaded: PropTypes.func.isRequired,
  handleSelectFile: PropTypes.func.isRequired,
  handleSelectCurrentFile: PropTypes.func.isRequired,
  handleDeleteFile: PropTypes.func.isRequired,
  handleDeleteAll: PropTypes.func.isRequired,
  gridItemName: PropTypes.string.isRequired
}
