import React from 'react'
import PropTypes from 'prop-types'

export const CustomerSearchResult = ({ customer, pelKnownAsCust }) => (
  <>
    {pelKnownAsCust ? (
      <div>
        <h4>{`${customer.pelknownascust}`}</h4>
      </div>
    ) : (
      <div>
        <h4>{`${customer.name} - ${customer.customer}`}</h4>
      </div>
    )}
  </>
)







