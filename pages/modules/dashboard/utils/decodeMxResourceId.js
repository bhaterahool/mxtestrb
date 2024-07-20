export const decodeMxResourceId = mxResourceId => {
  let res = mxResourceId

  res = res.slice(1)
  res = res.replace(/-/g, '=')
  res = res.replace(/_/g, '+')
  res = res.replace(/~/g, '/')
  res = atob(res)

  return res
}
