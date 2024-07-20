import PropTypes from 'prop-types'
import * as React from 'react'

export const Bar = ({ progress, animationDuration }) => (
  <div
    style={{
      background: '#29d',
      height: 4,
      left: 0,
      marginLeft: `${(-1 + progress) * 100}%`,
      position: 'relative',
      top: 0,
      transition: `margin-left ${animationDuration}ms linear`,
      width: '100%',
      zIndex: 1031
    }}
  />
)

Bar.propTypes = {
  animationDuration: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired
}
