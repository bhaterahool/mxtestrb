export const createEnum = array => {
  return Object.freeze(
    array.reduce((obj, item) => {
      if (typeof item === 'string') {
        obj[item.toUpperCase()] = item 
      }
      return obj
    }, {})
  )
}
