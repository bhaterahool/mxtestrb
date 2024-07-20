import { additionalFields, colDefs } from '../components/DataGrid/Columns/colDefs'
import { COMMIT_FAIL, COMMIT_SUCCESS } from '../../../shared/grid/constants'
import { createTimeStamp } from '../../../util/datetime'
import { excludeHasDataFromOptions } from '../../../shared/components/DropdownDataLoader'

export const initState = {
  manualBillFeeType: '', // 'MANAGEMENT'
  manualBillStatus: '', // Was for testing: INPRG . Now MANBILL
  customers: {
    /*
     [customerId]: {
      customerName: 'abc',
      tableData: [] {

        "href": "",
          -- Used as id - getRowNodeId: (data) => data.href

        "commodity": "",
        "_rowstamp": "",
        "commoditygroup": "",
        "description": "",
        "siteid": "",
        "worktype": "",
        "pluspgbtrans_collectionref": "",
        "href": "",
        "pluspcustomer": "", -- customerId
        "wonum": "",

        // additional
        "linedescription",
        "linecost",
        "committed",
        "error",
        locked
    */
  },
  gridOverwrite: null, 
  gridAddCustomer: null, 
  postRowUpdatesCustomers: [], 
  gridRowRemove: null, 
  isResetCustomerSelection: false,
  mainDropdownOptions: []
}
export const saveManualBillFeeType = ({ manualBillFeeType }) => ({
  type: 'SAVE_MANUAL_BILL_FEE_TYPE',
  payload: { manualBillFeeType }
})
export const saveManualBillStatus = ({ manualBillStatus }) => ({
  type: 'SAVE_MANUAL_BILL_STATUS',
  payload: { manualBillStatus }
})

export const overwriteAll = ({ customers }) => ({
  type: 'OVERWRITE_ALL_CUSTOMERS',
  payload: { customers }
})

export const createCustomer = ({ customerId, customerName, tableData }) => ({
  type: 'CREATE_CUSTOMER',
  payload: { customerId, customerName, tableData }
})

export const updateCustomerTableData = ({ customerId, tableData, reload = false }) => ({
  type: 'UPDATE_CUSTOMER_TABLE_DATA',
  payload: { customerId, tableData, reload }
})

export const postRowSuccess = ({ customerId, href }) => ({
  type: 'POST_ROW_SUCCESS',
  payload: {
    customerId,
    href
  }
})

export const postBulkRowSuccess = ({ customerId, data }) => ({
  type: 'POST_BULK_ROW_SUCCESS',
  payload: {
    customerId,
    data
  }
})

export const postRowError = ({ customerId, href, error }) => ({
  type: 'POST_ROW_ERROR',
  payload: {
    customerId,
    href,
    error
  }
})

export const postBulkRowError = ({ customerId, data }) => ({
  type: 'POST_BULK_ROW_ERROR',
  payload: {
    customerId,
    data
  }
})

export const updatePostRows = ({ postRowUpdatesCustomers }) => ({
  type: 'UPDATE_POST_ROWS',
  payload: {
    postRowUpdatesCustomers
  }
})

export const clearGrid = () => ({
  type: 'CLEAR'
})

export const clearCustomer = ({ customerId }) => ({
  type: 'CLEAR_CUSTOMER',
  payload: {
    customerId
  }
})

export const setMainDropdownOptions = ({ mainDropdownOptions }) => ({
  type: 'SET_MAIN_DROPDOWN_OPTIONS',
  payload: {
    mainDropdownOptions
  }
})

export const setMainDropdownOptionHasData = ({ id, hasData }) => ({
  type: 'SET_MAIN_DROPDOWN_OPTION_HAS_DATA',
  payload: {
    id,
    hasData
  }
})

const getColDefsToBlankRow = colDefsToRow =>
  colDefsToRow.reduce((accum, item) => ({ ...accum, ...{ [item.field]: '' } }), {})

export const blankRow = getColDefsToBlankRow(colDefs)
const extendWithAdditionalFields = getColDefsToBlankRow(additionalFields)

const updateCustomer = ({ state, customers, customerId, customerName, tableData }) => ({
  ...state,
  customers: {
    ...customers,
    [customerId]: {
      customerName,
      tableData: tableData.map(row => ({
        ...row,
        default: customers[customerId]?.tableData?.find(({ wonum = '' }) => wonum === row?.wonum)
          ?.default ?? {
          ...row
        }
      }))
    }
  }
})

