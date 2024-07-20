import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { api } from '../../../app/api'
import { KPI } from './KPI'
import './summary.scss'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { selectKpi, useKPIProvider } from '../../KPIProvider'

export const Summary = () => {
  const { addPersistentErrorToast } = useToast()
  const { kpiGroups, setKpiGroups, kpiDispatcher } = useKPIProvider()

  useEffect(getDashboardDomains, [])

  const onClickSummary = (kpiName, templateName, osName) => e => {
    e.preventDefault()

    kpiDispatcher(selectKpi(kpiName, templateName, osName))
  }

  return (
    <>
      <main className="pel--main pel--summary pel--kpi">
        <div className="pel--summary--scroll--view">
          {!!kpiGroups &&
            Object.entries(kpiGroups).map(([groupName, group]) => {
              return (
                <div className="group-wrap card-1" key={groupName}>
                  <div className="group-header">
                    <h3>{groupName}</h3>
                  </div>
                  <div className="group">
                    {group?.map(({ osName, kpiName, templateName, kpi }) => {
                      return (
                        <KPI
                          kpiData={kpi}
                          kpiName={kpiName}
                          templateName={templateName}
                          osName={osName}
                          onClickSummary={onClickSummary}
                          key={kpi.href}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      </main>
    </>
  )

  async function getDashboardDomains() {
    
    const dashboardDomainRes = await api
      .get(`/pelos/PELDOMAIN?oslc.select=alndomain{*}&oslc.where=domainid="PELMXPDASH"`)
      .catch(e => {
        console.error(e)
        addPersistentErrorToast({
          title: `Error Loading Dashboard`,
          subtitle: 'Please ensure the PELMXPDASH domain is populated in Maximo'
        })
      })

    const { alndomain } = dashboardDomainRes?.data?.member?.[0] ?? {}

    if (!alndomain) return

    alndomain.forEach(async ({ value: kpiDomain, description: groupName }) => {
      const kpiDomainRes = await api
        .get(`/pelos/PELDOMAIN?oslc.select=synonymdomain{*}&oslc.where=domainid="${kpiDomain}"`)
        .catch(e => {
          console.error(e)
          addPersistentErrorToast({
            title: `Error Loading Group`,
            subtitle: `Unable to load ${groupName ?? ''} KPIs`
          })
        })

      const kpiDomains =
        kpiDomainRes?.data?.member?.[0]?.synonymdomain?.map(
          ({ maxvalue: osName, value: kpiName, description: templateName }) => ({
            osName,
            kpiName,
            templateName
          })
        ) ?? []

      const openKPIs = kpiDomains?.map(kpi => kpi.kpiName) ?? []

      
      const kpiStr = `"${openKPIs.join('","')}"`

      const kpiDataRes = await api
        .get(`/os/mxapikpimain?oslc.select=*&oslc.where=kpiname in [${kpiStr}]`)
        .catch(e => {
          console.error(e)
          addPersistentErrorToast({
            title: `Error Loading KPIs`,
            subtitle: `Unable to load ${kpiStr ?? ''} KPIs`
          })
        })

      const kpiData = kpiDataRes?.data?.member ?? []

      if (kpiDomains.length > 0) {
        
        setKpiGroups(current => ({
          ...current,
          [groupName]: kpiDomains.map(({ osName, kpiName, templateName }) => ({
            osName,
            kpiName,
            templateName,
            kpi: kpiData.find(kpi => kpi.kpiname === kpiName)
          }))
        }))
      }
    })
  }
}
