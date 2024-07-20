import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'carbon-components-react'
import { FormError } from './LoginError'


import logo from '../../../img/mitie-logo.svg'

export const MaximoLoginForm = ({ openMaximo, loading, formError }) => {
  const version = process.env.BuildNumber ?? 'Dev'

  return (
    <>
      <img src={logo} className="logo" alt="Mitie Logo" />
      <FormError message={formError} />
      <div className="pel--logo-text">Mx+ by Peacock Engineering</div>
      <div className="pel--maximo-login">
        <Button type="submit" onClick={openMaximo} disabled={loading}>
          {loading ? 'Loading ...' : 'Log in'}
        </Button>
      </div>
      <span className="app-version">v{version}</span>
    </>
  )
}

MaximoLoginForm.propTypes = {
  openMaximo: PropTypes.func,
  loading: PropTypes.bool,
  formError: PropTypes.string
}
