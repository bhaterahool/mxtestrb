import { useState } from 'react'

export const useFileManager = () => {
  const [state, setState] = useState({
    selectedFile: null,
    files: []
  })

  const handleFiles = acceptedFiles => {
    setState(state => ({
      ...state,
      files: [...state.files, ...acceptedFiles]
    }))
  }

  const handleFileSelect = index =>
    setState(state => ({
      ...state,
      selectedFile: index
    }))

  const handleFileDelete = index =>
    setState(state => ({
      ...state,
      files: [...state.files.slice(0, index), ...state.files.slice(index + 1)]
    }))

  const getSelectedFile = () => state.files[state.selectedFile]

  return {
    handleFileDelete,
    handleFileSelect,
    handleFiles,
    getSelectedFile,
    ...state
  }
}
