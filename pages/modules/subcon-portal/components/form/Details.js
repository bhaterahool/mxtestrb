import React, { useEffect, useLayoutEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Checkbox,
  Button,
  Select,
  SelectItem,
  SelectSkeleton,
  CheckboxSkeleton
} from 'carbon-components-react'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import {
  PelTextInput,
  LongDescriptionModal,
  WorkHistoryModal,
  PelSelectInput,
  PelDateTimePicker
} from '../../../../shared/forms'
import * as Props from './props'
import * as Helpers from './helpers'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { WorkorderPriorityIcon } from './WorkorderPriorityIcon'
import { useMaxProp } from '../../../../shared/hooks/useMaxProp'
import { ObjectTooltip } from '../../../contact-center/components/ObjectTooltip'
import useFailurelist from '../../hooks/useFailurelist'
import { UpliftHistoryModal } from '../uplift/UpliftHistoryModal'
import { StatusChangeModal } from '../status-change/StatusChangeModal'
import { DependencyInfoModal } from '../../../../shared/forms/DependencyInfoModal'
import { UpliftRequestModal } from '../uplift/UpliftRequestModal'
import getStatusOptions from '../status-change/getStatusOptions'
import checkEditingCapability from '../status-change/checkEditingCapability'
import checkFailureEditingCapability from './checkFailureEditingCapability'
import { floatNumberWithComma } from '../../../../util/floatNumberWithComma'
import { AddressInput } from './AddressInput'
import { LocationHierarchy } from './LocationHierarchy'

