import { ModalWrapper } from 'carbon-components-react'
import React from 'react'
import { useGridCtx } from '../../context/grid-context'
import { resetGrid } from '../../context/grid-reducer'
import { ARE_YOU_SURE } from '../../../../shared/grid/constants'

export const ResetTable = () => {
  const {
    dataGridRefAssignments,
    gridReadyAssignments,
    dataGridRefAssets,
    gridReadyAssets,
    gridState,
    dispatchGrid
  } = useGridCtx()

  const gridApiAssignments = gridReadyAssignments && dataGridRefAssignments.current.api
  const gridApiAssets = gridReadyAssets && dataGridRefAssets.current.api
  const { groupedTableData } = gridState
  const groupIds = Object.keys(groupedTableData || {})

  const handleReset = () => {
    if (gridApiAssignments && gridApiAssets) {
      dispatchGrid(resetGrid())
    }
  }

  const primaryButtonText = 'Reset Table'
  return groupIds.length > 0 ? (
    <ModalWrapper
      buttonTriggerText={primaryButtonText}
      modalHeading={primaryButtonText}
      handleSubmit={handleReset}
      primaryButtonText={primaryButtonText}
      shouldCloseAfterSubmit
      buttonTriggerClassName="bx--btn afpbulk-btn--tertiary"
    >
      <h5 className="afpbulk__are-you-sure">{ARE_YOU_SURE}</h5>
    </ModalWrapper>
  ) : null
}
