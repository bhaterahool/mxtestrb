import React, { useState } from 'react'

import { Button } from 'carbon-components-react'
import PropTypes from 'prop-types'
import { PelTextArea, PelTextInput } from '../../../../shared/forms'
import { MapLocationButton } from './MapLocationButton'

export const AddressInput = ({ loading, woserviceaddress }) => {
  const [isAdressOpen, setAdressIsOpen] = useState(true)

  const getFormatedAddress = address => {
    return address ? address.split(',').join(', \n') : ''
  }

  return (
    <>
      {!!woserviceaddress?.pelviaaddress && (
        <>
          <Button
            className={`pel--pill-button address-btn ${isAdressOpen ? 'active' : ''}`}
            onClick={() => setAdressIsOpen(true)}
            type="button"
          >
            Address
          </Button>
          <Button
            className={`pel--pill-button en-route-btn ${isAdressOpen ? '' : 'active'}`}
            onClick={() => setAdressIsOpen(false)}
            type="button"
          >
            En-route Address
          </Button>
        </>
      )}
      <PelTextArea
        labelText={woserviceaddress?.pelviaaddress ? '' : 'Address'}
        readOnly
        showSkeleton={loading}
        className="pel-address-input"
        value={
          isAdressOpen
            ? getFormatedAddress(woserviceaddress?.formattedaddress)
            : getFormatedAddress(woserviceaddress?.pelviaaddress?.[0]?.formattedaddress)
        }
        buttons={woserviceaddress && <MapLocationButton woserviceaddress={woserviceaddress} />}
      />
      {!!woserviceaddress?.pelviatype_description && (
        <PelTextInput
          id="pelviatype_description"
          name="pelviatype_description"
          labelText="En-route Type"
          readOnly
          showSkeleton={loading}
          defaultValue={woserviceaddress?.pelviatype_description}
        />
      )}
      {!!woserviceaddress?.pelviadesc && (
        <PelTextInput
          id="pelviadesc"
          name="pelviadesc"
          labelText="En-route Description"
          readOnly
          showSkeleton={loading}
          defaultValue={woserviceaddress?.pelviadesc}
        />
      )}
    </>
  )
}

AddressInput.propTypes = {
  loading: PropTypes.bool,
  woserviceaddress: PropTypes.shape({
    pelviaaddress: PropTypes.shape({
      formattedaddress: PropTypes.string
    }),
    formattedaddress: PropTypes.string,
    pelviatype_description: PropTypes.string,
    pelviadesc: PropTypes.string
  })
}
