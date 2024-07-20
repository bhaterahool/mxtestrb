import { useState } from 'react'
import _ from 'lodash'

export const useControls = initialControls => {
  const [controls, setControls] = useState(initialControls)

    const toggleControl = (name, props) =>
    setControls(current => ({
      ...current,
      [name]: {
        active: !controls[name].active,
        props
      }
    }))

    const getControlProps = name => _.get(controls[name], 'props')

  return [toggleControl, getControlProps, controls]
}
