export const removeEmptyRows = data =>
  Array.isArray(data) &&
  data.filter(row => !Object.values(row)?.every(item => !String(item)?.trim()))

const checkContinuousEmptyRow = (data, fromIndex) => {
  let rowHasData = false

    for (let index = fromIndex; index < data?.length; index++) {
    let row = data[index]
    let isEmptyRow = Array.isArray(row) && row.every(item => !String(item)?.trim())

    if (!isEmptyRow) {
      rowHasData = true
      break
    }
  }

  return rowHasData
}

export const hasEmptyRow = data => {
  let isEmptyRowFound = false
  if (data && data?.length && Array.isArray(data)) {
    let dataCount = data.length

        for (let index = 0; index < dataCount; index++) {
      let row = data[index]
      let isEmptyRow = Array.isArray(row) && row.every(item => !String(item)?.trim())

      if (isEmptyRow) {
        if (checkContinuousEmptyRow(data, index)) {
          isEmptyRowFound = true
          break
        }
      }
    }
  } else {
    isEmptyRowFound = true
  }

  return isEmptyRowFound
}
