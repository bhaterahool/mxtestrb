import { colDefs } from '../DataGrid/Columns/colDefs'

export const LABEL_CUSTOMER_ID = 'Customer Id (Do not change)'

const mapFieldToHeaderName = lookupField => {
  return colDefs.find(({ field }) => field === lookupField) || {}
}

const keysToOmit = ['committed', 'error', 'unhiddenColumn']

const omitKey = key => keysToOmit.includes(key)

export const transformDataForExcel = data =>
  data.reduce((acc, item) => {
    const objOrder = {
      wonum: null,
      siteid: null,
      worktype: null,
      commoditygroup: null,
      commodity: null,
      description: null,
      pluspcustomer: null,
      status: null,
      linedescription: null,
      linecost: null
    }
    const consolidatedObj = Object.assign(objOrder, item)
    const obj = {}
    Object.entries(consolidatedObj).forEach(([key, value]) => {
      if (omitKey(key)) return
      const { headerName } = mapFieldToHeaderName(key)
      if (headerName) {
        obj[headerName] = value
      }
    })

    
    

    acc.push(obj)
    return acc
  }, [])
