import { isEmpty } from 'lodash'
import { findAssignmentAndGroup } from '../utilities/findAssignmentAndGroup'

export const diffChange = (objOrig, objNew, exclude = ['edited', 'unhiddenColumn', 'asset']) =>
  Object.keys(objOrig).reduce((accum, key) => {
    if (exclude.indexOf(key) === -1 && objOrig[key] !== objNew[key]) {
      accum.push(key)
    }
    return accum
  }, [])

export const populateKeyValues = ({ row, keys }) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: row[key] }), {})

export const getMultiEdits = ({
  groupedTableData,
  edited,
  groupId,
  assignmentid,
  appendExtraKeys = ['href'],
  personid
}) => {
  let multiassetlocci = []
  if (edited.indexOf('multiassetlocci') !== -1) {
    const { tableData } = findAssignmentAndGroup(groupedTableData, assignmentid)
    multiassetlocci = tableData.tableDataAssets.reduce((acc, multiRow) => {
      const multiEdited = multiRow.edited
      if (multiRow.assignmentid === assignmentid && multiEdited.length > 0) {
        const propsChanged = populateKeyValues({
          row: multiRow,
          keys: multiEdited.concat(appendExtraKeys)
        })

        if (multiEdited.includes('newreading')) {
          propsChanged.multiid = multiRow.multiid
          propsChanged.newreading = String(multiRow.newreading)
          propsChanged.localref = multiRow.asset?.[0].localref
          propsChanged.asset_collectionref = multiRow.asset?.[0].asset_collectionref
          propsChanged.locations_collectionref = multiRow.asset?.[0].locations_collectionref

          propsChanged.asset = [
            {
              href: multiRow.asset?.[0]?.href,
              assetmeter: [
                {
                  href: multiRow.asset?.[0]?.assetmeter?.[0]?.href,
                  newreading: String(multiRow.newreading),
                  newreadingdate: new Date(new Date() - 60000), 
                  inspector: personid
                }
              ]
            }
          ]
        }

        const pelworkcomp = propsChanged?.pelworkcomp
        if (pelworkcomp) {
          propsChanged.pelworkcomp = pelworkcomp
        }
        acc.push(propsChanged)
      }
      return acc
    }, [])
  }
  return multiassetlocci
}


export const getTableAssetsPostUpdates = ({
  groupedTableData,
  postRowUpdatesAssignments,
  personid
}) =>
  postRowUpdatesAssignments.reduce((accum, rowAssignmentEdited) => {
    const { groupId, edited, assignmentid } = rowAssignmentEdited

    const multi = getMultiEdits({
      groupedTableData,
      edited,
      groupId,
      assignmentid,
      appendExtraKeys: ['href', 'groupId', 'multiid'],
      personid
    })

    return accum.concat(multi)
  }, [])


export const getFailureReport = ({
  failurereportProblem,
  failurereportCause,
  failurereportRemedy,
  failurereportProblemHref,
  failurereportCauseHref,
  failurereportRemedyHref
}) => {
  const failurereport = []
  if (failurereportProblem !== undefined) {
    const obj = {
      failurecode: failurereportProblem
    }
    if (failurereportProblemHref) {
      obj.href = failurereportProblemHref
    }
    failurereport.push(obj)
  }
  if (failurereportCause !== undefined) {
    const obj = {
      failurecode: failurereportCause
    }
    if (failurereportCauseHref) {
      obj.href = failurereportCauseHref
    }
    failurereport.push(obj)
  }
  if (failurereportRemedy !== undefined) {
    const obj = {
      failurecode: failurereportRemedy
    }
    if (failurereportRemedyHref) {
      obj.href = failurereportRemedyHref
    }
    failurereport.push(obj)
  }

  if (!isEmpty(failurereport)) {
    
    const isFailureReportUpdating = failurereport.some(row => row.href)

    if (isFailureReportUpdating) {
      failurereport.forEach(row => {
        if (row.href) {
          const obj = { ...row, _action: 'Delete' }
          failurereport.push(obj)
        }
        delete row.href 
      })
    }
  }

  return failurereport
}

