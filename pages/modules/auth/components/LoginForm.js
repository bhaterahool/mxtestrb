import React from 'react'
import PropTypes from 'prop-types'
import { Form, TextInput, Button } from 'carbon-components-react'
import { FormError } from './LoginError'



import logo from '../../../img/mitie-logo.svg'

export const LoginForm = ({
  formError,
  onSubmit,
  onChange,
  username,
  password,
  loading,
  errors
}) => {
  const version = process.env.BuildNumber ?? 'Dev'

  return (
    <Form onSubmit={onSubmit}>
      <img src={logo} className="logo" alt="Mitie Logo" />
      <h3 className="bx--form-heading">Log in</h3>
      <FormError message={formError} />
      <TextInput
        id="username"
        name="username"
        labelText="Username"
        onChange={onChange}
        value={username}
        invalid={!username}
        invalidText="Please enter a username"
      />
      <TextInput
        id="password"
        name="password"
        type="password"
        labelText="Password"
        onChange={onChange}
        value={password}
        invalid={!password}
        invalidText="Please enter a password"
      />
      <Button type="submit" disabled={!username || !password || loading}>
        {loading ? 'Loading ...' : 'Log in'}
      </Button>
      <span className="app-version">v{version}</span>
    </Form>
  )
}

LoginForm.propTypes = {
  formError: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  username: PropTypes.string,
  password: PropTypes.string,
  loading: PropTypes.bool,
  errors: PropTypes.shape({
    username: PropTypes.bool,
    password: PropTypes.bool
  })
}
