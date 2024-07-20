import React from 'react'
import PropTypes from 'prop-types'

export const Nav = ({
  renderItem,
  selectedKpiNames,
  selectedKpiName,
  onKpiSelected,
  onKpiRemoved,
  children
}) => {
  return (
    <ul className="pel--sr-tabs">
      {selectedKpiNames.map((data, index) =>
        renderItem({
          kpiName: data.kpiName,
          label: data.label,
          selectedKpiName,
          onKpiSelected,
          onKpiRemoved,
          key: `kpi-tab-${index}`
        })
      )}
      {children}
    </ul>
  )
}

Nav.defaultProps = {
  selectedKpiName: null
}

Nav.propTypes = {
  renderItem: PropTypes.func.isRequired,
  selectedKpiNames: PropTypes.arrayOf(PropTypes.object),
  selectedKpiName: PropTypes.string,
  onKpiSelected: PropTypes.func.isRequired,
  onKpiRemoved: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}
