const getNiceToIsoFormat = dt => {
  
  
  
  
  const intD = dt.substring(0, 2)
  const intMon = dt.substring(3, 5)
  const intY = dt.substring(6, 10)

  const intH = dt.substring(11, 13)
  const intMin = dt.substring(14, 16)
  const intS = dt.substring(17, 19)

  const strTime = intH && intMin && intS ? `T${intH}:${intMin}:${intS}.000Z` : ''

  return `${intY}-${intMon}-${intD}${strTime}`
}
export const convertNiceToIso = value => {
  const valueAsIso = value.indexOf('-') !== 4 ? getNiceToIsoFormat(value) : value
  let dt = ''
  try {
    dt = new Date(valueAsIso).toISOString()
  } catch (err) {
    console.warn('Error - convertNiceToIso() - Provided invalid date format: ', value)
  }
  return dt
}
