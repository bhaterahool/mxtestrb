import {
  additionalFieldsAssignments,
  additionalFieldsAssets,
  colDefsAssignments
} from '../components/DataGrid/Columns/colDefs'
import { COMMIT_FAIL, COMMIT_SUCCESS } from '../../../shared/grid/constants'
import { createTimeStamp } from '../../../util/datetime'
import { diffChange } from '../services/getChangesForPost'
import { excludeHasDataFromOptions } from '../../../shared/components/DropdownDataLoader'
import { findAssignmentAndGroup } from '../utilities/findAssignmentAndGroup'
import { useToast } from '../../../shared/toasts/ToastProvider'

const extendArray = (arr, newArr) => [...new Set(arr.concat(newArr))]

export const initState = {
  groupedTableData: {
      },
  gridOverwrite: null, 
  gridAddWorkGroup: null, 
  postRowUpdatesAssignments: [], 
  postRowUpdatesAssets: [], 
  gridRowRemove: null, 
  isResetStatusesSelection: false,

  dropdowns: {
    statuses: [],
    workoutcomes: [],
    noncompreason: [],
    assetconditions: [],
    reasoncodes: []
  },
  mainDropdownOptions: []
}

export const saveColAssignmentStatusDropdown = ({ statuses }) => ({
  type: 'SAVE_COL_ASSIGNMENT_STATUS_DROPDOWN',
  payload: { statuses }
})

export const saveColAssignmentReasonCodeDropdown = ({ reasoncodes }) => ({
  type: 'SAVE_COL_ASSIGNMENT_REASONCODE_DROPDOWN',
  payload: { reasoncodes }
})

export const saveColWorkOutcomeDropdown = ({ workoutcomes }) => {
  return {
    type: 'SAVE_COL_WORK_OUTCOME_DROPDOWN',
    payload: { workoutcomes }
  }
}

export const saveColPelNonCompReasonDropdown = ({ noncompreasons }) => {
  return {
    type: 'SAVE_COL_PEL_NON_COMP_REASON_DROPDOWN',
    payload: { noncompreasons }
  }
}

export const setColPelAssetConditionDropdown = ({ assetconditions }) => {
  return {
    type: 'SAVE_COL_PEL_ASSET_CONDITION_DROPDOWN',
    payload: { assetconditions }
  }
}

export const overwriteAll = ({ groupedTableData }) => ({
  type: 'OVERWRITE_ALL_STATUSES',
  payload: { groupedTableData }
})

const processTableDataAssignments = (tableDataAssignments, groupId) =>
  tableDataAssignments.map(item => {
    const workorder0 = (item.workorder || [{}])[0]
    const sr0 = (workorder0.sr || [{}])[0]
    const pellocbuilding0 = (workorder0.pellocbuilding || [{}])[0]

    const failurereport = workorder0.failurereport || []
    const failurereportProblem = failurereport.find(item => item.type === 'PROBLEM')
    const failurereportCause = failurereport.find(item => item.type === 'CAUSE')
    const failurereportRemedy = failurereport.find(item => item.type === 'REMEDY')

    return {
      href: item.href, 
      assignmentid: item.assignmentid,
      apptrequired: item.apptrequired ? 'true' : 'false', 
      pelpermitrequired: workorder0.pelpermitrequired ? 'true' : 'false', 
      pelappointslotfinish: item.pelappointslotfinish,
      pelappointslotstart: item.pelappointslotstart,
      peldescription: item.peldescription,
      pelpermitref: item.pelpermitref,
      worktype: workorder0.worktype,
      targcompdate: workorder0.targcompdate,
      targstartdate: workorder0.targstartdate,
      pelsrtype: sr0.pelsrtype || '',
      wopriority: workorder0.wopriority,
      ticketid: workorder0.origrecordid,
      wonum: workorder0.wonum,
      wohref: workorder0.href,
      pluspcustomer: workorder0.pluspcustomer,
      pellocbuilding: pellocbuilding0.description,
      status: item.status,
      pelstatusdate: item.pelstatusdate,
      pelassignstart: item.pelassignstart,
      pelassignfinish: item.pelassignfinish,
      startdate: item.startdate,
      finishdate: item.finishdate,
      mtfmcof: workorder0.mtfmcof,
      failurecode: workorder0.failurecode,
      failurereportProblem: failurereportProblem?.failurecode ?? '',
      failurereportCause: failurereportCause?.failurecode ?? '',
      failurereportRemedy: failurereportRemedy?.failurecode ?? '',

      // needed for post back
      failurereportProblemHref: failurereportProblem?.href ?? '',
      failurereportCauseHref: failurereportCause?.href ?? '',
      failurereportRemedyHref: failurereportRemedy?.href ?? '',

      pelreasoncode: item?.pelreasoncode || '',
      default: {
        ...item
      },
      edited: item.edited || [],
      groupId
    }
  })

