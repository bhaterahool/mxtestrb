import reduce from 'lodash/reduce'
import get from 'lodash/get'
import moment from 'moment'

export const toShortDate = dateStr => (dateStr ? moment(dateStr).format('DD-MMM-YYYY HH:mm') : '')

export const getInputProps = (schema, data) => {
  const fields = reduce(
    schema.properties,
    (obj, property, key) => {
      return {
        ...obj,
        [key]: {
          labelText: property.title,
          id: key,
          name: key
        }
      }
    },
    {}
  )

  return (id, value, options) => {
    const attr = options?.attr || 'value'

    return {
      ...fields[id],
      [attr]: typeof value === 'function' ? value(data) : get(data, value)
    }
  }
}
