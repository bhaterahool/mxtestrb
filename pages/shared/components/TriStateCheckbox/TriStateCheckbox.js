import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Checkmark16, Close16 } from '@carbon/icons-react'
import './TriStateCheckbox.scss'

const TriStateCheckbox = ({
  label,
  checked = false,
  indeterminate = false,
  checkedTitle = 'Checked',
  indeterminateTitle = 'Indeterminate',
  defaultTitle = 'Unchecked'
}) => {
  const [title, setTitle] = useState(defaultTitle)
  const ascertainIcon = (checked && Checkmark16) || (indeterminate && Close16) || null
  const [CurrentIcon, setCurrentIcon] = useState(ascertainIcon)
  useEffect(() => {
    setCurrentIcon(ascertainIcon)
    if (checked) {
      setTitle(checkedTitle)
    } else if (indeterminate) {
      setTitle(indeterminateTitle)
    } else {
      setTitle(defaultTitle)
    }
  }, [checked, indeterminate])

  return (
    <div className="tristate-checkbox tristate-checkbox--wrapper">
      <div className="tristate-checkbox--icon" title={title}>
        {CurrentIcon && <CurrentIcon />}
      </div>
      <span>{label}</span>
    </div>
  )
}

TriStateCheckbox.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  label: PropTypes.string.isRequired,
  checkedTitle: PropTypes.string,
  indeterminateTitle: PropTypes.string,
  defaultTitle: PropTypes.string
}


export default memo(TriStateCheckbox)
