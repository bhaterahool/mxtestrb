import PropTypes from 'prop-types'
import React from 'react'
import { useServiceRequestSearchProvider, historyTypes } from '../search/SearchProvider'
import { HistoryItem } from '../search/components/HistoryItem'
import { useTicketProvider, selectTicket } from '../TicketProvider'

export const History = ({ handleClick }) => {
  const { history, setSearchParams } = useServiceRequestSearchProvider()
  const [, dispatch] = useTicketProvider()

  const onClick = historyItem => e => {
    e.preventDefault()

    switch (historyItem.type) {
      case historyTypes.SEARCH:
      case historyTypes.ADVANCEDSEARCH: {
        setSearchParams(historyItem.searchParams)
        handleClick()
        break
      }
      case historyTypes.SR: {
        dispatch(selectTicket(historyItem.sr.ticketid))
        break
      }
      default:
    }
  }

  return (
    <div className="pel--search-results">
      {history?.map(result => (
        <HistoryItem key={`${Math.random()}}`} item={result} onClick={onClick(result)} />
      ))}
    </div>
  )
}

History.propTypes = {
  handleClick: PropTypes.func
}