const processTableDataAssets = (tableDataAssignments, groupId) =>
  tableDataAssignments.reduce((accum, cur) => {
    const workorder0 = (cur.workorder || [{}])[0]
    const multiassetlocci = workorder0.multiassetlocci || []
    return accum.concat(
      multiassetlocci.map(multi => ({
        href: multi.href, // needed for post back
        assignmentid: cur.assignmentid,
        wonum: workorder0.wonum,
        multiid: multi.multiid,
        assetnum: multi.assetnum,
        location: multi.location,
        pelworkcomp: Boolean(multi.pelworkcomp),
        pelcompdate: multi.pelcompdate,
        pelworkoutcome: multi.pelworkoutcome, // populate dropdown from above
        pelcompnotes: multi.pelcompnotes,
        pelnoncompreason: multi.pelnoncompreason,
        newreading: multi.asset?.[0]?.assetmeter?.[0]?.newreading || '',
        lastreading: multi.asset?.[0]?.assetmeter?.[0]?.lastreading || '',
        asset: multi.asset,
        edited: multi.edited || [],
        groupId
      }))
    )
  }, [])

const getColDefsToBlankRow = colDefsToRow =>
  colDefsToRow.reduce((accum, item) => ({ ...accum, ...{ [item.field]: '' } }), {})

export const blankRow = getColDefsToBlankRow(colDefsAssignments)
const extendWithAdditionalFieldsAssignments = getColDefsToBlankRow(additionalFieldsAssignments)
const extendWithAdditionalFieldsAssets = getColDefsToBlankRow(additionalFieldsAssets)

export const createWorkGroup = ({ groupId, groupName, member }) => ({
  type: 'CREATE_STATUS_ITEM',
  payload: {
    groupId,
    groupName,
    tableDataAssignments: processTableDataAssignments(member, groupId).map(item => ({
      ...item,
      ...extendWithAdditionalFieldsAssignments
    })),
    tableDataAssets: processTableDataAssets(member, groupId).map(item => ({
      ...item,
      ...extendWithAdditionalFieldsAssets
    }))
  }
})

export const updateRowAssignments = ({ rowData }) => ({
  type: 'UPDATE_ROW_ASSIGNMENTS',
  payload: { rowData }
})
export const updateRowAssets = ({ rowData }) => ({
  type: 'UPDATE_ROW_ASSETS',
  payload: { rowData }
})

export const postRowSuccess = ({
  groupId,
  assignmentid,
  allowedStatus,
  rowAssetsMultiIdChanged,
  rowAssetsMultiIdLock
}) => ({
  type: 'POST_ROW_SUCCESS',
  payload: {
    groupId,
    assignmentid,
    allowedStatus,
    rowAssetsMultiIdChanged,
    rowAssetsMultiIdLock
  }
})
export const postRowError = ({
  groupId,
  assignmentid,
  rowAssetsMultiIdChanged,
  rowAssetsMultiIdLock,
  error
}) => ({
  type: 'POST_ROW_ERROR',
  payload: {
    groupId,
    assignmentid,
    rowAssetsMultiIdChanged,
    rowAssetsMultiIdLock,
    error
  }
})

export const updatePostRows = ({ postRowUpdatesAssignments, postRowUpdatesAssets }) => ({
  type: 'UPDATE_POST_ROWS',
  payload: {
    postRowUpdatesAssignments,
    postRowUpdatesAssets
  }
})

export const resetGrid = () => ({
  type: 'RESET'
})

export const clearWorkGroup = ({ groupId }) => ({
  type: 'CLEAR_STATUS_ITEM',
  payload: {
    groupId
  }
})

export const setMainDropdownOptions = ({ mainDropdownOptions }) => ({
  type: 'SET_MAIN_DROPDOWN_OPTIONS',
  payload: {
    mainDropdownOptions
  }
})

export const setAllowedStatuses = ({ allowedStatuses }) => ({
  type: 'SET_ALLOWED_STATUSES',
  payload: {
    allowedStatuses
  }
})

