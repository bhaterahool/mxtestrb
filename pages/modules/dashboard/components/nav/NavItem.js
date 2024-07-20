import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { CloseButton } from './CloseButton'

export const NavItem = ({ kpiName, label, selectedKpiName, onKpiSelected, onKpiRemoved, key }) => {
  const onClick = e => {
    e.preventDefault()

    return onKpiSelected(kpiName)
  }

  const onClose = e => {
    e.preventDefault()
    return onKpiRemoved(kpiName)
  }

  const className = classnames({
    'pel--sr-tabs-item': true,
    'pel--sr-tabs-item--active': kpiName === selectedKpiName
  })

  return (
    <li className={className} key={key}>
      <a href="#" onClick={onClick} className="pel--sr-tabs-link">
        {label}
      </a>
      {kpiName !== 'summary' && <CloseButton onClick={onClose} />}
    </li>
  )
}

NavItem.propTypes = {
  key: PropTypes.string.isRequired,
  kpiName: PropTypes.string.isRequired,
  selectedKpiName: PropTypes.string.isRequired,
  onKpiSelected: PropTypes.func.isRequired,
  onKpiRemoved: PropTypes.func.isRequired,
  label: PropTypes.string
}
