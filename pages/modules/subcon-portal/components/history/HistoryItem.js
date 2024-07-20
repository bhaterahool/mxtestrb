import React from 'react'
import PropTypes from 'prop-types'
import { ClickableTile } from 'carbon-components-react'
import Moment from 'react-moment'
import { historyTypes } from '../../search/useSubcontractSearch'

export const HistoryItem = ({ item, onClick, ...props }) => {
  switch (item.type) {
    case historyTypes.SEARCH:
      return (
        <ClickableTile {...props} handleClick={onClick} className="pel--search-result" href="#">
          <h4 className="bx--tile-heading">{`Searched "${item?.searchParams?.searchTerms}"`}</h4>
          <Moment format="DD-MMM-YYYY HH:mm">{item.date}</Moment>
        </ClickableTile>
      )
    case historyTypes.ADVANCEDSEARCH:
      return (
        <ClickableTile {...props} handleClick={onClick} className="pel--search-result" href="#">
          <h4 className="bx--tile-heading">Advanced Search</h4>
          <p className="bx--tile-text">{item?.searchParams?.queryParams?.where}</p>
          <Moment format="DD-MMM-YYYY HH:mm">{item.date}</Moment>
        </ClickableTile>
      )
    default:
      return null
  }
}

HistoryItem.defaultProps = {}

HistoryItem.propTypes = {
  item: PropTypes.shape({
    date: PropTypes.any,
    type: PropTypes.any,
    searchParams: PropTypes.shape({
      searchTerms: PropTypes.string,
      queryParams: PropTypes.shape({
        searchTerms: PropTypes.string,
        where: PropTypes.string
      })
    })
  }),
  onClick: PropTypes.func
}