const isEdited = row => row.linedescription || row.linecost || row.committed || row.error
export const getEditedRows = customer => {
  const tableData = customer?.tableData || []
  return tableData.reduce((accum, cur) => {
    if (isEdited(cur)) {
      accum.push(cur)
    }
    return accum
  }, [])
}
export const reducer = (state = initState, { type, payload }) => {
  const { customers } = state
  switch (type) {
    // Grid resets
    case 'OVERWRITE_ALL_CUSTOMERS': {
      const { customers } = payload
      const timestamp = createTimeStamp()

      
      Object.keys(customers)?.map(customerId => {
        customers[customerId] = {
          ...customers[customerId],
          tableData: customers[customerId].tableData?.map(row => ({
            ...row,
            default: {
              ...row
            }
          }))
        }
        return []
      })

      return {
        ...state,
        customers,
        gridOverwrite: timestamp,
        gridAddCustomer: null,
        gridRowRemove: null,
        postRowUpdatesCustomers: []
      } 
    }
    case 'CREATE_CUSTOMER': {
      const { customerId, customerName, tableData } = payload
      return updateCustomer({
        state: {
          ...state,
          gridAddCustomer: customerId, 
          gridRowRemove: null 
        },
        customers,
        customerId,
        customerName,
        tableData: tableData.map(item => ({
          ...item,
          ...extendWithAdditionalFields
          
        }))
      })
    }
    case 'UPDATE_POST_ROWS': {
      const { postRowUpdatesCustomers } = payload
      return {
        ...state,
        postRowUpdatesCustomers 
      }
    }
    
    case 'CLEAR_CUSTOMER': {
      const { mainDropdownOptions } = state
      const { customerId } = payload
      const customerKeys = Object.keys(state.customers || {})
      const customersExcluded = customerKeys.reduce((accum, item) => {
        const customer = customers[item]
        if (item !== customerId) {
          return { ...accum, [item]: customer }
        }
        return accum
      }, {})
      return {
        ...state,
        customers: customersExcluded,
        gridRowRemove: customerId, 
        gridAddCustomer: null, 
        mainDropdownOptions: excludeHasDataFromOptions(customerId, mainDropdownOptions)
      }
    }
    case 'UPDATE_CUSTOMER_TABLE_DATA': {
      const { customerId, tableData, reload = false } = payload
      const customer = state.customers[customerId]
      if (customer) {
        const { customerName } = customer

        return {
          ...updateCustomer({
            state,
            customers,
            customerId,
            customerName,
            tableData
          }),
          ...(reload && { gridOverwrite: createTimeStamp() })
        }
      }
      return state
    }
    case 'SAVE_MANUAL_BILL_FEE_TYPE': {
      const { manualBillFeeType } = payload
      return {
        ...state,
        manualBillFeeType
      }
    }
    case 'SAVE_MANUAL_BILL_STATUS': {
      const { manualBillStatus } = payload
      return {
        ...state,
        manualBillStatus
      }
    }
    case 'POST_ROW_SUCCESS': {
      const { customerId, href } = payload
      const { customerName, tableData } = state.customers[customerId]
      return updateCustomer({
        state,
        customers,
        customerId,
        customerName,
        tableData: tableData.map(item =>
          item.href === href
            ? {
                ...item,
                committed: COMMIT_SUCCESS,
                error: false,
                locked: true
              }
            : item
        )
      })
    }
    case 'POST_BULK_ROW_SUCCESS': {
      const { customerId, data } = payload
      const { customerName, tableData } = state.customers[customerId]
      const updatedWoNums = data?.map(({ wonum }) => wonum)

      return updateCustomer({
        state,
        customers,
        customerId,
        customerName,
        tableData: tableData.map(item =>
          updatedWoNums?.includes(item.wonum)
            ? {
                ...item,
                committed: COMMIT_SUCCESS,
                error: false,
                locked: true
              }
            : item
        )
      })
    }
    case 'POST_ROW_ERROR': {
      const { customerId, href, error } = payload
      const { customerName, tableData } = state.customers[customerId]
      return updateCustomer({
        state,
        customers,
        customerId,
        customerName,
        tableData: tableData.map(item =>
          item.href === href
            ? {
                ...item,
                committed: COMMIT_FAIL,
                error
              }
            : item
        )
      })
    }
    case 'POST_BULK_ROW_ERROR': {
      const { customerId, data } = payload
      const { customerName, tableData } = state.customers[customerId]

      const findRow = wonum => data?.find(row => row.wonum === wonum)

      return updateCustomer({
        state,
        customers,
        customerId,
        customerName,
        tableData: tableData.map(item => {
          const row = findRow(item.wonum)

          if (row) {
            return {
              ...item,
              committed: COMMIT_FAIL,
              error: row?.errorMessage
            }
          }

          return item
        })
      })
    }
    case 'CLEAR': {
      return {
        ...initState,
        gridOverwrite: createTimeStamp(), 
        manualBillStatus: state.manualBillStatus, 
        manualBillFeeType: state.manualBillFeeType, 
        isResetCustomerSelection: !state.isResetCustomerSelection,
        mainDropdownOptions: state.mainDropdownOptions.map(({ hasData, ...rest }) => rest)
      }
    }
    case 'SET_MAIN_DROPDOWN_OPTIONS': {
      const { mainDropdownOptions } = payload

      return {
        ...state,
        mainDropdownOptions: mainDropdownOptions.map(item => ({
          ...item,
          text: `${item.id} - ${item.text}`
        }))
      }
    }
    case 'SET_MAIN_DROPDOWN_OPTION_HAS_DATA': {
      const { mainDropdownOptions } = state
      const { id, hasData } = payload
      return {
        ...state,
        mainDropdownOptions: mainDropdownOptions.map(item =>
          item.id !== id ? item : { ...item, hasData }
        )
      }
    }
    default:
      return state
  }
}
