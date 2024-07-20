export const ACTION_TYPES = {
  SELECT_SEARCH_RESULT: 'SELECT_SEARCH_RESULT',
  REMOVE_SEARCH_RESULT: 'REMOVE_SEARCH_RESULT',
  UPDATE_ASSIGNMENT: 'UPDATE_ASSIGNMENT',
  SET_ASSIGNMENT_FORM_DIRTY: 'SET_ASSIGNMENT_FORM_DIRTY',
  SET_RESET_ASSIGNMENTS: 'SET_RESET_ASSIGNMENTS'
}

export const selectSearchResult = assignment => {
  return {
    type: ACTION_TYPES.SELECT_SEARCH_RESULT,
    payload: {
      assignmentid: assignment.assignmentid,
      record: assignment
    }
  }
}

export const updateAssignment = assignment => {
  return {
    type: ACTION_TYPES.UPDATE_ASSIGNMENT,
    payload: {
      assignmentid: assignment.assignmentid,
      record: assignment
    }
  }
}

export const removeSearchResult = assignment => {
  return {
    type: ACTION_TYPES.REMOVE_SEARCH_RESULT,
    payload: {
      assignmentid: assignment.assignmentid
    }
  }
}

export const setAssignmentFormDirty = status => ({
  type: ACTION_TYPES.SET_ASSIGNMENT_FORM_DIRTY,
  payload: {
    status
  }
})

export const setResetAssignments = status => ({
  type: ACTION_TYPES.SET_RESET_ASSIGNMENTS,
  payload: {
    status
  }
})
