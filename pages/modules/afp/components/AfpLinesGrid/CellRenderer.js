import React, { forwardRef, useImperativeHandle } from 'react'
import { processChildData } from '../../utilities/processAfpData'

const CellRenderer = forwardRef(
  ({ value, valueFormatted, api, data, colDef, refreshCell, setValue, ...props }, ref) => {
    let transformedData = data
    if (!data.metadata) {
      const processedData = processChildData([data])
      transformedData = processedData[0]
    }
    const {
      metadata: { editableField }
    } = transformedData
    const { field } = colDef
    const cellValue = valueFormatted ?? value

    useImperativeHandle(ref, () => {
      return {
        getReactContainerClasses: () => (editableField[field] ? ['cell-renderer'] : null)
      }
    })

    return <div>{cellValue}</div>
  }
)

export default CellRenderer
