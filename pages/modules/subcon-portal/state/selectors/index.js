export const getSelectedAssignment = state => {
  if (!state.assignments.selected) return null

  return state.assignments.records.get(state.assignments.selected)
}

export const getSelectedAssignmentId = state => {
  if (!state.assignments.selected) return null

  return state.assignments.selected
}

export const getAssignments = state => Array.from(state.assignments.records.values())

export const getIsAssignmentFromDirty = state => state.isAssignmentFromDirty