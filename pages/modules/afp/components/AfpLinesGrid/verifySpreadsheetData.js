const COLUMN_NAMES = {
  SUBAFP: [
    'Assignment ID',
    'Work Order No',
    'PO',
    'AFP Line Status',
    'Assignment Description',
    'Assignment Notes'
  ],
  SUBAFPCHILD: [
    'Line Detail ID',
    'MFA Reference',
    'MFA Line No',
    'Line Description',
    'Line Notes',
    'Qty',
    'Unit Cost'
  ],
  SUBPO: [
    'Assignment ID',
    'Work Order No',
    'PO',
    'AFP Line Status',
    'Assignment Description',
    'Assignment Notes'
  ]
}

let errorLog = []
let warningLog = []

const checkFieldTypes = (data, afpData, type) => {
  const errors = []

  data.forEach(item => {
    if (item['Assignment ID'] && isNaN(Number(item['Assignment ID'])))
      errors.push(`Type of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`)

    if (item.PO && isNaN(Number(item.PO)))
      errors.push(
        `Type of PO of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )

    if (typeof item['AFP Line Status'] && typeof item['AFP Line Status'] !== 'string')
      errors.push(
        `Type of AFP Line Status of Assignment ID ${item['Assignment ID']} is invalid. Should be Text.`
      )

    if (item['AFP Line Cost'] && isNaN(Number(item['AFP Line Cost'])))
      errors.push(
        `Type of AFP Line Cost of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )

    if (
      item['Line Detail ID'] &&
      typeof item['Line Detail ID'] !== 'number' &&
      !item['Line Detail ID'].includes('new_')
    )
      errors.push(
        `Type of Line Detail ID of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )

    if (type === 'SUBAFP' && item['MFA Line No'] && typeof item['MFA Line No'] !== 'number')
      errors.push(
        `Type of MFA Line No of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )

    if (item.Qty && isNaN(Number(item.Qty)))
      errors.push(
        `Type of Qty of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )

    if (item['Unit Cost'] && isNaN(Number(item['Unit Cost'])))
      errors.push(
        `Type of Unit Cost of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )

    if (item['Detail Line Cost'] && isNaN(Number(item['Detail Line Cost'])))
      errors.push(
        `Type of Detail Line Cost of Assignment ID ${item['Assignment ID']} is invalid. Should be Numeric.`
      )
  })

  if (errors.length) {
    errorLog.push(errors.join('\n\n'))
    return false
  }
  return true
}

const checkColumnNamesExist = (data, { type }) => {
  const headers = Object.keys(data[0])
  const errors = []
  const subErrors = []

  COLUMN_NAMES[type].forEach(columnName => {
    if (!headers.includes(columnName)) {
      errors.push(columnName)
    }
  })
  if (type === 'SUBAFP') {
    const anySubCoulmn = COLUMN_NAMES.SUBAFPCHILD.some(item => headers.includes(item))

    COLUMN_NAMES.SUBAFPCHILD.forEach(subColumnName => {
      if (anySubCoulmn && !headers.includes(subColumnName)) {
        subErrors.push(subColumnName)
      }
    })
  }
  if (errors.length || subErrors.length) {
    if (errors.length) {
      errorLog.push(`Column Headers missing: ${errors.join(', ')}`)
    }
    if (subErrors.length) {
      errorLog.push(`Column Headers missing: ${errors.join(', ')}`)
    }
    return false
  }
  return true
}

const checkAssignmentIdExists = (data, afpData) => {
  const uploadedAssignmentids = new Set(
    data.map(({ 'Assignment ID': assignmentId }) => assignmentId)
  )

  if (!uploadedAssignmentids.size) {
    return false
  }

  const { pelafpline = [] } = afpData

  const assignmentids = new Set(pelafpline.map(({ assignmentid }) => assignmentid))

  uploadedAssignmentids.forEach(assignmentId => {
    if (!assignmentids.has(assignmentId)) {
      errorLog.push(`Assignment ID ${assignmentId} is not associated with the current AFP.`)
      return false
    }
    return true
  })
}

