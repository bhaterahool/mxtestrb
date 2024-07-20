import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import { useMaxProp } from '../../../../shared/hooks/useMaxProp'

export const WorkorderDateIcon = ({ workorder, restrictToAttribute }) => {
  const indicatorDaysMaxProp = useMaxProp('pel.mxplus.subcon.indicatordays')

  let dateProp

  if (workorder.actfinish) {
    dateProp = 'actfinish'
  } else if (workorder.actstart && workorder.schedfinish) {
    dateProp = 'schedfinish'
  } else {
    dateProp = workorder.schedstart ? 'schedstart' : 'targstartdate'
  }

  if (restrictToAttribute && restrictToAttribute !== dateProp) {
    return null
  }

  if (workorder.actfinish) {
    return <div className="wo-dot dot-grey input-icon-position" />
  }

  if (dateProp && indicatorDaysMaxProp?.maxpropvalue?.propvalue) {
    const date = workorder[dateProp]
    const workDate = moment(date)
    const now = moment()

    if (workDate < now) {
      return <div className="wo-dot dot-red input-icon-position" />
    }

    const days = workDate.diff(now, 'days')
    if (days >= indicatorDaysMaxProp.maxpropvalue.propvalue) {
      return <div className="wo-dot dot-green input-icon-position" />
    }

    return <div className="wo-dot dot-yellow input-icon-position" />
  }
  return null
}

WorkorderDateIcon.defaultProps = {}

WorkorderDateIcon.propTypes = {
  workorder: PropTypes.shape({
    schedfinish: PropTypes.string,
    schedstart: PropTypes.string,
    targstartdate: PropTypes.string,
    actstart: PropTypes.string,
    actfinish: PropTypes.string
  }),
  restrictToAttribute: PropTypes.string
}
