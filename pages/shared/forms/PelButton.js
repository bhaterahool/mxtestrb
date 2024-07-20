import React from 'react'
import PropTypes from 'prop-types'
import { ButtonSkeleton, Button } from 'carbon-components-react'

export const PelButton = ({ showSkeleton, ...props }) => {
  if (showSkeleton) return <ButtonSkeleton />
  return <Button {...props} />
}

PelButton.propTypes = {
  showSkeleton: PropTypes.bool
}
