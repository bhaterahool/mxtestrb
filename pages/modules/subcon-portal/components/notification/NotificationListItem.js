import React from 'react'
import PropTypes from 'prop-types'
import { Tile } from 'carbon-components-react'
import UnReadFlag from '@carbon/icons-react/lib/flag--filled/24'
import ReadFlag from '@carbon/icons-react/lib/flag/24'
import Archive from '@carbon/icons-react/lib/archive/24'
import Undo from '@carbon/icons-react/lib/undo/24'
import './NotificationListItem.scss'
import Moment from 'react-moment'
import moment from 'moment'

export const NotificationListItem = ({
  status,
  postdate,
  subject,
  onClick,
  onReadClick,
  onUnReadClick,
  onArchiveClick,
  onUndoClick,
  key
}) => {
  const checkRecentSR = reporteddate => moment().diff(reporteddate, 'days') < 8

  return (
    <Tile className="pel--search-result card card-1 pel--notification-container" href="#" key={key}>
      <div className="notification-list-card" onClick={onClick}>
        {postdate && checkRecentSR(postdate) ? (
          <Moment fromNow>{postdate}</Moment>
        ) : (
          <Moment format="DD-MMM-YYYY HH:mm">{postdate}</Moment>
        )}
        <div className="pel--notification-title">{subject}</div>
      </div>

      {status !== 'READ' && status !== 'ARCHIVED' && (
        <div className="status">
          <span className="label">Unread</span>
          <UnReadFlag onClick={onReadClick} />
        </div>
      )}

      {status === 'READ' && status !== 'ARCHIVED' && (
        <div className="status">
          <span className="label">Read</span>
          <ReadFlag onClick={onUnReadClick} />
        </div>
      )}

      {status !== 'ARCHIVED' && (
        <div className="status">
          <span className="label">Archive</span>
          <Archive onClick={onArchiveClick} />
        </div>
      )}

      {status === 'ARCHIVED' && (
        <div className="status">
          <span className="label">Undo</span>
          <Undo onClick={onUndoClick} />
        </div>
      )}
    </Tile>
  )
}

NotificationListItem.defaultProps = {
  postdate: '',
  subject: '',
  status: ''
}

NotificationListItem.propTypes = {
  postdate: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onReadClick: PropTypes.func.isRequired,
  onUnReadClick: PropTypes.func.isRequired,
  onArchiveClick: PropTypes.func.isRequired,
  onUndoClick: PropTypes.func.isRequired,
  key: PropTypes.string,
  subject: PropTypes.string,
  status: PropTypes.string
}
