import _ from 'lodash'

export const namespace = (name, obj, whitelistedProps) =>
  _.mapKeys(obj, (val, key) =>
    !whitelistedProps || whitelistedProps.includes(key) ? `${name}.${key}` : key
  )
