const isObj = item => typeof item === 'object' && item !== null

const getCloneOrItem = item => (isObj(item) ? cloneObj(item) : item)

export const cloneArr = item =>
  item.map(inner =>
    inner instanceof Array ? cloneArr(inner) : (isObj(inner) && cloneObj(inner)) || inner
  )

export const cloneObj = obj =>
  Object.keys(obj).reduce((accum, cur) => {
    const item = obj[cur]
    return {
      ...accum,
      [cur]: item instanceof Array ? cloneArr(item) : getCloneOrItem(item)
    }
  }, {})
