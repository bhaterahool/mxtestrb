import { UNTITLED } from '../../../shared/grid/constants'
import { createTimeStamp } from '../../../util/datetime'
import { deleteState, LABEL_AFPBULK, saveState } from '../../../util/persistState'

export const initState = {
  files: {
      },
  selectedFileId: String(createTimeStamp())
}

export const populateFileState = ({ fileState }) => ({
  type: 'POPULATE_FILE_STATE',
  payload: { fileState }
})

export const updateFile = ({ fileId, groupedTableData, fileName = null }) => ({
  type: 'UPDATE_FILE',
  payload: { fileId, groupedTableData, fileName }
})

export const updateFileName = ({ fileName }) => ({
  type: 'UPDATE_FILE_NAME',
  payload: { fileName }
})

export const deleteFile = ({ fileId }) => ({
  type: 'DELETE_FILE',
  payload: { fileId }
})

export const deleteAllFiles = () => ({
  type: 'DELETE_ALL_FILES'
})

export const selectFile = ({ fileId }) => ({
  type: 'SELECT_FILE',
  payload: { fileId }
})

export const reducer = (state = initState, { type, payload }) => {
  const { files, selectedFileId } = state
  switch (type) {
    case 'POPULATE_FILE_STATE': {
      const { fileState } = payload
      return fileState
    }
    case 'UPDATE_FILE': {
      const { fileId, fileName, groupedTableData } = payload
      const dataState = {
        ...state,
        files: {
          ...files,
          [fileId]: {
            fileName: fileName || files[fileId]?.fileName || UNTITLED,
            groupedTableData,
            lastSaved: createTimeStamp()
          }
        },
        selectedFileId: String(fileId)
      }
      saveState(dataState, LABEL_AFPBULK)
      return dataState
    }
    case 'UPDATE_FILE_NAME': {
      const { fileName } = payload
      const selectedFile = state.files[selectedFileId]
      const groupedTableData = selectedFile?.groupedTableData || []
      const lastSaved = selectedFile?.lastSaved || createTimeStamp()
      const dataState = {
        ...state,
        files: {
          ...files,
          [selectedFileId]: {
            fileName,
            groupedTableData,
            lastSaved
          }
        }
      }
      saveState(dataState, LABEL_AFPBULK)
      return dataState
    }
    case 'DELETE_FILE': {
      const { fileId } = payload
      const { files, selectedFileId } = state
      const filesReduced = Object.keys(files).reduce(
        (accum, cur) =>
          cur !== fileId
            ? {
                ...accum,
                [cur]: files[cur]
              }
            : accum,
        {}
      )

      const newSelectedFileId =
        selectedFileId === fileId
          ? Object.keys(filesReduced).pop() || String(createTimeStamp())
          : selectedFileId

      const dataState = {
        ...state,
        files: filesReduced,
        selectedFileId: newSelectedFileId
      }
      saveState(dataState, LABEL_AFPBULK)
      return dataState
    }
    case 'DELETE_ALL_FILES': {
      deleteState(LABEL_AFPBULK)
      return initState
    }
    case 'SELECT_FILE': {
      const { fileId } = payload
      const dataState = {
        ...state,
        selectedFileId: String(fileId)
      }
      saveState(dataState, LABEL_AFPBULK)
      return dataState
    }
    default:
      return state
  }
}
