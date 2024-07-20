import React from 'react'
import PropTypes from 'prop-types'
import { LongDescriptionModal } from '../../../shared/forms/LongDescriptionModal'
import { WorkHistoryModal } from '../../../shared/forms/WorkHistoryModal'

export const WorkOrderDetails = ({ wo }) => {
  const formatCurrency = value => {
    if (!value) {
      return ''
    }

    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })

    return formatter.format(value)
  }

  return (
    <div className="card card-1">
      <div className="bx--grid">
        <div className="bx--row">
          <div className="bx--col-lg-12">
            <div className="bx--tile">
              <div className="bx--row">
                <div className="bx--col-lg-2">
                  <span className="bx--label">Work Type</span>
                  <p className="bx--tile-text">{wo.worktype}</p>
                </div>
                <div className="bx--col-lg-3">
                  <span className="bx--label">Status</span>
                  <div className="flex align-center">
                    <p className="bx--tile-text">{wo.status_description}</p>
                    <WorkHistoryModal
                      data={wo}
                      objectStructure="PELWO"
                      historyObjectName="wostatus"
                      query={
                        wo &&
                        `oslc.where=workorderid=${wo.workorderid}&oslc.select=wonum,description,siteid,wostatus{*},pelperson{displayname,primaryemail,primaryphone}`
                      }
                    />
                  </div>
                </div>
                <div className="bx--col-lg-2">
                  <span className="bx--label">Customer Mandate</span>
                  <p className="bx--tile-text">{formatCurrency(wo.pluspmaxprice)}</p>
                </div>
                <div className="bx--col-lg-2">
                  <span className="bx--label">Inclusive Amount</span>
                  <p className="bx--tile-text">{formatCurrency(wo.plusppricesched?.inctotal)}</p>
                </div>
                <div className="bx--col-lg-12">
                  <span className="bx--label">Description</span>
                  <div className="bx--tile-text flex align-center">
                    <p>{wo.description}</p>
                    {wo.longdescription && (
                      <LongDescriptionModal longdescription={wo.longdescription[0].ldtext} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

WorkOrderDetails.propTypes = {
  wo: PropTypes.shape({
    description: PropTypes.string,
    longdescription: PropTypes.array,
    status_description: PropTypes.string,
    wonum: PropTypes.string,
    worktype: PropTypes.string,
    workorderid: PropTypes.number
  })
}
