import React, { useEffect, useRef, useState } from 'react'
import get from 'lodash/get'
import { useSelector, useDispatch } from 'react-redux'
import { Tabs, Tab, Button, Modal } from 'carbon-components-react'
import PropTypes from 'prop-types'
import { Renew32 } from '@carbon/icons-react'
import * as Form from '../components/form'
import { Navigation, Assets } from '../components'
import { NavItem } from '../components/navigation/NavItem'
import { WorkLogsLoadable } from '../../../shared/worklog/components'
import { MitigationEventsLoadable } from '../../../shared/mitigation-event/components'
import { AttendanceList } from '../../../shared/attendance/components'
import * as selectors from '../state/selectors'
import * as actions from '../state/actions'
import { useRegistry } from '../../../shared/RegistryProvider'
import { DoclinksList } from '../../../shared/doclinks/DoclinksList'
import { RequiredDocsList } from '../../../shared/doclinks/RequiredDocsList'
import { api } from '../../app/api'
import getRelativePath from '../../../util/getRelativePath'
import { useToast } from '../../../shared/toasts/ToastProvider'
import { useObject } from '../../../shared/hooks/useObject'
import { useSubcontractSearchProvider } from '../search/SubcontractSearchProvider'
import checkEditingCapability from '../components/status-change/checkEditingCapability'
import CheckAssetEditCapability from '../components/assets/CheckAssetEditCapability'
import CheckAttendanceEditCapability from '../../../shared/attendance/components/CheckAttendanceEditCapability'
import CheckWorkLogDeleteCapability from '../../../shared/worklog/components/CheckWorkLogDeleteCapability'
import { namespace } from '../../../util/namespace'
import config from '../../app/config'
import { Loading } from '../../shared-components/Loading'
import { Summary } from '../components/summary'
import { fetchAssignmentById } from '../services/apiHandler'

