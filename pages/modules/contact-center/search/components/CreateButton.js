import React from 'react'
import { Add16 } from '@carbon/icons-react';

export const CreateButton = ({
  description,
  onClick
}) => {
  return (
    <div
      role="button"
      className="bx--list-box__selection"
      onClick={onClick}
      aria-label="Create new"
      title={description}
    >
      <Add16 />
    </div>
  )
}