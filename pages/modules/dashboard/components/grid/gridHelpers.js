import { isArray } from "lodash"

export const getColDef = (key, val, colDefs) => {
  if (typeof val === 'object' && val !== null && !isArray(val)) {
    Object.entries(val).forEach(([childKey, childVal]) => {
      getColDef(`${key}.${childKey}`, childVal, colDefs)
    })
  } else {
    if(!isArray(val)){
      colDefs.push({ field: key })
    }
  }
}
