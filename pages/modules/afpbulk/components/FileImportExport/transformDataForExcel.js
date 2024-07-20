import { colDefsAssets, colDefsAssignments } from '../DataGrid/Columns/colDefs'

export const LABEL_STATUS_ID = 'Group Id (Do not change)'

const mapFieldToHeaderName = (lookupField, type) => {
  if (type === 'assets') {
    return colDefsAssets.find(({ field }) => field === lookupField) || {}
  }
  if (type === 'assignments') {
    return colDefsAssignments.find(({ field }) => field === lookupField) || {}
  }
  return {}
}

const keysToOmit = ['committed', 'error', 'unhiddenColumn']

const omitKey = key => keysToOmit.includes(key)

export const transformDataForExcel = (data, type) =>
  data.reduce((acc, item) => {
    const obj = {}
    Object.entries(item).forEach(([key, value]) => {
      if (omitKey(key)) return
      const { headerName } = mapFieldToHeaderName(key, type)
      if (headerName) {
        obj[headerName] = value
      }
    })

    
    obj[LABEL_STATUS_ID] = item.groupId

    acc.push(obj)
    return acc
  }, [])
