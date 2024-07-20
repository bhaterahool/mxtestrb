import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useLocalStorage } from '../../../../shared/hooks/useLocalStorage'
import { HistoryItem } from './HistoryItem'
import config from '../../../app/config'

export const History = ({ onClick, currSearch }) => {
  const [historyState, setHistoryState] = useLocalStorage('afp_search_history', [])

  useEffect(() => {
    if (!currSearch.type) return
    const history = {
      ...currSearch,
      skipSearch: false,
      id: currSearch.date.getTime()
    }
    setHistoryState(cachedHistory => [
      history,
      ...cachedHistory.slice(0, config.search.historySize - 1)
    ])
  }, [currSearch.date])

  const handleClick = historyItem => e => {
    e.preventDefault()
    onClick(historyItem)
  }

  return (
    <div className="pel--search-results">
      {historyState.map(item => (
        <HistoryItem key={item.id} item={item} onClick={handleClick(item)} />
      ))}
    </div>
  )
}

History.propTypes = {
  onClick: PropTypes.func.isRequired,
  currSearch: PropTypes.shape({
    type: PropTypes.number,
    date: PropTypes.instanceOf(Date)
  })
}
