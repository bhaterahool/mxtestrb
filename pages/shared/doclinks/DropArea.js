import React from 'react'
import PropTypes from 'prop-types'
import { useDropzone } from 'react-dropzone'

export const DropArea = ({ handleDrop, fileCount }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    multiple: true
  })

  return (
    <div>
      <div className={fileCount > 0 ? 'drop-zone' : 'initial-drop-zone'} {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag files here or click to select files</p>
      </div>
    </div>
  )
}

DropArea.propTypes = {
  handleDrop: PropTypes.func.isRequired,
  fileCount: PropTypes.number
}
