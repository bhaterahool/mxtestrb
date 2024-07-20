import { TrashCan32 } from '@carbon/icons-react'
import { Button } from 'carbon-components-react'
import React from 'react'

export const ActionCell = ({ data, api: gridApi, status, afpLineStatus }) => {
  const { pelafplinedetailid } = data

  const handleClick = async () => {
    gridApi.applyTransaction({
      remove: [
        {
          pelafplinedetailid
        }
      ]
    })
  }

  return (
    <Button
      size="sm"
      renderIcon={TrashCan32}
      hasIconOnly
      iconDescription="Delete line"
      title="Delete line"
      onClick={handleClick}
      kind="ghost"
      disabled={
        ['SUBMITTED', 'APPROVED', 'CLOSED'].includes(status) ||
        ['SUBMITTED', 'APPROVED', 'CLOSED'].includes(afpLineStatus)
      }
    />
  )
}
