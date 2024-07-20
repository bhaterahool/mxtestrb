import { parseISO } from 'date-fns'

const COLUMN_NAMES = {
  assignment: [
    'Assignment',
    'Appointment Required',
    'Appointment Finish',
    'Appointment Start',
    'Worktype',
    'Target Finish',
    'Target Start',
    'Service Request Type',
    'Priority',
    'Assignment Description',
    'Permit Reference',
    'Permit Required',
    'SR Number',
    'Work Order',
    'Customer',
    'Building',
    'Actual Start',
    'Actual Finish',
    'Estimated Start',
    'Estimated Finish',
    'Failure Reason',
    'Failure Class',
    'Problem',
    'Cause',
    'Remedy'
  ],
  multiAssets: [
    'Assignment',
    'Work Order',
    'Multi Asset',
    'Asset',
    'Location',
    'Work Complete',
    'Work Complete Date',
    'Work Outcome',
    'Work Completion Notes',
    'Non-Completion Reason',
    'New Condition'
  ]
}
const assignmentsReadonlyKeys = [
  'assignmentid',
  'apptrequired',
  'pelappointslotfinish',
  'pelappointslotstart',
  'worktype',
  'targcompdate',
  'targstartdate',
  'pelsrtype',
  'wopriority',
  'peldescription',
  'pelpermitrequired',
  'ticketid',
  'wonum',
  'pluspcustomer',
  'pellocbuilding',
  'groupId'
]

const tableDataAssignmentsKeysOrder = [
  'assignmentid',
  'apptrequired',
  'pelappointslotfinish',
  'pelappointslotstart',
  'worktype',
  'targcompdate',
  'targstartdate',
  'pelsrtype',
  'wopriority',
  'peldescription',
  'pelpermitref',
  'pelpermitrequired',
  'ticketid',
  'wonum',
  'pluspcustomer',
  'pellocbuilding',
  'startdate',
  'finishdate',
  'pelassignstart',
  'pelassignfinish',
  'mtfmcof',
  'failurecode',
  'failurereportProblem',
  'failurereportCause',
  'failurereportRemedy',
  'status',
  'groupId'
]

const importedSheetNames = [
  'Assignment',
  'Appointment Required',
  'Appointment Finish',
  'Appointment Start',
  'Worktype',
  'Target Finish',
  'Target Start',
  'Service Request Type',
  'Priority',
  'Assignment Description',
  'Permit Required',
  'SR Number',
  'Work Order',
  'Customer',
  'Building',
  `Group Id (Do not change)`
]

const checkWorksheetsExist = ({ assignmentsData, multiAssetsData }, errorLog) => {
  if (!assignmentsData.length) {
    errorLog.push("Can't find worksheet named Assignments")
  }
  if (!multiAssetsData.length) {
    errorLog.push("Can't find worksheet named Multi Assets")
  }
  if (!assignmentsData.length || !multiAssetsData.length) {
    return false
  }
  return true
}

const checkColumnNamesExist = ({ assignmentsData, multiAssetsData }, errorLog) => {
  const assignmentsDataHeaders = Object.keys(assignmentsData[0])
  const multiAssetsHeaders = Object.keys(multiAssetsData[0])

  const assignmentErrors = []
  const multiAssetsErrors = []

  COLUMN_NAMES.assignment.forEach(columnName => {
    if (!assignmentsDataHeaders.includes(columnName)) {
      assignmentErrors.push(columnName)
    }
  })

  COLUMN_NAMES.multiAssets.forEach(columnName => {
    if (!multiAssetsHeaders.includes(columnName)) {
      multiAssetsErrors.push(columnName)
    }
  })

  if (assignmentErrors.length) {
    errorLog.push(`Assignment column headers missing: ${assignmentErrors.join(', ')}`)
  }
  if (multiAssetsErrors.length) {
    errorLog.push(`Multi Assets column headers missing: ${multiAssetsErrors.join(', ')}`)
  }
}

