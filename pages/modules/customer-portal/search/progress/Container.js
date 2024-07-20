import PropTypes from 'prop-types'
import * as React from 'react'

export const Container = ({ children, isFinished, animationDuration }) => (
  <div
    style={{
      width: '100%',
      opacity: isFinished ? 0 : 1,
      pointerEvents: 'none',
      transition: `opacity ${animationDuration}ms linear`,
      height: '4px',
      bottom: 0,
      position: 'absolute'
    }}
  >
    {children}
  </div>
)

Container.propTypes = {
  animationDuration: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  isFinished: PropTypes.bool.isRequired
}
