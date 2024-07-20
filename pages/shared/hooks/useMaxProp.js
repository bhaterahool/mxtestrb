import { useState, useEffect } from 'react'
import { useRegistry } from '../RegistryProvider'

export const useMaxProp = propName => {
  const [registry] = useRegistry()

  const findProp = propName => registry?.maxProps?.find(prop => prop.propname === propName)

  const [prop, setProp] = useState(() => findProp(propName))

  useEffect(() => {
    setProp(findProp(propName))
  }, [propName, registry?.maxProps])

  return prop
}
