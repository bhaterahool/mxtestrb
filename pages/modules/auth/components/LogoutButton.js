import React from 'react'
import PropTypes from 'prop-types'
import { HeaderGlobalAction } from 'carbon-components-react'
import Logout20 from '@carbon/icons-react/lib/logout/20'


export const LogoutButton = ({
  onClick
}) => {
  return (
    <HeaderGlobalAction onClick={onClick} aria-label="logout">
      <Logout20 />
    </HeaderGlobalAction>
  )
}

LogoutButton.propTypes = {
  onClick: PropTypes.func.isRequired
}