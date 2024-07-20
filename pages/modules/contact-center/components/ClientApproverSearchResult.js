import React from 'react'
import PropTypes from 'prop-types'

export const ClientApproverSearchResult = ({ clientapprover }) => {
  return (
    <div>
      <h4>{clientapprover?.mitcaperson}</h4>
      {clientapprover?.mitdisplayname && <p>{clientapprover?.mitdisplayname}</p>}
      {clientapprover?.mitemail && <p>{clientapprover?.mitemail}</p>}
    </div>
  )
}

ClientApproverSearchResult.propTypes = {
  clientapprover: PropTypes.shape({
    mitcaperson: PropTypes.string,
    mitdisplayname: PropTypes.string,
    mitemail: PropTypes.string
  })
}







