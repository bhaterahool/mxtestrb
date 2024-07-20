const getRelativePath = (url, separator = '/maximo/oslc/') => {
  if (typeof url !== 'string') {
    return new Error(`Url of type "${typeof url}" supplied to getRelativePath expected string.`)
  }
  if (typeof separator !== 'string') {
    return new Error(
      `Separator of type "${typeof separator}" supplied to getRelativePath expected string.`
    )
  }
  if (!url.includes(separator)) {
    return new Error(`Supplied url "${url}" does not contain separator "${separator}"`)
  }

  const [, right] = url.split(separator)

  if (!right) {
    return new Error(`Nothing exists in url "${url}" after "${separator}"`)
  }

  return right
}


export default getRelativePath
