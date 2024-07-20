import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { LicenseManager } from 'ag-grid-enterprise'
import { useSession } from '../../auth/SessionProvider'
import {
  getAfpbulkMainStatuses,
  getAfpbulkQueries,
  getColNewAssignmentStatusDropdown,
  getColNewAssignmentReasoncodeDropdown,
  getColPelNonCompReasonDropdown,
  getColWorkOutcomeDropdown
} from '../services/afpbulkService'
import { useToast } from '../../../shared/toasts/ToastProvider'
import { useGridCtx } from '../context/grid-context'

import { StatusSelection } from './StatusSelection'
import { DataGridAssignments } from './DataGrid/DataGridAssignments'
import { DataGridAssets } from './DataGrid/DataGridAssets'

import { FileMenuAfpbulk } from './FileMenuAfpbulk'

import { Form } from './Form/Form'

import { LICENSE_KEY } from '../../../shared/grid/grid'
import { SUBCON_AFP_BULK_UPDATES } from '../../../shared/grid/constants'

import './DataGrid/DataGrid.scss'
import {
  saveColAssignmentStatusDropdown,
  saveColAssignmentReasonCodeDropdown,
  setColPelAssetConditionDropdown,
  saveColPelNonCompReasonDropdown,
  saveColWorkOutcomeDropdown,
  setAllowedStatuses,
  setMainDropdownOptions
} from '../context/grid-reducer'
import { FileImportExport } from './FileImportExport/FileImportExport'
import { useRegistry } from '../../../shared/RegistryProvider'

LicenseManager.setLicenseKey(LICENSE_KEY)

export const Wrapper = () => {
  const { gridState, dispatchGrid } = useGridCtx()
  const { groupedTableData } = gridState
  const groupIds = Object.keys(groupedTableData || {})

  const { addErrorToast } = useToast()

  const [session] = useSession()
  const { sessionId, applications } = session
  const applicationsString = JSON.stringify(applications || {})

  const [{ pelAssetConds }] = useRegistry()

  useEffect(() => {
    if (pelAssetConds?.length) {
      dispatchGrid(
        setColPelAssetConditionDropdown({
          assetconditions: pelAssetConds.map(({ description, value }) => {
            return {
              text: description,
              value
            }
          })
        })
      )
    }
  }, [])

  useEffect(() => {
    if (sessionId && applicationsString) {
      getAfpbulkQueries()
        .then(({ data }) => {
          const arr = data?.member
          dispatchGrid(
            setMainDropdownOptions({
              mainDropdownOptions: arr.map(item => ({
                id: item.clausename,
                text: item.description,
                value: item.clausename
              }))
            })
          )
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: 'Error loading afpbulk - groupedTableData',
            caption: message
          })
        })

      getAfpbulkMainStatuses()
        .then(({ data }) => {
          const str = data?.return
          const arr = str ? str.split(',') : []

          dispatchGrid(
            setAllowedStatuses({
              allowedStatuses: arr.map(item => ({
                id: item
              }))
            })
          )
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: 'Error loading afpbulk - groupedTableData',
            caption: message
          })
        })

      getColNewAssignmentStatusDropdown()
        .then(ret => {
          dispatchGrid(saveColAssignmentStatusDropdown({ statuses: ret }))
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: 'Error - getting assignment status dropdown',
            caption: message
          })
        })

      getColNewAssignmentReasoncodeDropdown()
        .then(ret => {
          dispatchGrid(saveColAssignmentReasonCodeDropdown({ reasoncodes: ret }))
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: 'Error - getting assignment reason code dropdown',
            caption: message
          })
        })

      getColWorkOutcomeDropdown()
        .then(member => {
          dispatchGrid(saveColWorkOutcomeDropdown({ workoutcomes: member }))
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: 'Error - getting workoutcome dropdown',
            caption: message
          })
        })

      getColPelNonCompReasonDropdown()
        .then(member => {
          dispatchGrid(saveColPelNonCompReasonDropdown({ noncompreasons: member }))
        })
        .catch(({ message }) => {
          addErrorToast({
            subtitle: 'Error - getting pelnoncompreason dropdown',
            caption: message
          })
        })
    }
  }, [sessionId, applicationsString])

  return (
    <div className="afpbulk--wrapper">
      <Helmet>
        <title>{SUBCON_AFP_BULK_UPDATES}</title>
      </Helmet>
      <FileMenuAfpbulk />

      <section className="afpbulk-main">
        <nav className="afpbulk-main-nav">
          <StatusSelection />
          {groupIds.length ? <Form /> : null}
        </nav>

        <div className="ag-theme-alpine afpbulk__gridwrapper">
          <DataGridAssignments />
          <DataGridAssets />
        </div>
        <footer className="afpbulk-footer">{groupIds.length ? <FileImportExport /> : null}</footer>
      </section>
    </div>
  )
}
