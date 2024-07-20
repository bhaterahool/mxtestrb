import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Form, Select, SelectItem, Checkbox } from 'carbon-components-react'
import WarningAlt16 from '@carbon/icons-react/lib/warning--alt/16'
import DataShare16 from '@carbon/icons-react/lib/data-share/16'
import moment from 'moment'
import { useDispatch } from 'react-redux'
import { PelDateTimePicker, PelTextInput, PelTextArea } from '../../../../shared/forms'
import { useRegistry } from '../../../../shared/RegistryProvider'
import { api } from '../../../app/api'
import getRelativePath from '../../../../util/getRelativePath'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import getStatusOptions from './getStatusOptions'
import { PelModalWrapper } from '../../../contact-center/components/PelModalWrapper'
import './StatusChangeModal.scss'
import config from '../../../app/config'
import * as actions from '../../state/actions'
import { Loading } from '../../../shared-components/Loading'
import { assignment } from '../form/props'
import { useSubcontractSearchProvider } from '../../search/SubcontractSearchProvider'

export const StatusChangeModal = ({ assignment, pelreqdocs, formData, data, ...props }) => {
  const { register, watch, control, setValue, handleSubmit, getValues, reset } = useForm({
    defaultValues: {
      pelassignstart: null
    }
  })

  const { refresh } = useSubcontractSearchProvider()

  const [submitting, setSubmitting] = useState(false)

  const dispatch = useDispatch()

  const statusChangeModelRef = useRef()

  const [{ assignmentStatusList, reasonCodeList, assignmentNonCompletionReasons }] = useRegistry()
  const nonCompletionReasonsList = [
    { value: '', description: 'Select a Reason' },
    ...assignmentNonCompletionReasons
  ]
  const { addSuccessToast, addErrorToast, addPersistentErrorToast } = useToast()

  if (!assignment) return null

  const multiassetlocci = assignment?.workorder?.multiassetlocci ?? []

  const availableStatusList = getStatusOptions(assignment?.status)

  const [newStatusChangeList, setNewStatusChangeList] = useState([])

  const submitForm = async data => {
    if (
      data.status !== 'SUBFINISH' &&
      moment(data?.statusdate).isBefore(moment(assignment?.statusdate))
    ) {
      addErrorToast({
        subtitle: `Status date cant be less than previous status change time - ${moment(
          assignment?.statusdate
        ).format('MMMM Do YYYY, h:mm:ss a')}`
      })
    } else if (
      data.status === 'SUBFINISH' &&
      moment(watch('pelstatusdate')).isBefore(assignment?.startdate)
    ) {
      addErrorToast({
        subtitle: 'Status date cant be less than assignment start date'
      })
    } else if (
      data.status === 'SUBFINISH' &&
      data.mjreasoncode === 'INCURREDCOST' &&
      !assignment?.labtrans?.length > 0
    ) {
      addErrorToast({
        subtitle:
          'Please add an attendance record before changing status to Subcontractor Work Finished'
      })
    } else {
      const formdata = data

      
      if (data?.mjreasoncode || formdata?.returnreasoncode) {
        formdata.pelreasoncode = data?.returnreasoncode || data?.mjreasoncode
        delete formdata.mjreasoncode
        delete formdata.returnreasoncode
      }

      
      formdata.pelstatusdate = moment.utc(formdata.pelstatusdate)
      try {
        statusChangeModelRef.current.handleClose()

        setSubmitting(true)

        const updated = await api.post(getRelativePath(assignment.href), formdata, {
          headers: {
            patchtype: 'MERGE',
            'x-method-override': 'PATCH',
            'Content-Type': 'application/json',
            properties: config.search.pelassignment.fields
          }
        })
        setSubmitting(false)

        addSuccessToast({
          subtitle: 'Status changed successfully'
        })

        if (updated?.data) {
          dispatch(actions.updateAssignment(updated.data))
          refresh()
        }
        
        if (formdata?.status === 'SUBRETURNED') {
          dispatch(actions.removeSearchResult(assignment))
        }
      } catch (error) {
        addPersistentErrorToast({
          subtitle: error.message
        })
        setSubmitting(false)
      }
    }
  }

  
  const verifyDoclink = status => {
    const res = pelreqdocs.filter(function(doc) {
      return doc.duebystatus === (status === 'SUBWDOCS' ? 'PRECOMP' : 'PRESTART')
    })
    return res.some(
      ({ doclinksid, notprovided, notprovidedreason }) =>
        (!doclinksid || notprovided) && !notprovidedreason
    )
  }

  const workcompletionFlagCheck =
    multiassetlocci.length > 0 &&
    multiassetlocci.every(({ pelworkoutcome, pelcompnotes, pelworkcomp, pelnoncompreason }) => {
      if (pelworkcomp && pelworkoutcome && pelworkoutcome !== 'SATISFACTORY' && pelcompnotes) {
        return true
      }
      if (pelworkcomp && pelworkoutcome && pelworkoutcome === 'SATISFACTORY') {
        return true
      }
      if (!pelworkcomp && pelnoncompreason?.length) {
        return true
      }
    })

  const isLabtransRecordMissing =
    watch('status') === 'SUBFINISH' && !assignment?.labtrans?.length > 0 && !watch('mjreasoncode')

  const failureReportCheck =
    assignment?.workorder?.failurereport?.length === 3 &&
    assignment?.workorder?.failurecode &&
    assignment?.workorder?.mtfmcof

  const isFailureReportingMissing = watch('status') === 'SUBFINISH' && !failureReportCheck

  const isWorkTypeMatched = ['RW'].includes(assignment?.workorder?.worktype)

  const isNonCompOptAvailable = ['SUBINPRG', 'SUBACCEPT', 'SUBPREDOCS'].includes(assignment?.status)

  const failureReportValidation =
    isFailureReportingMissing && isWorkTypeMatched && !watch('mjreasoncode')

  const isWorkOutcomeMissing = watch('status') === 'SUBFINISH' && !workcompletionFlagCheck

  const isRequiredDocMissing =
    ['SUBPREDOCS', 'SUBWDOCS'].includes(assignment?.status) && verifyDoclink(assignment?.status)

  const isWorkOutcomeNotProvided = watch('mjreasoncode') ? false : isWorkOutcomeMissing

  const isDocumentNotProvided = watch('mjreasoncode') ? false : isRequiredDocMissing

  const documentCheck = status => {
    const res = pelreqdocs.filter(function(doc) {
      return doc.duebystatus === (status === 'SUBWDOCS' ? 'PRECOMP' : 'PRESTART')
    })
    return res.every(({ doclinksid }) => doclinksid)
  }

  const showReqDocType = status => {
    return pelreqdocs.some(function(doc) {
      return doc.duebystatus === status
    })
  }

  const getServerDate = async () => {
    try {
      await api.get(`ping`).then(res => {
        setValue('pelstatusdate', new Date(res.headers.date))
      })
    } catch (err) {
      throw new Error(`Cound not retrieve server date. Reason: ${err.message}`)
    }
  }

  const handleDescriptionChange = e => {
    const { value } = e.target
    
    if (value.length > 200) {
      setValue('pelstatusmemo', value.slice(0, 200))

      addErrorToast({
        subtitle: 'Characters limit 200',
        caption: 'Limit exceed'
      })
    }
  }

  const statusMemoProps = {
    id: 'pelstatusmemo',
    name: 'pelstatusmemo',
    labelText: 'Status Memo',
    type: 'text',
    placeholder: 'Enter Memo',
    ref: register,
    wrapperClassName: 'pel--status-change-memo',
    onChange: handleDescriptionChange
  }

  const isStatusMemoProvided =
    isNonCompOptAvailable && watch('mjreasoncode') && !watch('pelstatusmemo')

  useEffect(() => {
    if (watch('mjreasoncode')) {
      statusMemoProps.invalid = isStatusMemoProvided
      setNewStatusChangeList([{ description: 'Subcontractor Work Finished', value: 'SUBFINISH' }])
      setValue('status', 'SUBFINISH')
    } else {
      const newStatus = assignmentStatusList.filter(status =>
        availableStatusList.includes(status.value)
      )
      setNewStatusChangeList(newStatus)
      setValue('status', newStatus?.[0]?.value ?? '')
    }
  }, [watch('mjreasoncode')])

  const modalProps = {
    modalHeading: 'Change Status',
    primaryButtonText: 'Save',
    className: 'pel-modal',
    secondaryButtonText: 'Cancel',
    shouldCloseAfterSubmit: false,
    renderTriggerButtonIcon: () => <DataShare16 />,
    triggerButtonKind: 'tertiary',
    handleSubmit: handleSubmit(submitForm),
    primaryButtonDisabled:
      isWorkOutcomeNotProvided ||
      isDocumentNotProvided ||
      failureReportValidation ||
      isLabtransRecordMissing ||
      isStatusMemoProvided,
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    formData,
    data,
    saveFn: handleSubmit,
    beforeOpen: () => {
      getServerDate()
      reset({})
    },
    ...props
  }

  return (
    <>
      {submitting && <Loading modal />}
      <PelModalWrapper {...modalProps} ref={statusChangeModelRef}>
        <h4>
          Please choose the new status and provide any additional information. Ensure that you have
          added any required documents, mitigation events, and the required asset information
        </h4>
        <Form>
          <div className="bx--row">
            <div className="bx--col-lg-6 bx--col-md-6">
              <PelTextInput
                id="statuschangemodal-currentstatus"
                name="statuschangemodal-currentstatus"
                labelText="Current Assignment Status"
                value={`${assignment?.status}: ${assignment?.status_description}`}
                readOnly
              />
              <PelDateTimePicker.Rhf
                name="pelstatusdate"
                minDate={assignment.createddate}
                maxDate={['SUBINPRG', 'SUBWDOCS'].includes(assignment?.status) ? new Date() : ''}
                label="Status date"
                control={control}
                readOnly={!['SUBINPRG', 'SUBACCEPT'].includes(assignment?.status)}
              />
              <div className="bx--form-item">
                <fieldset className="bx--fieldset subcon-workstatus-wrapper">
                  {['SUBFINISH', 'SUBENGCOMP'].includes(watch('status')) && (
                    <Checkbox
                      id="statuschangemodal-remedial"
                      labelText="Remedial / Follow-on works required"
                      checked={
                        multiassetlocci.length > 0 &&
                        multiassetlocci.some(({ pelworkcomp }) => !pelworkcomp)
                      }
                      disabled
                    />
                  )}
                  <Checkbox
                    id="statuschangemodal-assetworkoutcomes"
                    labelText="Asset work outcomes updated"
                    checked={!!watch('mjreasoncode') || workcompletionFlagCheck}
                    disabled
                  />
                  {showReqDocType('PRESTART') && (
                    <Checkbox
                      id="statuschangemodal-prestartdocs"
                      labelText="Required Prestart Documents Complete"
                      checked={
                        !!watch('mjreasoncode') ||
                        (pelreqdocs.length > 0 && documentCheck('SUBPREDOCS'))
                      }
                      disabled
                    />
                  )}
                  {showReqDocType('PRECOMP') && (
                    <Checkbox
                      id="statuschangemodal-precompdocs"
                      labelText="Required Precomp Documents Complete"
                      checked={
                        !!watch('mjreasoncode') ||
                        (pelreqdocs.length > 0 && documentCheck('SUBWDOCS'))
                      }
                      disabled
                    />
                  )}
                </fieldset>
              </div>
            </div>
            <div className="bx--col-lg-6 bx--col-md-6">
              <Select id="status" name="status" labelText="New Status" ref={register}>
                <SelectItem
                  key="status-default"
                  value="default"
                  text="Choose a new status"
                  hidden
                  disabled
                />
                {newStatusChangeList.map(({ value, description }) => (
                  <SelectItem
                    key={`status-${value}`}
                    value={value}
                    text={`${value}: ${description}`}
                  />
                ))}
              </Select>
              {watch('status') === 'SUBRETURNED' && (
                <div className="flex">
                  <Select
                    id="returnreasoncode"
                    name="returnreasoncode"
                    labelText="Reason Code"
                    ref={register}
                  >
                    {reasonCodeList.map(({ value, description }) => (
                      <SelectItem
                        key={`returnreasoncode-${value}`}
                        value={value}
                        text={`${value}: ${description}`}
                      />
                    ))}
                  </Select>
                </div>
              )}
              {!workcompletionFlagCheck && isNonCompOptAvailable && (
                <div className="flex">
                  <Select
                    id="noncompreasoncode"
                    name="mjreasoncode"
                    labelText="Non Completion Reason"
                    ref={register}
                  >
                    {nonCompletionReasonsList
                      ?.reduce(
                        (prev, curr) =>
                          curr?.alnvalue?.indexOf(assignment?.status) !== -1
                            ? prev?.concat(curr)
                            : prev,
                        []
                      )
                      ?.map(({ value, description }) => (
                        <SelectItem
                          key={`noncompreasoncode-${value}`}
                          value={value}
                          text={value ? `${value}: ${description}` : `${description}`}
                        />
                      ))}
                  </Select>
                </div>
              )}
              <PelTextArea {...statusMemoProps} className="pel--text-inpt" />
            </div>
          </div>

          {isWorkOutcomeMissing && !watch('mjreasoncode') && (
            <div className="pel--warning-container">
              <WarningAlt16 className="pel--warning-icon-class" /> Missing asset work outcomes
            </div>
          )}
          {isRequiredDocMissing && !watch('mjreasoncode') && (
            <div className="pel--warning-container">
              <WarningAlt16 className="pel--warning-icon-class" />
              You may be missing required documents
            </div>
          )}
          {failureReportValidation && (
            <div>
              <span className="pel--warning-container">
                <WarningAlt16 className="pel--warning-icon-class" />
                Please enter Failure Details before changing status
              </span>
            </div>
          )}
          {watch('mjreasoncode') && (
            <div>
              <span className="pel--warning-container">
                <WarningAlt16 className="pel--warning-icon-class" />
                This is being returned to Mitie for assessment of further work requirements
              </span>
            </div>
          )}
          {isLabtransRecordMissing && (
            <div>
              <span className="pel--warning-container">
                <WarningAlt16 className="pel--warning-icon-class" />
                Please add an attendance record before changing status to Subcontractor Work
                Finished
              </span>
            </div>
          )}
        </Form>
      </PelModalWrapper>
    </>
  )
}

StatusChangeModal.propTypes = {
  assignment,
  pelreqdocs: PropTypes.arrayOf(PropTypes.shape({})),
  formData: PropTypes.any,
  data: PropTypes.any
}
