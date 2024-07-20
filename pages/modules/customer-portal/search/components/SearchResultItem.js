import React from 'react'
import PropTypes from 'prop-types'
import { ClickableTile } from 'carbon-components-react'
import { useDrag } from 'react-dnd'


import Moment from 'react-moment'
import moment from 'moment'
import { getServiceRequestType } from '../../../contact-center/constants'

export const SearchResultItem = ({
  ticketid,
  status,
  description,
  pluspcustomer,
  pelsrtype,
  reportdate,
  onClick,
  key,
  ...props
}) => {
  const checkRecentSR = reporteddate => moment().diff(reporteddate, 'days') < 8

  const [{ opacity }, dragRef] = useDrag({
    item: {
      id: ticketid,
      type: 'sr',
      ticketid,
      status,
      description,
      pluspcustomer,
      pelsrtype,
      reportdate,
      ...props
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1
    })
  })

  return (
    <ClickableTile
      handleClick={onClick}
      className="pel--search-result card card-1"
      href="#"
      key={key}
    >
      <div ref={dragRef} style={{ opacity }}>
        <h4 className="bx--tile-heading">
          <span>{ticketid}</span>
          {reportdate && checkRecentSR(reportdate) ? (
            <Moment fromNow>{reportdate}</Moment>
          ) : (
            <Moment format="DD-MMM-YYYY HH:mm">{reportdate}</Moment>
          )}
        </h4>
        <p className="bx--tile-text pel--text-wrap">
          {status} - {description}
        </p>
        <div className="pel--search-meta flex-column">
          <p className="bx--tile-text__small">
            Type: <span>{getServiceRequestType(pelsrtype)}</span>
          </p>

          {pluspcustomer?.customer && (
            <p className="bx--tile-text__small">
              Customer: <span>{pluspcustomer.name}</span>
            </p>
          )}
        </div>
      </div>
    </ClickableTile>
  )
}

SearchResultItem.defaultProps = {
  ticketid: '',
  description: '',
  status: '',
  mtfmworktype: ''
}

SearchResultItem.propTypes = {
  ticketid: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  mtfmworktype: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  key: PropTypes.string,
  pluspcustomer: PropTypes.shape({
    customer: PropTypes.string,
    name: PropTypes.string
  }),
  pelsrtype: PropTypes.string,
  reportdate: PropTypes.string
}