const checkAssignmentsExist = (
  { assignmentsData, multiAssetsData },
  { tableDataAssignments, tableDataAssets },
  errorLog
) => {
  assignmentsData.forEach(importedAssignment => {
    if (
      importedAssignment.Assignment &&
      !tableDataAssignments.some(
        assignment => assignment.assignmentid === parseInt(importedAssignment.Assignment, 10)
      )
    ) {
      errorLog.push(
        `Assignment ${importedAssignment.Assignment} doesn't exist in the Assignments table.`
      )
    }
  })

  multiAssetsData.forEach(importedMulktiAssetLocci => {
    if (
      importedMulktiAssetLocci.assignmentid &&
      !tableDataAssets.some(
        multiassetlocci =>
          multiassetlocci.assignmentid === parseInt(importedMulktiAssetLocci.assignmentid, 10)
      )
    ) {
      errorLog.push(
        `Assignment ${importedMulktiAssetLocci.assignmentid} doesn't exist in the Multi Assets table.`
      )
    }
  })
}

const getArrayFromObject = data => {
  return data.map(row => {
    const { value, text } = row
    if (value && text) {
      return value
    }
    return row
  })
}

const checkDataTypes = (
  { assignmentsData, multiAssetsData },
  { dropdowns, allowedStatuses },
  errorLog
) => {
  const noncompreasons = getArrayFromObject(dropdowns?.noncompreasons ?? [])
  const reasonCodes = getArrayFromObject(dropdowns?.reasoncodes ?? [])

  assignmentsData.forEach(
    ({
      Status: status,
      'Status Date': statusDate,
      'Estimated Start': estimatedStart,
      'Estimated Finish': estimatedFinish,
      'Actual Start': actualStart,
      'Actual Finish': actualFinish,
      'Target Start': targetStart,
      'Target Finish': targetFinish,
      'Reason Code': reasonCode
    }) => {
      const statuses = allowedStatuses.map(item => item.id)
      const validStatuses = statuses.concat('SUBFINISH')
      if (status && !validStatuses.includes(status)) {
        errorLog.push(`Invalid Status: ${status}. Should be one of ${validStatuses.join(', ')}`)
      }
      if (statusDate && parseISO(statusDate)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Status Date: ${statusDate}`)
      }
      if (estimatedStart && parseISO(estimatedStart)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Estimated Start: ${estimatedStart}`)
      }
      if (estimatedFinish && parseISO(estimatedFinish)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Estimated Finish: ${estimatedFinish}`)
      }
      if (actualStart && parseISO(actualStart)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Actual Start : ${actualStart}`)
      }
      if (actualFinish && parseISO(actualFinish)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Actual Finish: ${actualFinish}`)
      }
      if (targetStart && parseISO(targetStart)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Target Start : ${targetStart}`)
      }
      if (targetFinish && parseISO(targetFinish)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Target Finish: ${targetFinish}`)
      }
      if (reasonCode && !reasonCodes.includes(reasonCode)) {
        errorLog.push(
          `Invalid Reason Code: ${reasonCode}. Should be one of ${reasonCodes.join(', ')}`
        )
      }
    }
  )

  multiAssetsData.forEach(
    ({
      'Non-Completion Reason': noncompreason,
      'Work Outcome': workoutcome,
      'Work Complete Date': workCompleteDate,
      'Work Completion Notes': workCompletionNotes,
      'Work Complete': workComplete,
      Assignment: multAssetAssignmentId
    }) => {
      if (noncompreason && !noncompreasons.includes(noncompreason)) {
        errorLog.push(
          
          `Invalid Non-Completion Reason: ${noncompreason}. Should be one of ${noncompreasons.join(
            ', '
          )}`
        )
      }

      const worktype =
        assignmentsData.filter(
          ({ Assignment: assignmentid }) => assignmentid === multAssetAssignmentId
        )?.[0]?.Worktype || ''

      const workoutcomes = getArrayFromObject(
        dropdowns?.workoutcomes?.filter(row => row?.alnvalue?.includes(worktype)) ?? []
      )

      if (workoutcome && !workoutcomes.includes(workoutcome)) {
        errorLog.push(
          `Invalid Work Outcome Status: ${workoutcome}. Should be one of ${workoutcomes.join(', ')}`
        )
      }
      if (workCompleteDate && parseISO(workCompleteDate)?.toString() === 'Invalid Date') {
        errorLog.push(`Invalid Work Complete Date: ${workCompleteDate}.`)
      }
      if (workCompletionNotes && workCompletionNotes.length > 500) {
        errorLog.push('Invalid Work Completion Notes. Maximum length is 500 characters.')
      }

      if (typeof workComplete !== 'boolean') {
        errorLog.push(`Invalid Work Complete: ${workComplete}. Should be true or false.`)
      }
    }
  )
}

const validateCommittedAssignments = ({ assignmentsData }, { tableDataAssignments }, errorLog) => {
  const committedAssignmentList = tableDataAssignments.filter(item => item.locked === true)
  const lockedAssignmentIds = committedAssignmentList.map(item => item.assignmentid)
  const importedMayChangedAssignments = assignmentsData.filter(item =>
    lockedAssignmentIds.includes(item.Assignment)
  )

  const changedAssignKeysOrder = [
    ...COLUMN_NAMES.assignment,
    ...[`Status`, `Group Id (Do not change)`]
  ]

  const changedAssignments = committedAssignmentList.reduce((acc, element, elementIndex) => {
    const element2 = importedMayChangedAssignments[elementIndex]

    const changedAssignKeys = changedAssignKeysOrder.reduce((accKeys, keyName, keyIndex) => {
      return element[`${tableDataAssignmentsKeysOrder[keyIndex]}`] !== element2[`${keyName}`]
        ? [...accKeys, keyName]
        : accKeys
    }, [])
    return changedAssignKeys.length
      ? [
          ...acc,
          `Assignment ${element.assignmentid} is committed to maximo, ${changedAssignKeys} field values cannot be changed.`
        ]
      : acc
  }, [])

  if (changedAssignments.length) {
    errorLog.push(changedAssignments.join('\n\n'))
  }
}

const validateReadonlyFields = ({ assignmentsData }, { tableDataAssignments }, errorLog) => {
  const changedAssignments = tableDataAssignments.reduce((acc, element, elementIndex) => {
    const element2 = assignmentsData.find(item => item.Assignment === element.assignmentid)

    const changedAssignKeys = importedSheetNames.reduce((accKeys, keyName, keyIndex) => {
      return element[assignmentsReadonlyKeys[keyIndex]] !== undefined &&
        element2[keyName] !== undefined &&
        element[assignmentsReadonlyKeys[keyIndex]] !== element2[keyName]
        ? [...accKeys, keyName]
        : accKeys
    }, [])
    return changedAssignKeys.length
      ? [
          ...acc,
          `${changedAssignKeys} field is readonly in Assignment ${element.assignmentid} and values cannot be changed.`
        ]
      : acc
  }, [])

  if (changedAssignments.length) {
    errorLog.push(changedAssignments.join('\n\n'))
  }
}

const reportErrors = (onError, errorLog) => {
  if (errorLog.length) {
    onError({
      title: 'Error uploading spreadsheet!',
      subtitle: errorLog.join('\n\n'),
      className: 'afpbulk-error'
    })
  }
}

export const verifySpreadsheetData = (dataToVerify, currentGridData, onError) => {
  const errorLog = []
  try {
    if (checkWorksheetsExist(dataToVerify, errorLog)) {
      checkColumnNamesExist(dataToVerify, errorLog)
      checkAssignmentsExist(dataToVerify, currentGridData, errorLog)
      checkDataTypes(dataToVerify, currentGridData, errorLog)
      validateCommittedAssignments(dataToVerify, currentGridData, errorLog)
      validateReadonlyFields(dataToVerify, currentGridData, errorLog)
    }
  } catch ({ message }) {
    onError({
      title: 'Error uploading spreadsheet!',
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
