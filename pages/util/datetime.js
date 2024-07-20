const JUST_NOW = 'just now'
export const INTERVAL_TIMEAGO_1_MINUTE = 60000
export const INTERVAL_TIMEAGO_5_MINUTES = INTERVAL_TIMEAGO_1_MINUTE * 5

export const createTimeStamp = () => new Date().getTime()

const noDecimal = num => Math.floor(num)

const getPlural = count => (count > 1 ? 's' : '')

export const getTimeAgo = time => {
  if (!time) {
    return JUST_NOW
  }
  const now = createTimeStamp()
  const secs = noDecimal((now - time) / 1000)
  const pluralSecs = getPlural(secs)
  if (secs < 1) {
    return JUST_NOW
  }
  if (secs < 60) {
    return `${secs} second${pluralSecs} ago`
  }

  const mins = noDecimal(secs / 60)
  const pluralMins = getPlural(mins)
  if (mins < 60) {
    return `${mins} minute${pluralMins} ago`
  }

  const hrs = noDecimal(mins / 60)
  const pluralHrs = getPlural(hrs)
  if (hrs < 24) {
    return `${hrs} hour${pluralHrs} ago`
  }

  const days = noDecimal(hrs / 24)
  const pluralDays = getPlural(days)
  if (days < 7) {
    return `${days} day${pluralDays} ago`
  }

  const weeks = noDecimal(days / 7)
  const pluralWeeks = getPlural(weeks)
  if (weeks < 5) {
    return `${weeks} week${pluralWeeks} ago`
  }

  const months = noDecimal(days / 30)
  const pluralMonths = getPlural(months)
  if (months < 12) {
    return `${months} month${pluralMonths} ago`
  }

  const years = noDecimal(days / 365)
  const pluralYears = getPlural(years)
  return `${years} year${pluralYears} ago`
}
