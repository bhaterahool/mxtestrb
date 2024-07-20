export const DEV = process.env.NODE_ENV === 'development'







export const EXCLUDE_SUBCON_BULLETIN_INTERVAL = false
export const EXCLUDE_SUBCON_API_DEPS = false
export const EXCLUDE_CUSTOMER_PORTAL_API_DEPS = false
export const EXCLUDE_CONTACT_CENTER_API_DEPS = false
export const EXCLUDE_WOPRICE_API_DEPS = false
export const EXCLUDE_SUBAFP_API_DEPS = false

const config = {
  isDevToolsEnabled: window.location.host.includes('localhost')
}

export const log = (...args) => {
  if (!config.isDevToolsEnabled) return

    console.info(...args)
}

log.dur = (desc, start) => {
  if (!config.isDevToolsEnabled) return

  const dur = `${new Date() - start}`
  const len = desc.length + dur.length

  if (!log.dur.maxlen || log.dur.maxlen < len) log.dur.maxlen = len

  console.info(
    `${desc}${' '.repeat(log.dur.maxlen - len)} %c${dur} %cms`,
    'color: #9980ff',
    'color: currentcolor'
  )
}
