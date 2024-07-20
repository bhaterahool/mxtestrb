import PropTypes from 'prop-types'
import React from 'react'
import { useSubcontractSearchProvider, historyTypes } from '../../search/SubcontractSearchProvider'
import { HistoryItem } from './HistoryItem'

export const SubcontractHistory = ({ handleClick }) => {
  const { history, setSearchParams } = useSubcontractSearchProvider()

  const onClick = historyItem => e => {
    e.preventDefault()
    switch (historyItem.type) {
      case historyTypes.SEARCH:
      case historyTypes.ADVANCEDSEARCH: {
        setSearchParams(historyItem.searchParams)
        handleClick()
        break
      }
      default:
    }
  }

  return (
    <div className="pel--search-results">
      {history.map((result, index) => (
        <HistoryItem key={result.id} item={result} onClick={onClick(result)} />
      ))}
    </div>
  )
}

SubcontractHistory.propTypes = {
  handleClick: PropTypes.func
}
