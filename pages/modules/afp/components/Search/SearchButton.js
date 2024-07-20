import React from 'react'
import { Button } from 'carbon-components-react'
import { Search32, ChevronLeft32 } from '@carbon/icons-react'
import { useUI } from '../../context/ui-context/ui-context'

export const SearchButton = () => {
  const { searchOpen, toggleSearchPanel } = useUI()

  return (
    <Button
      renderIcon={searchOpen ? ChevronLeft32 : Search32}
      className="pel--searchlist-toggle-btn"
      onClick={toggleSearchPanel}
      iconDescription={searchOpen ? 'Close' : 'Search'}
      hasIconOnly
    />
  )
}
