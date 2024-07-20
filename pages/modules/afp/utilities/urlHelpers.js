export const encodeId = id => {
  if (Number(id)) {
    return `_${btoa(id).replaceAll('=', '-')}`
  }
  throw new Error(`encodeId - expected number received ${typeof id} ${id}`)
}

export const unencodeId = (encodedId, type = 'number') => {
  if (typeof encodedId === 'string') {
    const decoded = atob(encodedId.replace('_', '').replaceAll('-', '='))
    if (type === 'number') {
      return Number(decoded)
    }
    return decoded
  }
  throw new Error(`unencodeId - expected string received ${typeof encodedId} ${encodedId}`)
}

export const trimHref = href => href.split('oslc')[1]
