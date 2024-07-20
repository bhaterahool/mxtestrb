import React, { useRef, useEffect, useState } from 'react'
import { getAfpbulkWorkGroupAssignments } from '../services/afpbulkService'
import { useToast } from '../../../shared/toasts/ToastProvider'
import {
  clearWorkGroup,
  createWorkGroup,
  setMainDropdownOptionHasData,
  resetGrid
} from '../context/grid-reducer'
import { useGridCtx } from '../context/grid-context'
import {
  getWorkGroupEditedOrLockedRows,
  getWorkGroupEditedRows
} from '../services/getChangesForPost'
import { DropdownDataLoader, getLoadedState } from '../../../shared/components/DropdownDataLoader'
import { ResetTableWithFilter } from '../../../modules/afpbulk/components/Form/ResetTableWithFilter'
import { Loading } from '../../../modules/shared-components/Loading'


export const StatusSelection = () => {
  const { addErrorToast } = useToast()
  const { gridState, dataGridRefAssignments, gridReadyAssignments, dataGridRefAssets, gridReadyAssets, dispatchGrid } = useGridCtx()

  const { mainDropdownOptions } = gridState
  const [selectedOptionFix, setSelectedOptionFix] = useState(false)
  const [showFilterResetModal, setShowFilterResetModal] = useState(false)
  const [dropdownSelectedItem, setDropdownSelectedItem] = useState({})
  const [isLoading, setLoading] = useState(false)

  const cacheDropdownOptions = useRef({})
  useEffect(() => {
    if (cacheDropdownOptions.current !== mainDropdownOptions) {
      setSelectedOptionFix(prev => !prev)
      cacheDropdownOptions.current = mainDropdownOptions
    }
  }, [mainDropdownOptions])

  const { groupedTableData } = gridState
  const groupIds = Object.keys(groupedTableData || {})

  const isGridHasData = () => {
    const hasData = mainDropdownOptions.some((dropdownOption) => dropdownOption?.hasData)

    if (hasData) {
      setShowFilterResetModal(true)
      return true
    }

    return false
  }

  const handleSelection = (id, name, checkData = true) => {

    setDropdownSelectedItem({id, name})

    const exist = getLoadedState(mainDropdownOptions, id)
    const isDataExist = checkData ? isGridHasData() : false

    if (!checkData && !exist && !isDataExist) {
      setLoading(true)
    }
    
    return !exist && !isDataExist
      ? getAfpbulkWorkGroupAssignments(id)
          .then(member => {
            dispatchGrid(setMainDropdownOptionHasData({ id, hasData: !!member.length }))
            dispatchGrid(createWorkGroup({ groupId: id, groupName: name, member }))
            setLoading(false)
          })
          .catch(({ message }) => {
            setLoading(false)
            addErrorToast({
              subtitle: `Error loading query = "${name}""`,
              caption: message
            })
          })
      : new Promise(resolve => resolve())
  }
  const handleDelete = optionId => {
    const tableData = groupedTableData[optionId]
    const tableDataAssignmentsEditedOrLocked = getWorkGroupEditedOrLockedRows(tableData)
    if (tableDataAssignmentsEditedOrLocked.length > 0) {
      const groupName = tableData?.groupName
      addErrorToast({
        subtitle: `Error removing query - ${groupName}`,
        caption: 'You cannot remove this table because you have edited or commited items'
      })
    } else {
      dispatchGrid(clearWorkGroup({ groupId: optionId }))
    }
  }

  const gridApiAssignments = gridReadyAssignments && dataGridRefAssignments.current.api
  const gridApiAssets = gridReadyAssets && dataGridRefAssets.current.api

  const handleRequestSubmit = () => {

    if (gridApiAssignments && gridApiAssets) {
      dispatchGrid(resetGrid())
    }

    const { id, name } = dropdownSelectedItem

    if (id && name) {
      handleSelection(id, name, false)
    }

    setShowFilterResetModal(false)
  }
  
  const handleRequestClose = () => {
    setShowFilterResetModal(false)
  }

  return (
    <>
      <ResetTableWithFilter 
        isOpen={showFilterResetModal} 
        onRequestSubmit={handleRequestSubmit} 
        onRequestClose={handleRequestClose}
      />
      <DropdownDataLoader
        {...{
          label: 'Status',
          placeholder: 'Select Assignments Query...',
          options: mainDropdownOptions,
          selectedOptionId: `${selectedOptionFix}`, 
          existingKeys: groupIds,
          handleSelection,
          handleDelete
        }}
      />

      {isLoading ? <Loading modal /> : null}
    </>
  )
}
