import { TrashCan32, Undo32 } from '@carbon/icons-react'
import { Button } from 'carbon-components-react'
import React from 'react'
import { useAfpCtx } from '../../context/afp-context'
import { AFP_STATUS_APPR } from '../../../../shared/grid/constants'

export const AfpLineGridAssignmentDeleteButton = ({ context, data, api: gridApi }) => {
  const { afps } = useAfpCtx()
  const { tabId } = context
  const afpData = afps.get(tabId)

  const { assignmentid, isdeleted, ...rest } = data

  if (isdeleted === undefined) {
    
    data.isdeleted = afpData?.data?.pelafpline.some(
      row => row.assignmentid === assignmentid && row?.isdeleted
    )
  }

  const handleDeletedStatus = status => {
    gridApi.applyTransactionAsync(
      {
        update: [
          {
            assignmentid,
            ...rest,
            isdeleted: status
          }
        ]
      },
      () => {
        gridApi.refreshCells({ force: true })
      }
    )
  }

  const handleDeleteBtnClick = () => handleDeletedStatus(true)
  const handleUndoBtnClick = () => handleDeletedStatus(false)
  const showDeleteIcon = data?.status !== AFP_STATUS_APPR

  if (!showDeleteIcon) {
    return ''
  }

  return (
    <>
      {showDeleteIcon && (
        <>
          {!data?.isdeleted ? (
            <Button
              size="sm"
              renderIcon={TrashCan32}
              hasIconOnly
              iconDescription="Delete Assignment"
              title="Delete Assignment"
              onClick={handleDeleteBtnClick}
              kind="ghost"
            />
          ) : (
            <Button
              size="sm"
              renderIcon={Undo32}
              hasIconOnly
              iconDescription="Undo Assignment"
              title="Undo Assignment"
              onClick={handleUndoBtnClick}
              kind="ghost"
            />
          )}
        </>
      )}
    </>
  )
}
