import React from 'react'
import { Loading } from '../../../shared-components/Loading'

export const KPILoading = () => {
  return (
    <div className="pel--summary-card">
      <div className="card card-1 card-loading">
        <div className="kpi kpi-loading bx--card-header card-loading">
          <h4>Loading</h4>
        </div>
        <div className="bx--card__card-overview">
          <div className="content top-content">
            <p>
              <Loading />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
