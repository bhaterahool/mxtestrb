import {
  WORK_ORDER_STATUS_BILLABLE,
  WORK_ORDER_STATUS_NONBILL
} from '../../../../shared/grid/constants'
import { colDefs } from '../DataGrid/Columns/colDefs'

const COLUMN_NAMES = colDefs.map(colDef => colDef.headerName)

const EDITABLE_COLUMN_NAMES = colDefs
  .filter(colDef => colDef.editable)
  .map(colDef => colDef.headerName)

const tableDataWoKeysOrder = [
  'wonum',
  'siteid',
  'worktype',
  'commoditygroup',
  'commodity',
  'description',
  'pluspcustomer',
  'status',
  'linedescription',
  'linecost'
]

const checkWorksheetsExist = (importedWorkOrders, errorLog) => {
  if (!importedWorkOrders.length) {
    errorLog.push("Can't find worksheet named Work Orders")
  }
  return true
}

const validatePriceFormat = (importedWorkOrders = [{}], errorLog) => {
  importedWorkOrders.forEach(wo => {
    if (wo['Line Price'] !== '' && wo['Line Price'] !== null && isNaN(wo['Line Price'])) {
      errorLog.push(
        `Work Order: ${wo['Work Order Number']} line price invalid: ${wo['Line Price']}`
      )
    }
  })
}

const checkColumnNamesExist = (importedWorkOrders = [{}], errorLog) => {
  const tableDataHeaders = Object.keys(importedWorkOrders[0])
  const workOrderErrors = []

  EDITABLE_COLUMN_NAMES.forEach(columnName => {
    if (!tableDataHeaders.includes(columnName)) {
      workOrderErrors.push(columnName)
    }
  })

  if (workOrderErrors.length) {
    errorLog.push(`Work Order column headers missing: ${workOrderErrors.join(', ')}`)
  }
}

const reportErrors = (onError, errorLog) => {
  if (errorLog.length) {
    onError({
      title: 'Error importing spreadsheet',
      subtitle: errorLog.join('\n\n'),
      className: 'afpbulk-error'
    })
  }
}

const validateStatuses = (statuses = [], importedWorkOrders = [{}], errorLog) => {
  const primaryKeyColDef = colDefs.find(colDefs => colDefs.isPrimaryKey)
  importedWorkOrders.forEach(workorder => {
    let workorderStatuses = [WORK_ORDER_STATUS_BILLABLE, WORK_ORDER_STATUS_NONBILL]

    if (statuses && Array.isArray(statuses)) {
      workorderStatuses = workorderStatuses.concat(statuses)
    }

    if (!workorderStatuses.includes(workorder['Work Order Status'])) {
      errorLog.push(
        `Work Order ${workorder[primaryKeyColDef.headerName]} Status invalid: ${
          workorder['Work Order Status']
        }`
      )
    }
  })
}

const validateEditableStatus = (importedWorkOrders = [{}], tableData, errorLog) => {
  const primaryKeyColDef = colDefs.find(colDefs => colDefs.isPrimaryKey)
  importedWorkOrders.forEach(workorder => {
    const tableRow = tableData?.find(row => row?.wonum === workorder['Work Order Number'])

    if (tableRow) {
      if (tableRow?.status !== 'MANBILL' && tableRow?.status !== workorder['Work Order Status']) {
        errorLog.push(
          `Work Order ${workorder[primaryKeyColDef.headerName]} Status invalid: ${
            workorder['Work Order Status']
          }. Current status of ${tableRow?.status} can not be changed to ${
            workorder['Work Order Status']
          }`
        )
      }
    }
  })
}

const validateCommittedAssignments = (importedWorkOrders, tableData, errorLog) => {
  const committedWoList = tableData.filter(item => item.committed === 'Committed')
  const lockedWoIds = committedWoList.map(item => item.wonum)
  const importedMayChangedWo = importedWorkOrders.filter(item =>
    lockedWoIds.includes(item['Work Order Number'])
  )

  const changedAssignments = committedWoList.reduce((acc, element, elementIndex) => {
    const element2 = importedMayChangedWo[elementIndex]

    const changedAssignKeys = COLUMN_NAMES.reduce((accKeys, keyName, keyIndex) => {
      return element[`${tableDataWoKeysOrder[keyIndex]}`] !== element2[`${keyName}`]
        ? [...accKeys, keyName]
        : accKeys
    }, [])
    return changedAssignKeys.length
      ? [
          ...acc,
          `Work Order ${element.wonum} is committed to maximo, ${changedAssignKeys} field values cannot be changed.`
        ]
      : acc
  }, [])

  if (changedAssignments.length) {
    errorLog.push(changedAssignments.join('\n\n'))
  }
}

export const verifySpreadsheetData = ({ statuses, dataToVerify, tableData, onError }) => {
  const errorLog = []
  try {
    if (checkWorksheetsExist(dataToVerify, errorLog)) {
      validatePriceFormat(dataToVerify, errorLog)
      checkColumnNamesExist(dataToVerify, errorLog)
      validateStatuses(statuses, dataToVerify, errorLog)
      validateEditableStatus(dataToVerify, tableData, errorLog)
      validateCommittedAssignments(dataToVerify, tableData, errorLog)
    }
  } catch ({ message }) {
    onError({
      title: 'Error validating spreadsheet',
      subtitle: message,
      className: 'afpbulk-error'
    })
  } finally {
    reportErrors(onError, errorLog)
  }

  if (errorLog.length) {
    return false
  }

  return true
}
