import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { animated } from 'react-spring'
import { ToastNotification } from 'carbon-components-react'

export const Toast = ({ id, style, autohide, timeout, ...props }) => {
  return (
    <animated.div style={style} className="pel--toast">
      <ToastNotification style={{ minWidth: '30rem', marginBottom: '.5rem' }} {...props} />
    </animated.div>
  )
}

Toast.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  id: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
  autohide: PropTypes.bool,
  timeout: PropTypes.number
}
