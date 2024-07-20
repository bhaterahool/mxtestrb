export const valueSetters = {
  BOOLEAN: ({ data, colDef: { field }, newValue }) => {
        data[field] = Boolean(newValue)
    return true
  }
}
