import React from 'react'
import PropTypes from 'prop-types'
import { ClickableTile } from 'carbon-components-react'
import Moment from 'react-moment'
import { SEARCH_TYPE, FILTERS, DEFAULT_FILTER } from './search-util'
import { SearchResultItem } from './SearchResultItem'

export const HistoryItem = ({ item, onClick, ...props }) => {
  switch (item.type) {
    case SEARCH_TYPE.BASIC: {
      const { searchTerm, savedQuery = DEFAULT_FILTER } = item.searchParams.queryParams
      const { value, description } = FILTERS.find(({ value }) => value === savedQuery)
      const filter = value === DEFAULT_FILTER.value ? null : description

      return (
        <ClickableTile
          {...props}
          handleClick={onClick}
          className="pel--search-result card-1 pel--card-margin"
          href="#"
        >
          <h4 className="bx--tile-heading">{`Searched "${searchTerm}"`}</h4>
          {filter && <h3 className="bx--tile-heading">{`Filter "${filter}"`}</h3>}
          <Moment format="DD-MMM-YYYY HH:mm">{item.date}</Moment>
        </ClickableTile>
      )
    }
    case SEARCH_TYPE.ADVANCED:
      return (
        <ClickableTile
          {...props}
          handleClick={onClick}
          className="pel--search-result card-1 pel--card-margin"
          href="#"
        >
          <h4 className="bx--tile-heading">Advanced Search</h4>
          <p className="bx--tile-text">{item?.searchParams?.queryParams?.where}</p>
          <Moment format="DD-MMM-YYYY HH:mm">{item.date}</Moment>
        </ClickableTile>
      )
    case SEARCH_TYPE.AFP:
      return <SearchResultItem {...item.data} onClick={onClick} />
    default:
      return null
  }
}

HistoryItem.defaultProps = {}

HistoryItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    data: PropTypes.instanceOf(Object),
    type: PropTypes.string.required,
    searchParams: PropTypes.shape({
      queryParams: PropTypes.shape({
        searchTerm: PropTypes.string,
        savedQuery: PropTypes.string,
        where: PropTypes.string
      })
    })
  }),
  onClick: PropTypes.func
}
