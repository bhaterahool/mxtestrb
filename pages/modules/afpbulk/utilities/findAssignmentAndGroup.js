export const findAssignmentAndGroup = (groups, assignmentid) => {
  return Object.entries(groups).reduce((acc, [, group]) => {
    const assignment = group.tableDataAssignments.find(
      assignment => assignment.assignmentid === Number(assignmentid)
    )
    return assignment ? { existingRow: assignment, tableData: group } : acc
  }, null)
}
