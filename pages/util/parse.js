import _ from 'lodash'

export default str => {
  const res = _.attempt(JSON.parse.bind(null, str))

  if (_.isError(res)) {
    throw new Error(`Could not parse json. Reason: ${res.message}`)
  }

  return res
}