const getWorkOrderEdits = ({
  groupedTableData,
  edited,
  groupId,
  assignmentid,
  wohref,
  failurereportProblemHref,
  failurereportCauseHref,
  failurereportRemedyHref,
  assignmentValuesDirty,
  mtfmcof,
  personid
}) => {
  const failurecode = assignmentValuesDirty?.failurecode
  const failurereportProblem = assignmentValuesDirty?.failurereportProblem
  const failurereportCause = assignmentValuesDirty?.failurereportCause
  const failurereportRemedy = assignmentValuesDirty?.failurereportRemedy

  const workorder0 = {}
  const multiassetlocci = getMultiEdits({
    groupedTableData,
    edited,
    groupId,
    assignmentid,
    personid
  })

  const failurereport = getFailureReport({
    failurereportProblem,
    failurereportCause,
    failurereportRemedy,
    failurereportProblemHref,
    failurereportCauseHref,
    failurereportRemedyHref
  })

  if (failurecode) {
    workorder0.failurecode = failurecode
  }
  if (failurereport.length) {
    workorder0.failurereport = failurereport
  }
  if (multiassetlocci.length > 0) {
    workorder0.multiassetlocci = multiassetlocci
  }
  if (workorder0) {
    workorder0.href = wohref
  }
  if (edited.includes('mtfmcof') && mtfmcof) {
    workorder0.mtfmcof = mtfmcof
  }
  return workorder0
}

export const getAssignmentEdits = assignmentValuesDirty => {
  const pelstatusdate = assignmentValuesDirty?.pelstatusdate
  const pelassignstart = assignmentValuesDirty?.pelassignstart
  const pelassignfinish = assignmentValuesDirty?.pelassignfinish
  const pelpermitref = assignmentValuesDirty?.pelpermitref
  const startdate = assignmentValuesDirty?.startdate
  const finishdate = assignmentValuesDirty?.finishdate
  const status = assignmentValuesDirty?.status
  const pelappointslotstart = assignmentValuesDirty?.pelappointslotstart
  const pelappointslotfinish = assignmentValuesDirty?.pelappointslotfinish
  const apptrequired = assignmentValuesDirty?.apptrequired
  const pelreasoncode = assignmentValuesDirty?.pelreasoncode

  const assignmentValues = {}
  if (pelstatusdate !== undefined) {
    assignmentValues.pelstatusdate = pelstatusdate
  }
  if (pelassignstart !== undefined) {
    assignmentValues.pelassignstart = pelassignstart
  }
  if (pelassignfinish !== undefined) {
    assignmentValues.pelassignfinish = pelassignfinish
  }
  if (pelappointslotstart !== undefined) {
    assignmentValues.pelappointslotstart = pelappointslotstart
  }
  if (pelappointslotfinish !== undefined) {
    assignmentValues.pelappointslotfinish = pelappointslotfinish
  }
  if (pelpermitref !== undefined) {
    assignmentValues.pelpermitref = pelpermitref
  }
  if (apptrequired !== undefined) {
    assignmentValues.apptrequired = apptrequired
  }
  if (startdate !== undefined) {
    assignmentValues.startdate = startdate
  }
  if (finishdate !== undefined) {
    assignmentValues.finishdate = finishdate
  }
  if (pelreasoncode !== undefined) {
    assignmentValues.pelreasoncode = pelreasoncode
  }
  if (status !== undefined) {
    assignmentValues.status = status
    if (status === 'SUBFINISH') {
      
      
      
      assignmentValues.pelaction = 999
    }
  }
  return assignmentValues
}


export const getEditedRowPropChanges = ({ row, groupedTableData, personid }) => {
  const {
    edited,
    groupId,
    assignmentid,
    failurereportProblemHref,
    failurereportCauseHref,
    failurereportRemedyHref,
    wohref,
    mtfmcof
  } = row

  const assignmentValuesDirty = populateKeyValues({ row, keys: edited })

  const workorder0 = getWorkOrderEdits({
    groupedTableData,
    edited,
    groupId,
    assignmentid,
    wohref,
    mtfmcof,
    failurereportProblemHref,
    failurereportCauseHref,
    failurereportRemedyHref,

    assignmentValuesDirty,
    personid
  })

  const assignmentValues = getAssignmentEdits(assignmentValuesDirty)

  const rowOnlyChanges = workorder0
    ? { workorder: [workorder0], ...assignmentValues }
    : assignmentValues

  return rowOnlyChanges
}

export const getWorkGroupEditedRows = tableData =>
  tableData?.tableDataAssignments.reduce((acc, row) => {
    const { edited, locked } = row
    if (edited.length > 0 && !locked) {
      acc.push(row)
    }
    return acc
  }, []) || []

export const getWorkGroupEditedOrLockedRows = tableData =>
  tableData?.tableDataAssignments.reduce((acc, row) => {
    const { edited, locked } = row
    if (edited.length > 0 || locked) {
      acc.push(row)
    }
    return acc
  }, []) || []

export const getAllEditedRows = groupedTableData =>
  Object.keys(groupedTableData).reduce(
    (accum, groupId) => accum.concat(getWorkGroupEditedRows(groupedTableData[groupId])),
    []
  )
