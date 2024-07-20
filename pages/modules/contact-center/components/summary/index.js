import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { api } from '../../../app/api'
import { KPI } from './kpi'
import { Loading } from '../../../shared-components/Loading'
import './summary.scss'
import { useServiceRequestSearchProvider } from '../../search/SearchProvider'
import { useToast } from '../../../../shared/toasts/ToastProvider'

export const Summary = ({ refreshSummary, handleSummaryRefresh }) => {
  const [kpis, setKpis] = useState([])
  const { addPersistentErrorToast } = useToast()

  const { setSearchParams } = useServiceRequestSearchProvider()

  const getAllKPIS = async () => {
    const res = await api.get(`/pelos/mxapikpimain?savedQuery=PELCC`).catch(e => {
      addPersistentErrorToast({
        title: 'Error reading KPI',
        subtitle: e?.message ?? 'There was an error loading KPI data from Maximo, please try again'
      })
    })

    setKpis(res?.data?.member)
  }

  const onClickSummary = kpiname => e => {
    e.preventDefault()
    const queryParams = {
      savedQuery: `SR:${kpiname}`
    }

    setSearchParams(params => ({ ...params, queryParams, skipSaveHistory: true }))
  }

  useEffect(() => {
    getAllKPIS()
  }, [])

  useEffect(() => {
    if (refreshSummary) {
      setKpis([])
      getAllKPIS()
      handleSummaryRefresh(false)
    }
  }, [refreshSummary])

  return (
    <>
      {refreshSummary && <Loading modal />}
      <main className="pel--main pel--summary">
        <div className="pel--summary--scroll--view">
          <div className="bx--row">
            {kpis?.map(kpi => {
              return <KPI kpiData={kpi} onClickSummary={onClickSummary} key={kpi.href} />
            })}
          </div>
        </div>
      </main>
    </>
  )
}

Summary.propTypes = {
  refreshSummary: PropTypes.bool,
  handleSummaryRefresh: PropTypes.func
}