export const setMainDropdownOptionHasData = ({ id, hasData }) => ({
  type: 'SET_MAIN_DROPDOWN_OPTION_HAS_DATA',
  payload: {
    id,
    hasData
  }
})

const processTableDataForUpdate = ({
  state,
  groupedTableData,
  groupId,
  groupName,
  tableDataAssignments,
  tableDataAssets
}) => ({
  ...state,
  groupedTableData: {
    ...groupedTableData,
    [groupId]: {
      groupName,
      tableDataAssignments,
      tableDataAssets
    }
  }
})

const getChanged = (existing, newRow) =>
  Object.keys(newRow).some(key => {
    const existingVal = existing[key] ?? ''
    const newVal = newRow[key]
    if (Array.isArray(newVal)) {
      return newVal.some(ar => existingVal.indexOf(ar) !== -1)
    }
    return newVal !== existingVal
  })

export const reducer = (state = initState, { type, payload }) => {
  const { groupedTableData } = state
  const { addErrorToast } = useToast()

  switch (type) {
    case 'SAVE_COL_ASSIGNMENT_STATUS_DROPDOWN': {
      const { dropdowns } = state
      const { statuses } = payload
      return {
        ...state,
        dropdowns: {
          ...dropdowns,
          statuses
        }
      }
    }
    case 'SAVE_COL_ASSIGNMENT_REASONCODE_DROPDOWN': {
      const { dropdowns } = state
      const { reasoncodes } = payload
      return {
        ...state,
        dropdowns: {
          ...dropdowns,
          reasoncodes
        }
      }
    }
    case 'SAVE_COL_WORK_OUTCOME_DROPDOWN': {
      const { dropdowns } = state
      const { workoutcomes } = payload

      return {
        ...state,
        dropdowns: {
          ...dropdowns,
          workoutcomes
        }
      }
    }
    case 'SAVE_COL_PEL_NON_COMP_REASON_DROPDOWN': {
      const { dropdowns } = state
      const { noncompreasons } = payload
      return {
        ...state,
        dropdowns: {
          ...dropdowns,
          noncompreasons
        }
      }
    }
    case 'SAVE_COL_PEL_ASSET_CONDITION_DROPDOWN': {
      const { dropdowns } = state
      const { assetconditions } = payload
      return {
        ...state,
        dropdowns: {
          ...dropdowns,
          assetconditions
        }
      }
    }
    
    case 'OVERWRITE_ALL_STATUSES': {
      const { groupedTableData } = payload
      const timestamp = createTimeStamp()
      return {
        ...state,
        groupedTableData,
        gridOverwrite: timestamp,
        gridAddWorkGroup: null,
        gridRowRemove: null,
        postRowUpdatesAssignments: [],
        dropdowns: state.dropdowns
      } 
    }
    case 'CREATE_STATUS_ITEM': {
      const { groupId, groupName, tableDataAssignments, tableDataAssets } = payload
      return processTableDataForUpdate({
        state: {
          ...state,
          gridAddWorkGroup: groupId, 
          gridRowRemove: null 
        },
        groupedTableData,
        groupId,
        groupName,
        tableDataAssignments,
        tableDataAssets
      })
    }
    case 'UPDATE_POST_ROWS': {
      const { postRowUpdatesAssignments, postRowUpdatesAssets } = payload
      return {
        ...state,
        postRowUpdatesAssignments, 
        postRowUpdatesAssets
      }
    }
    
    case 'CLEAR_STATUS_ITEM': {
      const { mainDropdownOptions } = state
      const { groupId } = payload
      const groupIds = Object.keys(state.groupedTableData || {})
      const groupedTableDataExcluded = groupIds.reduce((accum, key) => {
        const tableData = groupedTableData[key]
        if (key !== groupId) {
          return { ...accum, [key]: tableData }
        }
        return accum
      }, {})
      return {
        ...state,
        groupedTableData: groupedTableDataExcluded,
        gridRowRemove: groupId, 
        gridAddWorkGroup: null, 
        mainDropdownOptions: excludeHasDataFromOptions(groupId, mainDropdownOptions)
      }
    }
    case 'UPDATE_ROW_ASSIGNMENTS': {
      const { rowData } = payload
      const { groupId, assignmentid } = rowData
      
      const { existingRow, tableData } = findAssignmentAndGroup(groupedTableData, assignmentid)

      const isChanged = getChanged(existingRow, rowData)
      const { locked } = existingRow

      const updateRow = item => ({
        ...item,
        ...rowData,
        edited: extendArray(item.edited, diffChange(item, rowData))
      })

      return !locked && !isChanged
        ? state
        : {
            ...state,
            groupedTableData: {
              ...groupedTableData,
              [groupId]: {
                ...tableData,
                tableDataAssignments: tableData.tableDataAssignments.map(item =>
                  item.assignmentid !== assignmentid ? item : updateRow(item)
                )
              }
            }
          }
    }
    case 'UPDATE_ROW_ASSETS': {
      const { rowData } = payload
      const { groupId, assignmentid, multiid } = rowData
      const { tableData } = findAssignmentAndGroup(groupedTableData, assignmentid)
      const { tableDataAssets, tableDataAssignments } = tableData

      const existingRow = tableDataAssets.find(item => item.multiid === parseInt(multiid, 10))
      const isChanged = getChanged(existingRow, rowData)
      return !isChanged
        ? state
        : {
            ...state,
            groupedTableData: {
              ...groupedTableData,
              [groupId]: {
                ...tableData,
                tableDataAssets: tableDataAssets.map(item =>
                  item.multiid !== multiid
                    ? item
                    : {
                        ...item,
                        ...rowData,
                        edited: extendArray(item.edited, diffChange(item, rowData))
                      }
                ),
                tableDataAssignments: tableDataAssignments.map(item =>
                  item.assignmentid !== assignmentid
                    ? item
                    : { ...item, edited: item.edited.concat(['multiassetlocci']) }
                )
              }
            }
          }
    }
    case 'POST_ROW_SUCCESS': {
      const {
        groupId,
        assignmentid,
        allowedStatus,
        rowAssetsMultiIdChanged,
        rowAssetsMultiIdLock
      } = payload
      const { existingRow, tableData } = findAssignmentAndGroup(
        state.groupedTableData,
        assignmentid
      )
      const { groupName, tableDataAssignments, tableDataAssets } = tableData

      return processTableDataForUpdate({
        state,
        groupedTableData,
        groupId,
        groupName,
        tableDataAssignments: tableDataAssignments.map(item =>
          item.assignmentid === assignmentid
            ? {
                ...item,
                committed: `${COMMIT_SUCCESS}: ${allowedStatus}`,
                status: allowedStatus,
                locked: true,
                error: false
              }
            : item
        ),
        tableDataAssets: tableDataAssets.map(item =>
          rowAssetsMultiIdLock.indexOf(item.multiid) !== -1
            ? {
                ...item,
                committed:
                  rowAssetsMultiIdChanged.indexOf(item.multiid) !== -1
                    ? COMMIT_SUCCESS
                    : item.committed,
                locked: true,
                error: false
              }
            : item
        )
      })
    }
    case 'POST_ROW_ERROR': {
      const { groupId, assignmentid, rowAssetsMultiIdChanged, error } = payload
      const { existingRow, tableData } = findAssignmentAndGroup(
        state.groupedTableData,
        assignmentid
      )
      const { groupName, tableDataAssignments, tableDataAssets } = tableData
      addErrorToast({
        title: 'Error Committing to Maximo',
        subtitle: '',
        caption: error.replace('Error: ', '')
      })
      return processTableDataForUpdate({
        state,
        groupedTableData,
        groupId,
        groupName,
        tableDataAssignments: tableDataAssignments.map(item =>
          item.assignmentid === assignmentid
            ? {
                ...item,
                committed: COMMIT_FAIL,
                error
              }
            : item
        ),
        tableDataAssets: tableDataAssets.map(item =>
          rowAssetsMultiIdChanged.indexOf(item.multiid) !== -1
            ? {
                ...item,
                committed: COMMIT_FAIL,
                error
              }
            : item
        )
      })
    }
    case 'RESET': {
      return {
        ...state,
        ...initState,
        gridOverwrite: createTimeStamp(), 
        isResetStatusesSelection: !state.isResetStatusesSelection,
        dropdowns: state.dropdowns,
        mainDropdownOptions: state.mainDropdownOptions.map(({ hasData, ...rest }) => rest)
      }
    }
    case 'SET_MAIN_DROPDOWN_OPTIONS': {
      const { mainDropdownOptions } = payload
      return {
        ...state,
        mainDropdownOptions
      }
    }
    case 'SET_ALLOWED_STATUSES': {
      const { allowedStatuses } = payload
      return {
        ...state,
        allowedStatuses
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
