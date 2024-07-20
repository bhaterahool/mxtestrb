import React from 'react'

export const CellAfpLineAssignment = params => {
  const {
    value = '',
    valueFormatted = '',
    context: { handleCellAfpLineAssignmentClick }
  } = params

  const cellValue = valueFormatted ? valueFormatted : value;

  return (
    <div className='afpline__assignment' onClick={() => handleCellAfpLineAssignmentClick(params?.data?.assignmentid)} >{cellValue}</div>
  )
}