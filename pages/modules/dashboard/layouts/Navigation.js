import React from 'react'
import _ from 'lodash'
import { Nav, NavItem } from '../components/nav'
import { selectKpi, removeKpi, useKPIProvider } from '../KPIProvider'

export const Navigation = () => {
  const { openKPIs, selectedKpiName, kpiDispatcher } = useKPIProvider()

  const onKPISelected = kpiname => kpiDispatcher(selectKpi(kpiname))

  const onKpiRemoved = kpiname => {
    
    kpiDispatcher(removeKpi(kpiname))
  }

  const selectedKpiNames = Array.from(openKPIs.values())

  return (
    <Nav
      selectedKpiNames={selectedKpiNames}
      selectedKpiName={selectedKpiName}
      renderItem={NavItem}
      onKpiSelected={onKPISelected}
      onKpiRemoved={onKpiRemoved}
    />
  )
}
