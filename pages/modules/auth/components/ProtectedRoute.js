import React from 'react'
import PropTypes from 'prop-types'
import { Redirect, Route } from 'react-router-dom'
import { useSession } from '../SessionProvider'

export const ProtectedRoute = ({ children, ...props }) => {
  const [session] = useSession()

  return (
    <Route
      {...props}
      render={({ location }) =>
        session.sessionId ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location }
            }}
          />
        )
      }
    />
  )
}

ProtectedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}
