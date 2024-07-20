import React from 'react'
import Time16 from '@carbon/icons-react/lib/time/16'
import { Button } from 'carbon-components-react'

export const CellAfpLineStatusHistory = params => {
  const {
    context: { handleCellAfpLineSatusHistoryButtonClick }
  } = params

  return (
    <Button
      renderIcon={Time16}
      hasIconOnly
      iconDescription="AfpLine Status History"
      title="AfpLine Status History"
      onClick={() => handleCellAfpLineSatusHistoryButtonClick(params?.data?.pelafplineid)}
      kind="ghost"
    />
  )
}
