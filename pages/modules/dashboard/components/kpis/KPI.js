import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ClickableTile } from 'carbon-components-react'
import CountUp from 'react-countup'
import classNames from 'classnames'
import { api } from '../../../app/api'
import { namespace } from '../../../../util/namespace'
import { trimHref } from '../../../afp/utilities/urlHelpers'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { KPILoading } from './KPILoading'

export const KPI = ({ kpiData, kpiName, templateName, osName, onClickSummary }) => {
  const [kpi, setKpi] = useState(null)

  const { addPersistentErrorToast } = useToast()

  useEffect(async () => {
    if (kpiData?.href) {
      const res = await api
        .get(trimHref(kpiData?.href), {
          ...namespace('oslc', {
            select:
              'kpiname,kpivalue,lastkpivalue,description,cautionmin,cautionmax,format,description_longdescription'
          })
        })
        .catch(e => {
          addPersistentErrorToast({
            title: 'Error loading KPI',
            subtitle:
              e?.message ?? 'There was an error loading KPI data from Maximo, please try again'
          })
        })

      setKpi(res?.data)
    }
  }, [kpiData])

  if (!kpi) return <KPILoading />

  const isKpiClickable = kpi.clause.toLowerCase().includes('drillable') && kpi.ispublic

  const kpiClass = classNames({
    kpi: true,
    'caution-min': kpi.kpivalue >= kpi.cautionmin && kpi.kpivalue < kpi.cautionmax,
    'caution-max': kpi.kpivalue >= kpi.cautionmax
  })

  const KPI = (
    <>
      <div className={`${kpiClass} bx--card-header`}>
        <h4>{kpi.description}</h4>
      </div>
      <div className="bx--card__card-overview">
        <div className="content top-content">
          <p>
            <CountUp
              separator=","
              end={kpi.kpivalue}
              decimals={kpi.format === 'PERCENT' ? '2' : '0'}
              duration="1"
              className={kpiClass}
              suffix={kpi.format === 'PERCENT' ? '%' : ''}
            />
          </p>
        </div>
      </div>
    </>
  )

  return (
    <div className="pel--summary-card" key={`skel-${kpi.kpiname}`}>
      {isKpiClickable ? (
        <ClickableTile
          className="card card-1 clickable-kpi"
          href="#"
          key={`pel-summary-${kpi.kpiname}`}
          handleClick={onClickSummary(kpiName, templateName, osName)}
        >
          {KPI}
        </ClickableTile>
      ) : (
        <div className="card card-1">{KPI}</div>
      )}
    </div>
  )
}

KPI.propTypes = {
  kpiData: PropTypes.shape({
    href: PropTypes.string,
    kpiname: PropTypes.string,
    kpivalue: PropTypes.string,
    lastkpivalue: PropTypes.string,
    description: PropTypes.string,
    cautionmin: PropTypes.string,
    cautionmax: PropTypes.string,
    format: PropTypes.string,
    description_longdescription: PropTypes.string
  }),
  onClickSummary: PropTypes.func,
  kpiName: PropTypes.string,
  templateName: PropTypes.string,
  osName: PropTypes.string
}
