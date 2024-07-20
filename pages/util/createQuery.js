import _ from 'lodash'

export const getProcessedQuery = data => {
  const searchObject = _.pickBy(data)
  const queryString = Object.entries(searchObject)
    .map(([field, value]) => {
      return `${field}=${`"${value}"`}`
    })
    .join(' and ')
  return queryString
}
