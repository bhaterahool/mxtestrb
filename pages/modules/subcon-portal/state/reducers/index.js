import _ from 'lodash'
import { ACTION_TYPES } from '../actions'

const initialState = {
  assignments: {
    records: new Map(),
    selected: null
  },
  isAssignmentFromDirty: false
}

const normalise = assignment => {
  const workorder = Array.isArray(assignment.workorder)
    ? assignment.workorder[0]
    : assignment.workorder

  return {
    ...assignment,
    workorder: {
      ...workorder,
      ...(workorder?.sr && {
        sr: Array.isArray(workorder.sr) ? workorder.sr[0] : workorder.sr
      })
    }
  }
}

const getSelectedAssignment = state => {
  const { assignments } = state

  if (!assignments.records.size) {
    return null
  }

  if (!assignments.records.has(assignments.selected)) {
    return _.last(Array.from(assignments.records.keys()))
  }

  return assignments.selected
}

export const rootReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SELECT_SEARCH_RESULT:
      return {
        ...state,
        assignments: {
          ...state.assignments,
          records: new Map([
            ...state.assignments.records,
            [
              action.payload.assignmentid,
              state.assignments.records.get(action.payload.assignmentid) ??
                normalise(action.payload.record)
            ]
          ]),
          selected: action.payload.assignmentid
        }
      }

    case ACTION_TYPES.UPDATE_ASSIGNMENT:
      return {
        ...state,
        assignments: {
          ...state.assignments,
          records: new Map([
            ...state.assignments.records,
            [action.payload.assignmentid, normalise(action.payload.record)]
          ]),
          selected: action.payload.assignmentid
        }
      }

    case ACTION_TYPES.REMOVE_SEARCH_RESULT:
      state.assignments.records.delete(action.payload.assignmentid)

      return {
        ...state,
        assignments: {
          ...state.assignments,
          records: new Map(state.assignments.records),
          selected: getSelectedAssignment(state)
        }
      }

    case ACTION_TYPES.SET_SELECTED_SEARCH_ID:
      return {
        ...state,
        assignments: {
          ...state.assignments,
          selected: action.payload.assignmentid
        }
      }

    case ACTION_TYPES.SET_ASSIGNMENT_FORM_DIRTY:
      return {
        ...state,
        isAssignmentFromDirty: action.payload.status
      }
    case ACTION_TYPES.SET_RESET_ASSIGNMENTS:
      return initialState

    default:
      return {
        ...initialState,
        ...state
      }
  }
}
