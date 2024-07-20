import React from 'react'
import PropTypes from 'prop-types'


import MitieLoading from '../../img/mitie-loading.svg'

export const Loading = ({ modal = false }) => {
  return (
    <div className={modal ? 'pel--loading bx--modal bx--modal-tall is-visible' : 'pel--loading'}>
      <object type="image/svg+xml" className="loading" data={MitieLoading}>
        Loading
      </object>
    </div>
  )
}

export const LoadingIcon = () => (
  <object type="image/svg+xml" className="loading" data={MitieLoading}>
    Loading
  </object>
)

Loading.propTypes = {
  modal: PropTypes.bool
}
