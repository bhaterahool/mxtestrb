export const LICENSE_KEY = '' export const compareEmptyNullUndef = (val1, val2) => (val1 !== '' ? val1 ?? val2 : val2)

export const editable = params => !params.data.locked

// reference: https://blog.ag-grid.com/deleting-selected-rows-and-cell-ranges-via-key-press/

export const agGridFixes = ({ handleAfterDelete = () => null }) => ({
  suppressKeyboardEvent: params => {
    const clearCells = (start, end, columns, gridApi) => {
      const itemsToUpdate = []

      for (let i = start; i <= end; i += 1) {
        const data = gridApi.rowModel.rowsToDisplay[i]?.data
        if (!data.locked) {
          columns.forEach(column => {
            data[column] = ''
          })
          itemsToUpdate.push(data)
          handleAfterDelete(data)
        }
      }

      if (itemsToUpdate.length) {
        gridApi.applyTransaction({ update: itemsToUpdate })
      }
    }

    if (!params.editing) {
      const isBackspaceKey = params.event.keyCode === 8
      const isDeleteKey = params.event.keyCode === 46

      if (isBackspaceKey || isDeleteKey) {
        // for each of our range selection
        params.api.getCellRanges().forEach(range => {
          const colIds = range.columns.map(col => col.colId)
          const startRowIndex = Math.min(range.startRow.rowIndex, range.endRow.rowIndex)
          const endRowIndex = Math.max(range.startRow.rowIndex, range.endRow.rowIndex)
          clearCells(startRowIndex, endRowIndex, colIds, params.api)
        })
      }
      return false
    }
  },
  // dummy column -fixes deselect all https://ag-grid.zendesk.com/hc/en-us/articles/360017575538-Preventing-users-from-being-locked-out-when-hiding-all-columns-from-column-menu
  onColumnVisible: params => {
    if (params.source === 'columnMenu' || params.source === 'toolPanelUi') {
      const noDisplayedCols = params.columnApi.getAllDisplayedColumns().length === 0
      if (noDisplayedCols) {
        params.columnApi.setColumnVisible('unhiddenColumn', true)
      } else {
        params.columnApi.setColumnVisible('unhiddenColumn', false)
      }
    }
  }
})