export const Assignment = ({ isOpen, loadAssignmentDetail, assignmentId }) => {
  const selectedAssignment = useSelector(selectors.getSelectedAssignment)
  const selectedAssignmentId = useSelector(selectors.getSelectedAssignmentId)
  const isAssignmentFromDirty = useSelector(selectors.getIsAssignmentFromDirty)
  const [refresh, setRefresh] = useState(false)
  const [refreshSummary, setRefreshSummary] = useState(false)

  const selectedAssignmentRef = useRef(selectedAssignmentId)

  const assignments = useSelector(selectors.getAssignments)

  const { loading, response } = useSubcontractSearchProvider()

  const [refreshDocs, setRefreshDocs] = useState(false)

  const [showSummary, setShowSummary] = useState(!loadAssignmentDetail)

  const fullAssignmentLoaded = !!selectedAssignment?.createddate 

  const [confirmationModalStatus, setConfirmationModalStatus] = useState(false)

  const [reloadLoadingStatus, setReloadLoadingStatus] = useState(false)

  const dispatch = useDispatch()

  const pathName = window.location.pathname

  useEffect(() => {
    return () => {
      if (window.location.pathname !== '/subcontractors') {
        dispatch(actions.setResetAssignments())
      }
    }
  }, [pathName])

  let pelreqdocs = []
  let rawPelReqDocs = []

  const handleSelect = record => {
    if (record.assignmentid !== 'summary') {
      setShowSummary(false)
      dispatch(actions.selectSearchResult(record))

      pelreqdocs = []
      rawPelReqDocs = []
    } else {
      setShowSummary(true)
    }
  }

  const setIsFormDirty = status => {
    if (isAssignmentFromDirty !== status) {
      dispatch(actions.setAssignmentFormDirty(status))
    }
  }

  useEffect(() => {
    if (showSummary && selectedAssignment) setShowSummary(false)
    if (!showSummary && !selectedAssignment && !loadAssignmentDetail) setShowSummary(true)
  }, [selectedAssignment])

  useEffect(() => {
    const [updatedData] = response.filter(
      ({ assignmentid }) => assignmentid === selectedAssignment?.assignmentid
    )
    if (updatedData) {
      dispatch(actions.selectSearchResult(updatedData))
    }
    setRefreshDocs(current => !current)
  }, [loading])

  const loadAssignment = async assignmentid => {
    try {
      const res = await api.get('/pelos/PELASSIGNMENT', {
        params: namespace('oslc', {
          select: config.search.pelassignment.fields,
          where: `assignmentid=${assignmentid}`
        })
      })

      return res?.data?.member?.[0]
    } catch (err) {
      
      console.log(err)
    }
  }

  useEffect(async () => {
    const currentAssigmentId = assignmentId || selectedAssignmentId
    let alreadyLoadedAssingment = false
    let delay = 0

    if (loadAssignmentDetail) {
      const assignment = assignments?.filter(row => row.assignmentid === assignmentId) ?? []

      if (assignment?.length) {
        setReloadLoadingStatus(true)
        alreadyLoadedAssingment = true
        delay = 5
      }

      if (currentAssigmentId !== selectedAssignmentRef.current) {
        if (assignment?.length) {
          selectedAssignmentRef.current = currentAssigmentId
          dispatch(actions.updateAssignment(assignment[0]))
        }
      }
    }

    if (!alreadyLoadedAssingment && currentAssigmentId && !showSummary) {
      setReloadLoadingStatus(true)
      selectedAssignmentRef.current = currentAssigmentId
      const assignment = await loadAssignment(currentAssigmentId)
      if (assignment && assignment.assignmentid === selectedAssignmentRef.current) {
        dispatch(actions.updateAssignment(assignment))
      }
    }
    pelreqdocs = []
    rawPelReqDocs = []
    setRefreshDocs(current => !current)
    const timer = setTimeout(() => setReloadLoadingStatus(false), delay * 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [selectedAssignmentId, showSummary, assignmentId])

  const reload = async () => {
    if (selectedAssignmentId) {
      setRefresh(Math.random())
      setReloadLoadingStatus(true)

      selectedAssignmentRef.current = selectedAssignmentId
      const assignment = await loadAssignment(selectedAssignment?.assignmentid)

      if (assignment && assignment.assignmentid === selectedAssignmentRef.current) {
        dispatch(actions.updateAssignment(assignment))
      }

      pelreqdocs = []
      rawPelReqDocs = []
      setRefreshDocs(current => !current)
      setReloadLoadingStatus(false)
    }
  }

  const handleClose = record => dispatch(actions.removeSearchResult(record))

  const [{ pelassignmentschema, logTypes, eventTypes, failureReasons }] = useRegistry()

  const getInputValue = data => path => get(data, path)

  const { data } = useObject(
    api,
    'pelreqdocs',
    selectedAssignment
      ? `oslc.select=*&oslc.where=wonum=${`"${selectedAssignment?.workorder?.wonum}"`}`
      : null,
    false,
    refreshDocs
  )

  pelreqdocs =
    data?.member?.filter(
      doc =>
        doc?.objectname !== 'ASSIGNMENT' || doc?.assignmentid === selectedAssignment?.assignmentid
    ) ?? []

  rawPelReqDocs = data?.member ?? []

  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const saveDataToMaximo = formData => {
    const { peldescription, wplabor, wpservice, ...assignment } = formData

    if (!Array.isArray(assignment.workorder)) {
      assignment.workorder = [assignment.workorder]
      delete assignment.workorder.sr
    }

    if (assignment?.workorder?.[0]?.failurecode === '') {
      delete assignment.workorder[0].failurereport
    }

    if (assignment?.workorder[0]?.failurereport?.length > 0) {
      const filteredFailureReport = assignment.workorder[0].failurereport.filter(
        value => value.failurecode
      )
      if (filteredFailureReport.length === 0) {
        delete assignment.workorder[0].failurereport
      } else {
        assignment.workorder[0].failurereport = filteredFailureReport
      }
    }

    if (
      assignment?.workorder &&
      assignment?.workorder?.[0]?.targstartdate &&
      assignment.workorder?.[0]?.targcompdate
    ) {
      delete assignment.workorder[0]?.targstartdate
      delete assignment.workorder[0]?.targcompdate
    }

    api
      .post(getRelativePath(selectedAssignment.href), assignment, {
        headers: {
          patchtype: 'MERGE',
          'x-method-override': 'PATCH',
          'Content-Type': 'application/json',
          properties: config.search.pelassignment.fields
        }
      })
      .then(res => {
        addSuccessToast({
          subtitle: 'Changes saved successfully'
        })

        if (res?.data) {
          dispatch(actions.updateAssignment(res.data))
        }

        
        return true
      })
      .catch(error => {
        addPersistentErrorToast({
          subtitle: error.message
        })
        return false
      })
  }

  const onSubmit = (formData = selectedAssignment) => {
    if (
      formData?.workorder?.failurecode === selectedAssignment?.workorder?.failurecode &&
      formData?.workorder?.failurecode.length > 0
    ) {
      
      const clearFailureData = {
        workorder: {
          failurecode: ''
        }
      }

      api
        .post(getRelativePath(selectedAssignment.href), clearFailureData, {
          headers: {
            patchtype: 'MERGE',
            'x-method-override': 'PATCH',
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          saveDataToMaximo(formData)
          return true
        })
        .catch(error => {
          addPersistentErrorToast({
            subtitle: error.message
          })
        })
    } else {
      saveDataToMaximo(formData)
      return true
    }
  }

  
  const isAssignmentReadonly = loadAssignmentDetail
    ? true
    : !checkEditingCapability(selectedAssignment?.status)

  const allowedDeleteStatus = !CheckWorkLogDeleteCapability(selectedAssignment?.status)

  
  const isMultiAssetReadonly = loadAssignmentDetail
    ? true
    : !CheckAssetEditCapability(selectedAssignment?.status)

  const isAttendanceReadonly = loadAssignmentDetail
    ? true
    : !CheckAttendanceEditCapability(selectedAssignment?.status)

  const handleRefreshButtonClick = async () => {
    if (isAssignmentFromDirty) {
      setConfirmationModalStatus(true)
    } else {
      await reload()
    }
  }

  const onConfirmationModalSubmit = async () => {
    setConfirmationModalStatus(false)
    await reload()
  }

  const onConfirmationModalClose = () => setConfirmationModalStatus(false)

  const tabEleRef = useRef(null)

  const [showRefreshButtonOnResizeStatus, setRefereshButtonOnResizeStatus] = useState(false)

  const handleAssignmentUpdate = data => {
    dispatch(actions.updateAssignment(data))
  }

  useEffect(() => {
    if (tabEleRef?.current) {
      const ro = new ResizeObserver(([{ target }]) => {
        if (target.offsetWidth > 0) {
          if (tabEleRef?.current) {
            const scrollWidth = tabEleRef?.current?.querySelector('ul')?.scrollWidth
            const offsetWidth = tabEleRef?.current?.offsetWidth

            if (offsetWidth < scrollWidth + 30) {
              setRefereshButtonOnResizeStatus(true)
            } else {
              setRefereshButtonOnResizeStatus(false)
            }
          }
        }
      })
      ro.observe(tabEleRef?.current)

      return () => ro.disconnect()
    }
  }, [tabEleRef?.current])

  const handleSummaryRefresh = status => setRefreshSummary(status)

  const RefreshButtonComponent = (className = '') =>
    !loadAssignmentDetail && (
      <div className={`${className}`}>
        <Button
          renderIcon={Renew32}
          key="refresh"
          iconDescription="Refresh"
          kind="ghost"
          tooltipPosition={!showRefreshButtonOnResizeStatus ? 'left' : 'right'}
          hasIconOnly
          onClick={handleRefreshButtonClick}
        />
      </div>
    )

  const [doclinkData, setDoclinkData] = useState(null)

  useEffect(() => {
    setDoclinkData(selectedAssignment)
  }, [selectedAssignment])

  const handleCreateDoclink = () => {
    fetchAssignmentById(selectedAssignment?.assignmentid)
      .then(res => {
        if (res.ok) {
          const { result } = res
          dispatch(actions.updateAssignment(result))
        }
      })
      .catch(() => {})
  }

  return (
    <>
      {!loadAssignmentDetail && (
        <Navigation
          items={assignments}
          selectedItem={selectedAssignment}
          itemRenderer={NavItem}
          handleSelect={handleSelect}
          handleClose={handleClose}
          isOpen={isOpen}
          showSummary={showSummary}
          refreshSummary={refreshSummary}
          handleSummaryRefresh={handleSummaryRefresh}
        />
      )}

      {showSummary && !loadAssignmentDetail && (
        <Summary
          isOpen={isOpen}
          refreshSummary={refreshSummary}
          handleSummaryRefresh={handleSummaryRefresh}
        />
      )}
      <Modal
        open={confirmationModalStatus}
        modalHeading="Are you sure you want to continue, your changes will be lost"
        primaryButtonText="Refresh"
        secondaryButtonText="Cancel"
        onRequestSubmit={onConfirmationModalSubmit}
        onRequestClose={onConfirmationModalClose}
      />

      {reloadLoadingStatus ? <Loading modal /> : null}
      {selectedAssignment && !showSummary && pelassignmentschema && (
        <main className={`pel-subcon pel--main ${isOpen ? '' : 'pel--searchlist-toggle'}`}>
          <div className="parent--tab">
            <div className="pel-tabs-wrapper" ref={tabEleRef}>
              <Tabs>
                <Tab label="Details">
                  {showRefreshButtonOnResizeStatus && RefreshButtonComponent()}
                  <section className="pel--container pel--has-footer-bar">
                    <Form.Details
                      assignment={selectedAssignment}
                      pelreqdocs={pelreqdocs}
                      getInputProps={Form.Helpers.getInputProps(
                        pelassignmentschema,
                        selectedAssignment
                      )}
                      getInputValue={getInputValue(selectedAssignment)}
                      failureReasons={failureReasons}
                      onSubmit={onSubmit}
                      loading={!fullAssignmentLoaded}
                      setIsFormDirty={setIsFormDirty}
                      refresh={refresh}
                      hideSaveButton={!!loadAssignmentDetail}
                    />
                  </section>
                </Tab>
                <Tab label="Attendance">
                  {showRefreshButtonOnResizeStatus && RefreshButtonComponent()}
                  {fullAssignmentLoaded && (
                    <AttendanceList
                      assignment={selectedAssignment}
                      hideCreateButton={isAttendanceReadonly}
                      reloadAssignment={setRefresh}
                      showLoading={setReloadLoadingStatus}
                      handleAssignmentUpdate={handleAssignmentUpdate}
                    />
                  )}
                </Tab>
                <Tab label="Assets">
                  {showRefreshButtonOnResizeStatus && RefreshButtonComponent()}
                  {fullAssignmentLoaded && (
                    <Assets
                      assignment={selectedAssignment}
                      hideCreateButton={isMultiAssetReadonly}
                      onSubmit={onSubmit}
                      setIsFormDirty={setIsFormDirty}
                      refresh={refresh}
                    />
                  )}
                </Tab>
                <Tab label="Log Notes">
                  {showRefreshButtonOnResizeStatus && RefreshButtonComponent()}
                  {fullAssignmentLoaded && (
                    <WorkLogsLoadable
                      id={selectedAssignment?.workorder?.wonum}
                      objectType="pelwologs"
                      logTypes={logTypes}
                      hideCreateButton={isAssignmentReadonly}
                      hideDeleteButton={allowedDeleteStatus}
                      isSubCon
                      refresh={refresh}
                    />
                  )}
                </Tab>

                {fullAssignmentLoaded && pelreqdocs && (
                  <Tab label="Documents">
                    {showRefreshButtonOnResizeStatus && RefreshButtonComponent()}
                    <br />
                    <h5>Required Documents</h5>
                    <RequiredDocsList
                      pelreqdocs={pelreqdocs}
                      doclinks={selectedAssignment?.workorder?.doclinks?.member ?? []}
                      href={selectedAssignment?.workorder?.doclinks?.href}
                      hideCreateButton={isAssignmentReadonly}
                      isSubCon
                      refresh={refresh}
                      handleCreateDoclink={handleCreateDoclink}
                      siteId={selectedAssignment?.workorder?.siteid || ''}
                      assignmentStatus={selectedAssignment?.status || ''}
                      refreshAssignment={reload}
                      pluscdoclinks={selectedAssignment?.workorder?.pluscdoclinks || []}
                    />
                    <h5>Documents</h5>
                    <DoclinksList
                      data={doclinkData}
                      pelreqdocs={rawPelReqDocs}
                      hideCreateButton
                      section="true"
                      isSubCon
                    />
                  </Tab>
                )}
                <Tab label="Mitigation Events">
                  {showRefreshButtonOnResizeStatus && RefreshButtonComponent()}
                  {fullAssignmentLoaded && (
                    <MitigationEventsLoadable
                      siteid={selectedAssignment?.workorder?.siteid}
                      wonum={selectedAssignment?.workorder?.wonum}
                      eventTypes={eventTypes}
                      hideCreateButton={isAssignmentReadonly}
                      hideDeleteButton={allowedDeleteStatus}
                      refresh={refresh}
                    />
                  )}
                </Tab>
              </Tabs>
            </div>
            {!showRefreshButtonOnResizeStatus && RefreshButtonComponent('refresh--button')}
          </div>
        </main>
      )}
    </>
  )
}

Assignment.propTypes = {
  isOpen: PropTypes.bool,
  assignmentId: PropTypes.number,
  loadAssignmentDetail: PropTypes.bool
}
