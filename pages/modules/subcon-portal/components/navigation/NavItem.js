import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Renew16 } from '@carbon/icons-react'
import { CloseButton } from './CloseButton'

export const NavItem = ({
  item,
  selectedItem,
  handleClose,
  handleSelect,
  showSummary,
  handleSummaryRefresh
}) => {
  const className = cx({
    'pel--sr-tabs-item': true,
    'pel--sr-tabs-item--active':
      (item?.assignmentid === selectedItem?.assignmentid && !showSummary) ||
      (item?.assignmentid === 'summary' && showSummary)
  })

  const handleClick = item => e => {
    e.preventDefault()

    return handleSelect(item)
  }

  return (
    <li className={className} key={item.assignmentid}>
      {item?.assignmentid === 'summary' ? (
        <>
          <a href="#" className="pel--sr-tabs-link" onClick={handleClick(item)}>
            Summary
          </a>
          <button type="button" className="pel--button" onClick={() => handleSummaryRefresh(true)}>
            <Renew16 aria-label="Refresh" className="pel--icon pel--icon--white" />
          </button>
        </>
      ) : (
        <>
          <a href="#" className="pel--sr-tabs-link" onClick={handleClick(item)}>
            {item.workorder?.wonum} - {item.assignmentid}
          </a>
          <CloseButton onClick={() => handleClose(item)} />
        </>
      )}
    </li>
  )
}

NavItem.propTypes = {
  item: PropTypes.shape({
    assignmentid: PropTypes.number,
    workorder: PropTypes.shape({
      wonum: PropTypes.string
    }),
    key: PropTypes.string
  }).isRequired,
  selectedItem: PropTypes.number,
  handleClose: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  showSummary: PropTypes.bool.isRequired,
  handleSummaryRefresh: PropTypes.func
}
