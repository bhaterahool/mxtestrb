import React from 'react'
import PropTypes from 'prop-types'
import { ClickableTile } from 'carbon-components-react'
import Moment from 'react-moment'
import { WorkorderDateIcon } from '../../components/form/WorkorderDateIcon'

export const WorkAssignmentSearchResultItem = ({
  assignmentid,
  status,
  status_description,
  description,
  workorder,
  onClick,
  key
}) => {
  return (
    workorder && (
      <ClickableTile
        handleClick={onClick}
        className="pel--search-result card card-1"
        href="#"
        key={key}
      >
        <div>
          <div className="indicator-wrapper">
            <WorkorderDateIcon workorder={workorder[0]} />
          </div>
          <h4>
            <span>
              {assignmentid} - {status_description}
            </span>
          </h4>
          <h5>
            <span>
              {workorder[0].wonum} - {workorder[0].status_description}
            </span>
          </h5>
          <div className="pel--search-meta">
            <p className="bx--tile-text__small">
              Type: <span>{workorder?.[0].worktype}</span>
            </p>
          </div>
          {workorder[0]?.targstartdate && (
            <div className="pel--search-meta">
              <p className="bx--tile-text__small">
                Target Start Date:{' '}
                <span>
                  <Moment format="DD-MMM-YYYY HH:mm">{workorder[0]?.targstartdate}</Moment>
                </span>
              </p>
            </div>
          )}
          <div>
            {workorder?.[0]?.locations?.[0]?.description && (
              <p className="bx--tile-text__small">
                Location: <span>{workorder?.[0]?.locations?.[0]?.description}</span>
              </p>
            )}
            <p className="bx--tile-text__small">{workorder?.[0]?.description}</p>
          </div>
        </div>
      </ClickableTile>
    )
  )
}

WorkAssignmentSearchResultItem.propTypes = {
  assignmentid: PropTypes.string,
  status: PropTypes.string,
  status_description: PropTypes.string,
  description: PropTypes.string,
  workorder: PropTypes.shape({
    location: PropTypes.shape({
      description: PropTypes.string
    }),
    worktype: PropTypes.string,
    wonum: PropTypes.string,
    status_description: PropTypes.string
  }),
  onClick: PropTypes.func.isRequired,
  key: PropTypes.string
}