const checkAssignmentStatus = (data, afpData) => {
  const permittedStatuses = ['WAPPR', 'HOLD', 'QUERY', 'ABOVEPO']
  const { pelafpline = [], status } = afpData

  if (!pelafpline.length) return false

  const errors = []

  if (['APPROVED', 'SUBMITTED'].includes(status)) {
    errors.push(`AFP lines cannot be updated on ${status} AFP`)
  }

  const uniqueAssignmentIds = new Set(data.map(({ 'Assignment ID': assignmentId }) => assignmentId))

  
  uniqueAssignmentIds.forEach(uniqueAssignmentId => {
    const linesByAssignmentId = data.filter(
      ({ 'Assignment ID': assignmentId }) => assignmentId === uniqueAssignmentId
    )
    if (
      !linesByAssignmentId.every(
        ({ 'AFP Line Status': status }, i, [{ 'AFP Line Status': statusToTest }]) =>
          status === statusToTest
      )
    ) {
      errors.push(`Statuses for assignment ${uniqueAssignmentId} are not the same.`)
    }
  })

  
  data.forEach(
    ({
      'Assignment ID': dataAssignmentId,
      'AFP Line Status': newStatus,
      'Status Memo': newStatusMemo,
      'AFP Line Cost': totalLineCost
    }) => {
      const {
        status: currentStatus,
        pelpoline: poValueList,
        statusmemo: currentStatusMemo = ''
      } = pelafpline.find(
        ({ assignmentid: existingAssignmentId }) => existingAssignmentId === dataAssignmentId
      )

      if (poValueList?.[0]?.linecost > totalLineCost && newStatus === 'ABOVEPO') {
        errors.push(
          `Status ${newStatus} of assignment ${dataAssignmentId} is invalid. Should be one of WAPPR, HOLD or QUERY.`
        )
      } else if (!permittedStatuses.includes(newStatus)) {
        errors.push(
          `Status ${newStatus} of assignment ${dataAssignmentId} is invalid. Should be one of WAPPR, HOLD, QUERY or ABOVEPO.`
        )
      }

      if (currentStatus === newStatus && currentStatusMemo !== newStatusMemo) {
        errors.push(
          `Attempting to change status memo of assignment ${dataAssignmentId} which is readonly.`
        )
      }

      if (currentStatus === newStatus) return

      switch (currentStatus) {
        case 'WAPPR':
          if (newStatus !== 'HOLD') {
            errors.push(
              `Attempting to change status of assignment ${dataAssignmentId} to ${newStatus}. Current status of WAPPR can only be changed to HOLD.`
            )
          }
          break
        case 'QUERY':
          if (newStatus !== 'HOLD' || newStatus !== 'WAPPR') {
            errors.push(
              `Attempting to change status of assignment ${dataAssignmentId} to ${newStatus}. Current status of QUERY can only be changed to HOLD or WAPPR.`
            )
          }
          break
        case 'HOLD':
          if (newStatus !== 'WAPPR') {
            errors.push(
              `Attempting to change status of assignment ${dataAssignmentId} to ${newStatus}. Current status of HOLD can only be changed to WAPPR.`
            )
          }
          break
        default:
          break
      }
    }
  )
  if (errors.length) {
    errorLog.push(errors.join('\n\n'))
    return false
  }
  return true
}

const checkLineId = (data, afpData) => {
  const { pelafpline = [] } = afpData
  const records = []

  if (!pelafpline.length) return false

  data.forEach(({ 'Line Detail ID': lineid, 'Assignment ID': assignmentid }) => {
    const { pelafplinedetail } = pelafpline.find(
      ({ assignmentid: existingAssignmentId }) => existingAssignmentId === assignmentid
    )
    const lineIds = pelafplinedetail?.map(({ pelafplinedetailid }) => pelafplinedetailid) ?? []

    if (
      records.findIndex(item => item.lineid === lineid && item.assignmentid === assignmentid) !== -1
    ) {
      errorLog.push(
        `Line Detail ID ${lineid} has a duplicate Line Detail ID for assignment ${assignmentid}.`
      )
      return false
    }
    if (lineid !== '' && assignmentid !== '') {
      records.push({ assignmentid, lineid })
    }

    if (!lineIds.includes(lineid) && lineid) {
      errorLog.push(`Line Detail ID ${lineid} doesn't exist for assignment ${assignmentid}.`)
      return false
    }
    return true
  })
}

