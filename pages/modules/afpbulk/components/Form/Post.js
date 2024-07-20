import React, { useState } from 'react'
import { Button } from 'carbon-components-react'
import { useGridCtx } from '../../context/grid-context'
import { updateRowAssignments } from '../../context/grid-reducer'

import { useFileCtx } from '../../context/file-context'
import { postRowSuccess, postRowError, updatePostRows } from '../../context/grid-reducer'

import { updateFile } from '../../context/file-reducer'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { postAssignment } from '../../services/afpbulkService'
import {
  getAllEditedRows,
  getEditedRowPropChanges,
  getTableAssetsPostUpdates
} from '../../services/getChangesForPost'
import { findAssignmentAndGroup } from '../../utilities/findAssignmentAndGroup'
import { Loading } from '../../../shared-components/Loading'
import { useSession } from '../../../auth/SessionProvider'
import { api } from '../../../app/api'
import { assignIn } from 'lodash'

const getPostError = (assignmentid, errorMessage, status = null, data = null) => {
  console.warn({ assignmentid, errorMessage, status, data })
  return errorMessage
}

const postAndDispatch = ({
  groupId,
  href,
  assignmentid,
  rowAssignmentsPropsChanged,
  rowAssetsMultiIdChanged,
  rowAssetsMultiIdLock,
  dispatchGrid
}) =>
  postAssignment({
    href,
    row: rowAssignmentsPropsChanged,
  })
    .then(({ status, data }) => {
      if (status >= 200 && status <= 300) {
        dispatchGrid(
          postRowSuccess({
            groupId,
            assignmentid,
            allowedStatus: data.status,
            rowAssetsMultiIdChanged,
            rowAssetsMultiIdLock
          })
        )
      } else {
        dispatchGrid(
          postRowError({
            groupId,
            assignmentid,
            rowAssetsMultiIdChanged,
            error: getPostError(assignmentid, `Post Error: status=${status}`, status, data)
          })
        )
      }
    })
    .catch(err => {
      dispatchGrid(
        postRowError({
          groupId,
          assignmentid,
          rowAssetsMultiIdChanged,
          error: getPostError(assignmentid, err.toString())
        })
      )
    })

const getLockedMultiIds = ({ assignmentid, tableDataAssets }) =>
  tableDataAssets.reduce((accum, cur) => {
    if (cur.assignmentid === assignmentid) {
      accum.push(cur.multiid)
    }
    return accum
  }, [])

const getLockedMultiRow = ({ groupedTableData, tableDataAssignmentsEdited }) =>
  tableDataAssignmentsEdited.reduce((accum, cur) => {
    const { assignmentid } = cur
    const { tableData } = findAssignmentAndGroup(groupedTableData, assignmentid)
    const multi =
      tableData?.tableDataAssets.filter(item => item.assignmentid === assignmentid) || []
    return accum.concat(multi)
  }, [])

const createPromises = ({
  tableDataAssignmentsEdited,
  rowAssetsMultiIdChanged,
  groupedTableData,
  dispatchGrid,
  personid
}) =>
  tableDataAssignmentsEdited.map(row => {
    const { groupId, href, assignmentid } = row
    const rowAssignmentsPropsChanged = getEditedRowPropChanges({ row, groupedTableData, personid })

    const { tableData } = findAssignmentAndGroup(groupedTableData, assignmentid)
    const { tableDataAssets } = tableData
    const rowAssetsMultiIdLock = getLockedMultiIds({
      assignmentid,
      tableDataAssets
    })
    return postAndDispatch({
      groupId,
      href,
      assignmentid,
      rowAssignmentsPropsChanged,
      rowAssetsMultiIdChanged,
      rowAssetsMultiIdLock,
      dispatchGrid
    })
  })

export const Post = () => {
  const { addErrorToast } = useToast()
  const [isPosting, setPosting] = useState(false)
  const { fileState, dispatchFile } = useFileCtx()
  const { gridState, dispatchGrid, getGridState } = useGridCtx()

  const [session] = useSession();
  const personid = session?.personid;

  const { files } = fileState
  const { groupedTableData } = gridState

  const handlePost = () => {
    setPosting(true)

    const tableDataAssignmentsEdited = getAllEditedRows(groupedTableData)

    const tableDataAssetsEdited = getTableAssetsPostUpdates({
      groupedTableData,
      postRowUpdatesAssignments: tableDataAssignmentsEdited,
      personid
    })

    if (tableDataAssignmentsEdited.length > 0) {
      const rowAssetsMultiIdChanged = tableDataAssetsEdited.map(item => item.multiid)

      const promises = createPromises({
        tableDataAssignmentsEdited,
        rowAssetsMultiIdChanged,
        groupedTableData,
        dispatchGrid,
        personid
      })
      const { selectedFileId } = fileState

      Promise.allSettled(promises).then(() => {
        if (selectedFileId && files[selectedFileId]) {
          const groupedTableData = getGridState()?.groupedTableData
          dispatchFile(
            updateFile({
              fileId: selectedFileId,
              groupedTableData
            })
          )
        }
        dispatchGrid(
          updatePostRows({
            postRowUpdatesAssignments: tableDataAssignmentsEdited,
            postRowUpdatesAssets: getLockedMultiRow({
              groupedTableData,
              tableDataAssignmentsEdited
            })
          })
        )
        setPosting(false)
      })
    } else {
      addErrorToast({
        subtitle: 'Unable to commit',
        caption: 'You have not made any changes to Work Orders you are Committing'
      })
      setPosting(false)
    }
  }
  return (
    <>
      <Button
        onClick={handlePost}
        className="bx--btn afpbulk-btn--secondary"
        labelText="Commit to Maximo"
      >
        Commit to Maximo
      </Button>
      {isPosting ? <Loading modal /> : null}
    </>
  )
}