export const Details = ({
  getInputProps,
  assignment,
  onSubmit,
  pelreqdocs,
  failureReasons,
  setIsFormDirty,
  refresh,
  hideSaveButton,
  loading
}) => {
  const priorityWarningMaxProp = useMaxProp('pel.mxplus.subcon.prioritywarning')
  const isHighPriority = priorityWarningMaxProp?.maxpropvalue?.propvalue?.includes(
    assignment.workorder.wopriority
  )

  const wpservice = assignment.wpservice?.[0] ?? null

  const { addErrorToast } = useToast()

  const {
    assignmentid,
    status,
    startdate,
    finishdate,
    pelassignstart,
    workorder: {
      targstartdate,
      targcompdate,
      mtfmjptype,
      sr: {
        reportdate = '',
        status: serviceStatus,
        status_description: serviceStatusDescription
      } = {},
      status: workOrderStatus,
      status_description: workOrderStatusDescription
    },
    status_description
  } = assignment

  const { handleSubmit, control, formState, register, watch, setValue, reset, getValues } = useForm(
    {
      defaultValues: {
        ...assignment
      }
    }
  )

  const [failurereason, setFailurereason] = useState()

  const { dirtyFields } = formState
  // Alternative isDirty because react-hook-form isDirty doesn't work correctly. https:
  const isDirty = Object.keys(dirtyFields).length > 0

  const {
    failureClassData,
    failureProblemData,
    failureCauseData,
    failureRemedyData,
    fetchData,
    fetchInitalData,
    loadingFailure
  } = useFailurelist(assignment.workorder.orgid)

  const failureClass = watch('workorder.failurecode', 'default')
  const failureProblem = watch('workorder.failurereport[0].failurecode', 'default')
  const failureCause = watch('workorder.failurereport[1].failurecode', 'default')
  const failureRemedy = watch('workorder.failurereport[2].failurecode', 'default')

  const onFailureClassChange = ({ target: { value } }) => {
    fetchData({ type: '', failurecode: value })
    setValue('workorder.failurereport[0].failurecode', 'default')
    setValue('workorder.failurereport[1].failurecode', 'default')
    setValue('workorder.failurereport[2].failurecode', 'default')
  }
  const onFailureProblemChange = ({ target: { value } }) => {
    fetchData({ type: 'PROBLEM', failurecode: value })
    setValue('workorder.failurereport[1].failurecode', 'default')
    setValue('workorder.failurereport[2].failurecode', 'default')
  }
  const onFailureCauseChange = ({ target: { value } }) => {
    fetchData({ type: 'CAUSE', failurecode: value })
    setValue('workorder.failurereport[2].failurecode', 'default')
  }

  const onFailureReasonChange = e => {
    const {
      target: { value }
    } = e
    setFailurereason(value)
  }

  useEffect(() => {
    setIsFormDirty(isDirty)
  }, [isDirty])

  useLayoutEffect(() => {
    setValue('workorder.failurecode', 'default')
    setValue('workorder.failurereport[0].failurecode', 'default')
    setValue('workorder.failurereport[1].failurecode', 'default')
    setValue('workorder.failurereport[2].failurecode', 'default')
    const { failurecode, failurereport } = assignment.workorder
    fetchInitalData({ failurecode, failurereport }).then(() => {
      setValue('workorder.failurecode', assignment.workorder.failurecode || 'default')
      setValue(
        'workorder.failurereport[0].failurecode',
        assignment.workorder.failurereport?.[0]?.failurecode || 'default'
      )
      setValue(
        'workorder.failurereport[1].failurecode',
        assignment.workorder.failurereport?.[1]?.failurecode || 'default'
      )
      setValue(
        'workorder.failurereport[2].failurecode',
        assignment.workorder.failurereport?.[2]?.failurecode || 'default'
      )
    })
  }, [assignment.workorder.failurecode, assignment.workorder.failurereport, refresh])

  useEffect(() => {
    setValue('startdate', assignment.startdate)
    setValue('finishdate', assignment.finishdate)
    setValue('pelassignstart', assignment.pelassignstart)
    setValue('pelassignfinish', assignment.pelassignfinish)
    setValue('targstartdate', assignment.workorder.targstartdate)
    setValue('targcompdate', assignment.workorder.targcompdate)
    setValue('workorder.mtfmcof', assignment?.workorder?.mtfmcof)
  }, [assignment])

  const submitForm = formData => {
    const newData = formData

    const failurereportNew = []

    newData.workorder.targstartdate = formData?.targstartdate
    newData.workorder.targcompdate = formData?.targcompdate
    if (newData.targstartdate) {
      delete newData?.targstartdate
    }
    if (newData.targcompdate) {
      delete newData?.targcompdate
    }

    if (failureClass === 'default') {
      delete newData?.workorder?.failurecode
      delete newData?.workorder?.failurereport
    } else if (failureProblem === 'default') {
      delete newData?.workorder?.failurereport
    } else {
      const selectedProblem = failureProblemData?.find(
        ({ failurecode }) => failurecode === failureProblem
      )
      failurereportNew[0] = {
        failurecode: selectedProblem?.failurecode,
        orgid: assignment.workorder.orgid,
        type: selectedProblem?.type
      }

      if (failureCause !== 'default') {
        const selectedCause = failureCauseData?.find(
          ({ failurecode }) => failurecode === failureCause
        )
        failurereportNew[1] = {
          failurecode: selectedCause?.failurecode,
          orgid: assignment.workorder.orgid,
          type: selectedCause?.type
        }
        if (failureRemedy !== 'default') {
          const selectedRemedy = failureRemedyData?.find(
            ({ failurecode }) => failurecode === failureRemedy
          )
          failurereportNew[2] = {
            failurecode: selectedRemedy?.failurecode,
            orgid: assignment.workorder.orgid,
            type: selectedRemedy?.type
          }
        }
      }

      newData.workorder.failurereport = failurereportNew
    }

    
    if (moment(newData?.pelassignstart).isBefore(reportdate)) {
      addErrorToast({
        subtitle: 'Estimated start date cant be before Service Request Created'
      })
    } else if (moment(newData?.pelassignfinish).isBefore(newData?.pelassignstart)) {
      addErrorToast({
        subtitle: 'Estimated finish date cant be before Estimated start date'
      })
    } else {
      onSubmit(newData)
      reset(formData)
    }
  }
  const woserviceaddress = assignment.workorder?.woserviceaddress?.[0] ?? null

  const canChangeStatus = getStatusOptions(status).length > 0

  
  const isAssignmentReadonly = !checkEditingCapability(status)

  
  const isFailureReportingReadonly = !checkFailureEditingCapability(status)

  const isReadOnly = key => {
    switch (key) {
      case 'pelassignstart':
        return !['SUBACCEPT', 'SUBPREDOCS'].includes(status)
      case 'pelassignfinish':
        return !['SUBACCEPT', 'SUBPREDOCS', 'SUBINPRG', 'SUBUPLIFT'].includes(status)
      default:
        return false
    }
  }

  const renderUpliftRequest = () => {
    if (status === 'SUBDISPATCH') return false
    
    if (!isAssignmentReadonly && wpservice && ['SUBUPLIFT', 'SUBINPRG'].includes(status))
      return true
    return false
  }

  return (
    <>
      <Form className="pel--work-order-form" onSubmit={handleSubmit(submitForm)}>
        <div className="bx--row">
          <div className="bx--col-lg-3 bx--col-md-6">
            <PelTextInput
              readOnly
              showSkeleton={loading}
              name="wonum"
              {...getInputProps('wonum', data => {
                return `${data.workorder.wonum} / ${data.status_description}`
              })}
            />
            <PelTextInput
              readOnly
              labelText="Assignment ID"
              name="assignmentid"
              value={assignmentid}
              showSkeleton={loading}
              buttons={
                assignmentid &&
                assignment?.wplabor &&
                assignment?.wplabor?.[0]?.peldependflag && (
                  <DependencyInfoModal dependencyinfo={assignment?.wplabor} />
                )
              }
            />
            <PelTextInput
              readOnly
              labelText="Customer"
              name="workorder.pluspcustomer"
              value={assignment?.workorder?.pluspcustomer?.[0]?.name}
              showSkeleton={loading}
            />
            <PelTextInput
              readOnly
              showSkeleton={loading}
              labelText="Classification"
              name="workorder.classstructure.description"
              {...getInputProps('', 'workorder.classstructure[0].description')}
            />
            <PelTextInput
              labelText="Priority"
              readOnly
              showSkeleton={loading}
              name="workorder.wopriority"
              {...getInputProps('', 'workorder.wopriority')}
              className={isHighPriority ? 'pel--form-red-color' : ''}
              showDescription
              description={assignment.workorder.wopriority_description}
              buttons={<WorkorderPriorityIcon priority={assignment.workorder.wopriority} />}
            />
            <PelDateTimePicker.Rhf
              label="Work Order Target Start"
              value={targstartdate}
              readOnly={!!targstartdate || isAssignmentReadonly}
              name="targstartdate"
              control={control}
              dateReadOnly
              showSkeleton={loading}
            />
            <PelDateTimePicker.Rhf
              label="Estimated Start"
              value={pelassignstart}
              minDate={reportdate}
              readOnly={isReadOnly('pelassignstart')}
              name="pelassignstart"
              control={control}
              dateReadOnly
              showSkeleton={loading}
            />
            <PelDateTimePicker.Rhf
              label="Actual Start"
              value={startdate}
              readOnly
              name="startdate"
              control={control}
              dateReadOnly
              showSkeleton={loading}
            />
          </div>
          <div className="bx--col-lg-3 bx--col-md-6">
            <PelTextInput
              readOnly
              showSkeleton={loading}
              name="workorder.status_description"
              labelText="Work Order Status"
              value={`${workOrderStatus}: ${workOrderStatusDescription}`}
              buttons={
                <WorkHistoryModal
                  objectStructure="PELWO"
                  historyObjectName="wostatus"
                  query={
                    assignment.workorder &&
                    `oslc.where=workorderid=${assignment.workorder.workorderid}&oslc.select=wonum,description,siteid,wostatus{*},pelperson{displayname,primaryemail,primaryphone}`
                  }
                />
              }
            />
            <PelTextInput
              readOnly
              showSkeleton={loading}
              className="pel--status-change-field"
              name="status_description"
              labelText="Assignment Status"
              value={`${status}: ${status_description}`}
              buttons={
                <>
                  <WorkHistoryModal
                    objectStructure="PELASSIGNMENT"
                    historyObjectName="pelassignmenthistory"
                    query={
                      assignment.assignmentid &&
                      `oslc.where=assignmentid=${assignment.assignmentid}&oslc.select=wonum,craft,laborcode,peldescription,siteid,pelassignmenthistory{*},pelperson{displayname,primaryemail,primaryphone}`
                    }
                    modalTitle="Assignment Status History"
                  />
                  {assignment && !isAssignmentReadonly && canChangeStatus && (
                    <StatusChangeModal
                      assignment={assignment}
                      pelreqdocs={pelreqdocs}
                      {...(isDirty && { formData: submitForm, data: getValues() })}
                    />
                  )}
                </>
              }
            />
            <PelTextInput
              readOnly
              showSkeleton={loading}
              labelText="Customer Ref"
              name="customer_ref"
              {...getInputProps('', 'workorder.sr.pelclientref')}
            />
            <PelTextInput
              readOnly
              showSkeleton={loading}
              labelText="Work Category"
              name="mtfmjptype"
              value={mtfmjptype}
            />
            <PelTextInput
              readOnly
              showSkeleton={loading}
              labelText="Service Request Created"
              name="service_request_created"
              {...getInputProps('reportdate', data =>
                Helpers.toShortDate(data.workorder.sr?.reportdate || '')
              )}
            />
            <PelDateTimePicker.Rhf
              label="Work Order Target Finish"
              value={targcompdate}
              readOnly={!!targcompdate || isAssignmentReadonly}
              name="targcompdate"
              control={control}
              dateReadOnly
              showSkeleton={loading}
            />
            <PelDateTimePicker.Rhf
              label="Estimated Finish"
              readOnly={isReadOnly('pelassignfinish')}
              minDate={reportdate}
              name="pelassignfinish"
              control={control}
              dateReadOnly
              showSkeleton={loading}
            />
            <PelDateTimePicker.Rhf
              label="Actual Finish"
              value={finishdate}
              readOnly
              name="finishdate"
              control={control}
              dateReadOnly
              showSkeleton={loading}
            />
          </div>
          <div className="bx--col-lg-3 bx--col-md-6">
            <PelTextInput
              readOnly
              showSkeleton={loading}
              name="workorder.description"
              labelText="Work Order Description"
              {...getInputProps('', 'workorder.description')}
              buttons={
                <LongDescriptionModal
                  longdescription={assignment.workorder.description_longdescription}
                />
              }
            />

            <PelTextInput
              readOnly
              showSkeleton={loading}
              labelText="Assignment Description"
              name="peldescription"
              {...getInputProps('', 'peldescription')}
              buttons={
                <LongDescriptionModal longdescription={assignment.peldescription_longdescription} />
              }
            />
            <div className="bx--row">
              <div className="bx--col-lg-6">
                <PelTextInput
                  readOnly
                  showSkeleton={loading}
                  name="workorder.reportedby"
                  labelText="Reported By"
                  {...getInputProps('', 'workorder.reportedby')}
                  buttons={
                    <ObjectTooltip
                      value={assignment.workorder.reportedby}
                      objectType="PELPERSON"
                      title="displayname"
                      iconOnly
                      query={`oslc.where=personid="${assignment.workorder.reportedby}"&oslc.select=displayname,primaryemail,primaryphone&lean=1`}
                      fields={[
                        {
                          field: 'primaryemail'
                        },
                        {
                          field: 'primaryphone'
                        }
                      ]}
                      refresh={refresh}
                    />
                  }
                />
              </div>
              <div className="bx--col-lg-6">
                <PelTextInput
                  readOnly
                  showSkeleton={loading}
                  name="workorder.sr.affectedperson"
                  labelText="Affected User"
                  {...getInputProps('', 'workorder.sr.affectedperson')}
                  buttons={
                    <ObjectTooltip
                      value={assignment.workorder?.sr?.affectedperson}
                      objectType="pelsrfull"
                      title="affectedperson"
                      iconOnly
                      query={`oslc.where=ticketid="${assignment.workorder?.sr?.ticketid}"&oslc.select=affectedperson,affectedemail,affectedphone&lean=1`}
                      fields={[
                        {
                          field: 'affectedemail'
                        },
                        {
                          field: 'affectedphone'
                        }
                      ]}
                      refresh={refresh}
                    />
                  }
                />
              </div>
            </div>
            <div className="pel--safety-questions">
              <div className="bx--row">
                <div className="bx--col-lg-12">
                  <PelTextInput
                    readOnly
                    showSkeleton={loading}
                    labelText="Appointment Entitlement"
                    name="workorder.pelapptent"
                    {...getInputProps(
                      'workorder.pelapptent',
                      data => data?.workorder?.pelapptent || ''
                    )}
                  />
                </div>
              </div>
              <div className="bx--row">
                <div className="bx--col-lg-12">
                  {loading ? (
                    <CheckboxSkeleton />
                  ) : (
                    <Checkbox
                      id="workorder.pelpermitrequired"
                      labelText="Permit Required"
                      {...getInputProps('', 'workorder.pelpermitrequired', {
                        attr: 'checked'
                      })}
                    />
                  )}
                </div>
              </div>
              <div className="bx--row">
                <div className="bx--col-lg-12">
                  {loading ? (
                    <CheckboxSkeleton />
                  ) : (
                    <Checkbox
                      id="workorder.pelreportascrit"
                      labelText="Reported as Business Critical"
                      {...getInputProps('', 'workorder.pelreportascrit', {
                        attr: 'checked'
                      })}
                    />
                  )}
                </div>
              </div>
              <div className="bx--row">
                <div className="bx--col-lg-12">
                  {loading ? (
                    <CheckboxSkeleton />
                  ) : (
                    <Checkbox
                      id="workorder.pelreportashs"
                      labelText="Reported as risk to Health and Safety"
                      {...getInputProps('', 'workorder.pelreportashs', {
                        attr: 'checked'
                      })}
                    />
                  )}
                </div>
              </div>
            </div>

            <LocationHierarchy location={assignment.workorder?.locations?.[0].location} />
            <AddressInput loading={loading} woserviceaddress={woserviceaddress} />

            <div className="bx--row">
              <div className="bx--col" />
            </div>
          </div>
          <div className="bx--col-lg-3 bx--col-md-6">
            <div className="bx--row">
              <div className="bx--col-lg-6">
                <PelTextInput
                  readOnly
                  showSkeleton={loading}
                  labelText="Purchase Order / Line"
                  name="purchase_order_line"
                  {...getInputProps('poline[0].ponum', data => {
                    return data?.poline?.[0]?.ponum || ''
                  })}
                />
              </div>
              <div className="bx--col-lg-6">
                <PelTextInput
                  readOnly
                  showSkeleton={loading}
                  labelText="Purchase Order Status"
                  name="purchase_order_status"
                  value={
                    assignment?.poline && assignment?.poline[0]?.po
                      ? `${assignment?.poline[0].po[0].status}: ${assignment?.poline?.[0]?.po?.[0]?.status_description}`
                      : ''
                  }
                />
              </div>
            </div>
            <div className="bx--row">
              <div className="bx--col-lg-12">
                {assignment?.poline?.[0]?.po?.[0]?.status_description === 'Approved' ? (
                  <PelTextInput
                    readOnly
                    showSkeleton={loading}
                    labelText="Purchase Order Value"
                    name="purchase_order_value"
                    {...getInputProps('poline[0].po[0].totalcost', data => {
                      return floatNumberWithComma(data?.poline?.[0]?.po?.[0]?.totalcost) || ''
                    })}
                    buttons={
                      <>
                        {wpservice && (
                          <UpliftHistoryModal
                            objectStructure="PELUPLIFTHISTORY"
                            upliftHistoryObjectName="a_wpitem"
                            query={`oslc.where=wpitemid=${wpservice?.wpitemid}&oslc.select=*`}
                          />
                        )}
                        {renderUpliftRequest() && (
                          <UpliftRequestModal
                            assignment={assignment}
                            {...(isDirty && { formData: submitForm, data: getValues() })}
                          />
                        )}
                      </>
                    }
                  />
                ) : (
                  <PelTextInput
                    readOnly
                    showSkeleton={loading}
                    labelText="Initial Mobilisation Value"
                    name="initial_mobilisation_value"
                    {...getInputProps('wpservice[0].totalcost', data => {
                      return floatNumberWithComma(
                        data?.wpservice?.[0]?.totalcost || data?.wpservice?.[0]?.linecost || ''
                      )
                    })}
                  />
                )}
                <PelTextInput
                  readOnly
                  showSkeleton={loading}
                  labelText="Purchase Order Type"
                  name="purchase_order_type"
                  {...getInputProps('poline[0].po[0].potype', data => {
                    return data?.poline?.[0]?.po?.[0]?.potype_description || ''
                  })}
                />
                {loading ? (
                  <SelectSkeleton />
                ) : (
                  <Select
                    name="workorder.mtfmcof"
                    id="workorder.mtfmcof"
                    ref={register}
                    className="pel-select-input"
                    labelText="Failure Reason"
                    disabled={isFailureReportingReadonly}
                    onChange={onFailureReasonChange}
                    defaultValue={failurereason}
                  >
                    <SelectItem
                      key="workorder.mtfmcof"
                      text="Choose a failure reason"
                      disabled
                      hidden
                    />
                    {failureReasons &&
                      failureReasons?.map((failureReason, index) => (
                        <SelectItem
                          key={`workorder.mtfmcof${failureReason.value}`}
                          text={`${failureReason.value} : ${failureReason.description}`}
                          value={failureReason.value}
                        />
                      ))}
                  </Select>
                )}
                {loading ? (
                  <SelectSkeleton />
                ) : (
                  <>
                    <PelSelectInput
                      onChange={onFailureClassChange}
                      ref={register}
                      disabled={isFailureReportingReadonly}
                      skeleton={loadingFailure.class}
                      name="workorder.failurecode"
                      labelText="Failure Class"
                      defaultText="Choose a failure class"
                      defaultValue=""
                      options={failureClassData?.map(({ description, failurecode }) => ({
                        text: `${failurecode}: ${description}`,
                        value: failurecode
                      }))}
                    />
                    <PelSelectInput
                      onChange={onFailureProblemChange}
                      ref={register}
                      skeleton={loadingFailure.problem}
                      defaultValue=""
                      name="workorder.failurereport[0].failurecode"
                      labelText="Problem"
                      defaultText="Choose a problem"
                      disabled={failureClass === 'default' || isFailureReportingReadonly}
                      options={failureProblemData?.map(({ description, failurecode }) => ({
                        text: `${failurecode}: ${description}`,
                        value: failurecode
                      }))}
                    />
                    <PelSelectInput
                      onChange={onFailureCauseChange}
                      ref={register}
                      skeleton={loadingFailure.cause}
                      name="workorder.failurereport[1].failurecode"
                      labelText="Cause"
                      defaultText="Choose a cause"
                      defaultValue=""
                      disabled={failureProblem === 'default' || isFailureReportingReadonly}
                      options={failureCauseData?.map(({ description, failurecode }) => ({
                        text: `${failurecode}: ${description}`,
                        value: failurecode
                      }))}
                    />
                    <PelSelectInput
                      ref={register}
                      name="workorder.failurereport[2].failurecode"
                      labelText="Remedy"
                      skeleton={loadingFailure.remedy}
                      defaultText="Choose a remedy"
                      defaultValue=""
                      disabled={failureCause === 'default' || isFailureReportingReadonly}
                      options={failureRemedyData?.map(({ description, failurecode }) => ({
                        text: `${failurecode}: ${description}`,
                        value: failurecode
                      }))}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {isDirty && !hideSaveButton && (
          <div className="bx--row pel--footer-bar">
            <div className="button-wrapper">
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        )}
      </Form>
    </>
  )
}

Details.propTypes = {
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  assignment: Props.assignment.isRequired,
  setIsFormDirty: PropTypes.func,
  getInputProps: PropTypes.func.isRequired,
  failureReasons: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSubmit: PropTypes.func.isRequired,
  pelreqdocs: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  hideSaveButton: PropTypes.bool
}
