import { ModalWrapper } from 'carbon-components-react'
import React from 'react'
import { useGridCtx } from '../../context/grid-context'
import { clearGrid } from '../../context/grid-reducer'
import { ARE_YOU_SURE } from '../../../../shared/grid/constants'

export const ResetTable = () => {
  const { dataGridRef, gridReady, gridState, dispatchGrid } = useGridCtx()

  const gridApi = gridReady && dataGridRef.current.api
  const { customers } = gridState
  const customerKeys = Object.keys(customers || {})

  const handleReset = () => {
    if (gridApi) {
      dispatchGrid(clearGrid())
    }
  }

  const primaryButtonText = 'Reset Table'
  return customerKeys.length > 0 ? (
    <ModalWrapper
      buttonTriggerText={primaryButtonText}
      modalHeading={primaryButtonText}
      handleSubmit={handleReset}
      primaryButtonText={primaryButtonText}
      shouldCloseAfterSubmit
      buttonTriggerClassName="bx--btn wopricing-btn--tertiary"
    >
      <h5 className="wopricing__are-you-sure">{ARE_YOU_SURE}</h5>
    </ModalWrapper>
  ) : null
}
