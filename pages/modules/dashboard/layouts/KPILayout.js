import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Navigation } from './Navigation'
import { useKPIProvider, replaceKpi, selectKpi } from '../KPIProvider'
import { useSession } from '../../auth/SessionProvider'
import { Summary } from '../components/kpis'
import { Grid } from '../components/grid'
import './KPILayout.scss'

export const KPILayout = ({ isOpen }) => {
  const { selectedKpiName, openKPIs } = useKPIProvider()

  const showSummary = selectedKpiName === 'summary'

  const kpi = openKPIs?.get(selectedKpiName)

  return (
    <>
      <div className="pel--nav-bar pel-summary--nav-bar">
        <Navigation />
      </div>
      {showSummary ? <Summary /> : <Grid {...kpi} />}
    </>
  )
}

KPILayout.propTypes = {
  isOpen: PropTypes.bool
}