const checkMfaLineNum = async (data, afpData) => {
  const { pelafpline = [] } = afpData
  const errors = []
  const warnings = []

  if (!pelafpline.length) return false

  data.forEach(
    ({
      'MFA Line No': mfaLineNum,
      Qty: qty,
      'Unit Cost': unitCost,
      'Line Description': linedescription,
      'MFA Reference': mfaNumber,
      'Assignment ID': assignmentId
    }) => {
      const { pelmfaref = '', pelContractLines = [] } =
        pelafpline?.find(
          row => row?.pelmfaref === mfaNumber && row?.assignmentid === assignmentId
        ) ?? {}
      const { chgqtyonuse, chgpriceonuse, orderqty, unitcost, description } =
        pelContractLines?.find(({ contractlinenum }) => contractlinenum === mfaLineNum) || {}

      if (mfaLineNum && (linedescription || unitCost)) {
        const mfpNoText = `MFA No: ${pelmfaref} `

        if (qty <= 0) {
          warnings.push(`${mfpNoText} - No QTY provided for MFA Line Num ${mfaLineNum}.`)
        }
        if (!chgqtyonuse && qty > 0 && qty !== orderqty) {
          errors.push(`${mfpNoText} - QTY provided not allowed for MFA Line Num ${mfaLineNum}.`)
        }
        if (unitCost <= 0) {
          warnings.push(`${mfpNoText} - No UNIT COST provided for MFA Line Num ${mfaLineNum}.`)
        }
        if (!chgpriceonuse && unitCost > 0 && unitCost !== unitcost) {
          errors.push(
            `${mfpNoText} - UNIT COST provided not allowed for MFA Line Num ${mfaLineNum}.`
          )
        }
        if (description && description !== linedescription) {
          errors.push(
            `${mfpNoText} - Line Description provided is invalid for MAF Line Num ${mfaLineNum}.`
          )
        }
      }
    }
  )

  if (errors.length || warnings.length) {
    if (errors.length) {
      errorLog.push(errors.join('\n\n'))
    }
    if (warnings.length) {
      warningLog.push(warnings.join('\n\n'))
    }
    return false
  }
  return true
}

const checkNotesExist = data => {
  data.forEach(({ 'Line Notes': notes, 'Assignment ID': assignmentid, Qty }) => {
    if (!notes.trim() && Qty > 0) {
      errorLog.push(`No NOTES provided for assignment ${assignmentid}`)
      return false
    }
    return true
  })
}

const checkQtyExists = data => {
  data.forEach(({ Qty: qty, 'Assignment ID': assignmentid }) => {
    if (!qty && typeof qty !== 'number') {
      errorLog.push(`No QTY provided for assignment ${assignmentid}`)
      return false
    }
    return true
  })
}

const checkUnitCostExists = data => {
  data.forEach(({ 'Unit Cost': unitCost, 'Assignment ID': assignmentid }) => {
    if (!unitCost && typeof unitCost !== 'number') {
      errorLog.push(`No UNIT COST provided for assignment ${assignmentid}`)
      return false
    }
    if (typeof unitCost !== 'number') {
      errorLog.push(`UNIT COST provided for assignment ${assignmentid} is not a number.`)
    }
    return true
  })
}

const reportErrors = (onError, onWarning) => {
  if (errorLog.length) {
    onError({
      title: 'Error uploading spreadsheet!',
      subtitle: errorLog.join('\n\n'),
      className: 'afp-error'
    })
  }
  if (warningLog.length) {
    onWarning({
      title: 'Warning uploading spreadsheet!',
      subtitle: warningLog.join('\n\n'),
      className: 'afp-error'
    })
  }
}

export const verifySpreadsheetData = async (data, afpData, onError, onWarning) => {
  const { type } = afpData
  errorLog = []
  warningLog = []

  try {
    checkColumnNamesExist(data, afpData)
    checkAssignmentIdExists(data, afpData)
    checkAssignmentStatus(data, afpData)
    checkLineId(data, afpData)
    checkFieldTypes(data, afpData, type)
    if (type === 'SUBAFP') {
      await checkMfaLineNum(data, afpData)
    }
    if (type === 'SUBPO') {
      // checkNotesExist(data)
      checkQtyExists(data)
      checkUnitCostExists(data)
    }
  } catch ({ message }) {
    onError({
      title: 'Error uploading spreadsheet!',
      subtitle: data.length === 0 ? `No assignment provided in sheet` : message,
      className: 'afp-error'
    })
  } finally {
    reportErrors(onError, onWarning)
  }

  if (errorLog.length) {
    return false
  }

  return true
}

const checkContinuousEmptyRow = (data, fromIndex) => {
  let rowHasData = false

  for (let index = fromIndex; index < data?.length; index++) {
    const row = data[index]
    const isEmptyRow = Array.isArray(row) && row.every(item => !String(item)?.trim())

    if (!isEmptyRow) {
      rowHasData = true
      break
    }
  }

  return rowHasData
}

export const verifySpreadsheetHasEmptyRow = data => {
  let isEmptyRowFound = false

  if (data && data?.length && Array.isArray(data)) {
    const dataCount = data.length

    for (let index = 0; index < dataCount; index++) {
      const row = data[index]
      const isEmptyRow = Array.isArray(row) && row.every(item => !String(item)?.trim())

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
