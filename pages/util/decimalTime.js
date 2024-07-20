import moment from 'moment'

export const decimalTime = data => {
  return moment.utc(moment.duration(data, 'hours').asMilliseconds()).format('HH:mm')
}
