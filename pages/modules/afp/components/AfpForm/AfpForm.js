import {
  Button,
  Form,
  Modal,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'carbon-components-react'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { format, startOfDay, endOfDay } from 'date-fns'
import { Save32 } from '@carbon/icons-react'
import {
  PelDateTimePicker,
  PelSelectInput,
  PelTextArea,
  PelTextInput
} from '../../../../shared/forms'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { useSession } from '../../../auth/SessionProvider'
import { useAfpCtx } from '../../context/afp-context'
import {
  saveAfpData,
  createAfp,
  getList,
  getMfaRefList,
  deleteAfpLines,
  deleteAfpData,
  getAfpLinesContracts,
  getAfpData
} from '../../services/afpApiService'
import { currencyFormatter } from '../../utilities/formatters'
import { exportAfpData } from '../../utilities/exportAfpData'
import './AfpForm.scss'
import {
  mapInitValues,
  AFP_STATUS,
  DEFAULT_TYPE,
  getAfpStatusOpts,
  sortChangeDate
} from './formUtils'
import { api } from '../../../app/api'
import { Loading } from '../../../shared-components/Loading'
import { isEmpty } from '../../../../util'
import { AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM } from '../../utilities'

const getServerDateTime = () =>
  api.get(`/maximo/oslc/script/PELGETMXTIME`, {
    baseURL: `/`,
    removeparams: true
  })


export const AfpForm = ({ id, onClose, searchRef, setShowEditedByElseModal }) => {
  const [formOptsState, setFormOptsState] = useState({
    sites: [],
    types: [],
    mfaRefs: []
  })

  const [statusWarning, setStatusWarning] = useState({
    action: false,
    message: ''
  })

  const [mhaWarning, setMhaWarning] = useState({
    action: false,
    message: ''
  })

  const [statusError, setStatusError] = useState({
    action: false,
    message: ''
  })

  const [loadingState, setLoadingState] = useState(true)
  const mfaRefs = useRef([])
  const [session] = useSession()

  const [showModal, setShowModal] = useState(false)
  const [isLoading, setLoadingStatus] = useState(false)

  const { afps, updateAfpData, setAfpMetadata, addAfp } = useAfpCtx()
  const { data: afp, metadata, label } = afps.get(id)
  const { addPersistentErrorToast, addErrorToast, addSuccessToast } = useToast()

  const onModalDeleteClick = () => {
    setShowModal(true)
  }

  const onDeleteConfirmation = async () => {
    // make api call
    setLoadingStatus(true)
    setShowModal(false)
    const deleteURL = afp.href.replace('pelos/', 'os/')
    await deleteAfpData(deleteURL, {}, addPersistentErrorToast, addSuccessToast)
    onClose(id, { isModified: false })
    // eslint-disable-next-line react/prop-types
    searchRef.current.clearInput('')
    setLoadingStatus(false)
  }

  const onDeleteConfirmationClose = () => {
    setShowModal(false)
  }

  const {
    pluspcustvendor: vendor,
    defaultSite,
    busUnits = [],
    pelbusunit: defaultBusunit
  } = session

  const currDate = useRef('')
  const mfaDescription = useRef('')
  const defaultValues = useMemo(
    () => mapInitValues({ siteid: defaultSite, pelbusunit: defaultBusunit, ...afp }),
    []
  )
  const useFormMethods = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues
  })

  const {
    handleSubmit,
    control,
    formState,
    errors,
    register,
    unregister,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    trigger
  } = useFormMethods
  const { isValid, isSubmitting, isDirty } = formState
  const { type, pelbusunit, mfaref, startdate, enddate } = watch()
  const isAfpExist = !!afp?.afpnum

  const isAfpSubmitted = [AFP_STATUS.submitted, AFP_STATUS.approved, AFP_STATUS.closed].includes(
    afp.status
  )
  const isDraftStatus = !(type === 'SUBPO' && afp?.status === 'DRAFT')

  const lineStatuses = afp.pelafpline ? afp.pelafpline.map(({ status }) => status) : []

  const statusOpts = useMemo(() => getAfpStatusOpts(afp.status), [afp.status, lineStatuses])
  const submittedDates = useMemo(() => {
    const [{ changedate = '' } = {}, ...subDates] = sortChangeDate(afp.pelafpstatushist ?? [])
    const { changedate: lastSubDate } = subDates.pop() ?? { changedate }
    return [
      {
        name: 'submitteddate',
        label: 'First Submitted Date',
        value: changedate
      },
      {
        name: 'lastsubmittedate',
        label: 'Last Submitted Date',
        value: lastSubDate
      }
    ]
  }, [afp?.pelafpstatushist])

  useEffect(() => {
    currDate.current = new Date().toISOString()
    Promise.all([
      getList('type', { select: 'value' }),
      getList('siteid', { select: 'siteid' }),
      getMfaRefList(defaultBusunit)
    ])
      .then(([types, sites, mfaRef]) => {
        const mapToSelectOpts = (data, text, val, desc = text) =>
          data.map(prop => ({
            text: prop[text],
            value: prop[val ?? text],
            description: prop[desc]
          }))

        mfaRefs.current = mfaRef

        return [
          mapToSelectOpts(types, 'value'),
          mapToSelectOpts(sites, 'siteid'),
          mapToSelectOpts(mfaRef, 'contractnum', 'contractnum', 'description'),
          mapToSelectOpts(busUnits, 'description', 'value').filter(({ value }) => !!value)
        ]
      })
      .then(([typeOpts, siteOpts, mfaRefOpts, busUnitsOpts]) => {
        setFormOptsState(state => ({
          ...state,
          types: typeOpts,
          sites: siteOpts,
          mfaRefs: mfaRefOpts,
          busUnits: busUnitsOpts
        }))
        setValue('siteid', afp.siteid || defaultSite)
        setValue('pelbusunit', afp.pelbusunit || defaultBusunit)
        mfaDescription.current = mfaRefs.current.find(
          mfaRef => mfaRef.contractnum === mfaref
        )?.description
      })
      .finally(() => setLoadingState(false))
  }, [])

  useEffect(() => {
    if (!pelbusunit) return

    setFormOptsState(state => ({
      ...state,
      mfaRefs: state.mfaRefs.filter(({ value }) => {
        const mfaRef = mfaRefs.current.find(({ contractnum }) => contractnum === value)
        return mfaRef.pelbusunit === pelbusunit
      })
    }))
  }, [pelbusunit])

  useEffect(() => {
    if (isAfpExist) {
      unregister(['type', 'enddate', 'startdate', 'siteid', 'mfaref', 'mfarevisonnum'])
    }
  }, [afp.status, afp.type])

  useEffect(() => {
    if (isAfpExist) return

    if (type !== DEFAULT_TYPE) {
      setValue('mfaref', '')
      setValue('mfarevisonnum', '')
      clearErrors('mfaref')
      mfaDescription.current = ''
    } else if (mfaref) {
      const { revisionnum, description } = mfaRefs.current.find(
        mfaRef => mfaRef.contractnum === mfaref
      )
      setValue('mfarevisonnum', revisionnum)
      mfaDescription.current = description
    }
  }, [type, mfaref])

  useEffect(async () => {
    if (afp.afpnum && afp.type === 'SUBAFP' && !isEmpty(afp?.pelafpline)) {
      const { isUpdated, pelAfpLines } = await getAfpLinesContracts(
        afp.type,
        afp.pelafpline,
        setLoadingStatus
      )
      if (isUpdated) {
        afp.pelafpline = pelAfpLines
        updateAfpData({
          id,
          label: afp.afpnum,
          data: afp
        })
      }
    }
  }, [afp.afpnum])

  const getTotalAppValue = () =>
    afp.pelafpline?.reduce(
      (acc, { linecost, status }) => acc + (['HOLD', 'QUERY'].includes(status) ? 0 : linecost),
      0
    ) || 0

  useEffect(() => {
    if (metadata.isModified !== isDirty) {
      setAfpMetadata({ id, isModified: isDirty })
    }
  }, [isDirty])

  const highlightError = () => {
    ;['enddate', 'mfaref'].forEach(field => {
      setError(field, {
        types: 'required'
      })
    })
  }

  const restoreStatus = () => {
    setStatusWarning({
      action: false,
      message: ''
    })
    const { status } = afp
    setValue('status', status)
  }

  const restoreStatusBack = () => {
    setStatusError({
      action: false,
      message: ''
    })
    const { status } = afp
    setValue('status', status)
  }

  const validateAfpData = ({ target }) => {
    const { value } = target
    let message = ''
    if (value === 'SUBMITTED') {
      const { pelafpline } = afp

      if (!pelafpline || pelafpline?.length === 0) {
        return setStatusError({
          action: true,
          message:
            'There are no Assignment lines on this AFP and it cannot be changed to SUBMITTED.'
        })
      }

      const hasAnyAssignmentMarkedAsDeleted = pelafpline?.some(item => item?.isdeleted)
      if (hasAnyAssignmentMarkedAsDeleted) {
        return setStatusError({
          action: true,
          message:
            'You have AFP Lines marked for deletion, please save the AFP before changing status'
        })
      }

      const anyABOVEPOStatus = pelafpline?.some(item => item?.status === 'ABOVEPO')

      if (anyABOVEPOStatus) {
        return setStatusError({
          action: true,
          message: 'There is a line(s) at Status of ABOVEPO.  Please rectify and resubmit.'
        })
      }

      const allQueryStatusHOLD = pelafpline?.every(item => item?.status === 'HOLD')
      if (allQueryStatusHOLD) {
        return setStatusError({
          action: true,
          message: 'All lines on this AFP have a Status of HOLD and it cannot be SUBMITTED.'
        })
      }

      const anyQueryStatus = pelafpline?.some(item => item?.status === 'QUERY')
      const anyQueryStatusHOLD = pelafpline?.some(item => item?.status === 'HOLD')
      const anyZeroCost = pelafpline?.some(
        item =>
          !item?.pelafplinedetail ||
          item?.pelafplinedetail?.length === 0 ||
          item?.pelafplinedetail?.some(e => e.linecost === 0)
      )

      const hasAnyEmptyDescription =
        afp.type === 'SUBAFP' &&
        pelafpline?.some(
          item =>
            item?.pelafplinedetail?.length && item?.pelafplinedetail?.some(e => !e?.description)
        )

      if (hasAnyEmptyDescription) {
        return setStatusError({
          action: true,
          message: 'There are AFP Lines without a description'
        })
      }

      if (anyQueryStatus && anyQueryStatusHOLD) {
        message = `There are AFP Lines with status Query & Hold`
      } else if (anyQueryStatus) {
        message = `There are AFP Lines with status Query`
      } else if (anyQueryStatusHOLD) {
        message = `There are AFP Lines with status Hold`
      }

      if (anyZeroCost && message.trim() !== '') {
        message = `${message} and AFP Lines with zero cost.`
      } else if (anyZeroCost) {
        message = `There are AFP Lines with zero cost.`
      }

      if (anyQueryStatus || anyQueryStatusHOLD || anyZeroCost) {
        return setStatusWarning({
          action: true,
          message
        })
      }
      return setStatusWarning({
        action: true,
        message: ''
      })
    }
  }

  const removeTempLineIds = pelafpline =>
    pelafpline?.map(({ pelafplinedetail, ...restPelafpline }) => ({
      ...restPelafpline,
      pelafplinedetail: pelafplinedetail?.map(
        ({ pelafplinedetailid, metadata, ...restPelafplinedetail }) => ({
          ...restPelafplinedetail,
          ...(!`${pelafplinedetailid}`.includes('new_') && { pelafplinedetailid })
        })
      )
    }))

  const deleteAfpLineData = async data => {
    const { href } = afp
    setLoadingStatus(true)
    return deleteAfpLines(href, data, addErrorToast, addSuccessToast).then(async result => {
      setLoadingStatus(false)
      if (result) {
        
        const { isUpdated, pelAfpLines } = await getAfpLinesContracts(
          result.type,
          result?.pelafpline,
          setLoadingStatus
        )
        if (isUpdated) {
          
          result.pelafpline = pelAfpLines
        }

        updateAfpData({
          id,
          label: result.afpnum,
          data: result
        })
      }
    })
  }

  const isUpdatedByOther = async payload => {
    const latestAFPData = await getAfpData(afp.afpnum, addPersistentErrorToast)
    
    if (+latestAFPData?._rowstamp > +afp?._rowstamp) {
      setShowEditedByElseModal(() => ({
        afpNum: afp.afpnum,
        action: true,
        actionTriggeredFrom: AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM.AFP_FORM,
        cbFunc: () => {
          setLoadingStatus(true)
          exportAfpData(afp, label)
          setLoadingStatus(false)
        }
      }))
    } else {
      return saveAfpData(afp.href, payload, addPersistentErrorToast, addSuccessToast)
    }
  }

  const submit = async ({ status, type, description, mfarevisonnum, mfaref, ...formData }) => {
    const formInfo = { ...formData }

    if (!metadata.isModified) {
      if (!afp.afpnum) highlightError()
      return
    }

    if (!afp.href) {
      const response = await getServerDateTime().catch(err => {
        throw new Error(`Cound not retrieve Server date time. Reason: ${err.message}`)
      })
      if (response && response.status === 200) {
        const serverDateTime = response.data.mxtime
        if (formInfo.startdate) {
          formInfo.startdate = format(
            startOfDay(new Date(formData.startdate)),
            "yyyy-MM-dd'T'HH:mm:ssxxx"
          )
        }

        const formEndDate = format(endOfDay(new Date(formData.enddate)), "yyyy-MM-dd'T'HH:mm:ssxxx")

        if (format(new Date(formData.enddate), 'dd') === format(new Date(), 'dd')) {
          formInfo.enddate = serverDateTime
        } else {
          formInfo.enddate = formEndDate
        }
      }
    }

    const isFormValid = await trigger(['enddate'])

    if (!isFormValid) return

    let payload = {
      status: status ?? AFP_STATUS.new,
      description,
      pelafpline: removeTempLineIds(afp.pelafpline),
      type
    }

    if (!isAfpExist) {
      payload = {
        ...formInfo,
        ...payload,
        vendor
      }
      if (type === DEFAULT_TYPE) {
        payload.mfaref = mfaref
        payload.mfarevisonnum = +mfarevisonnum
      }
    }

    const initialValue = { dataToSave: [], dataToDelete: [] }

    const { dataToSave, dataToDelete } =
      payload?.pelafpline?.reduce((data, { assignment, pelpoline, isdeleted, ...restItem }) => {
        if (isdeleted) {
          
          restItem._action = 'Delete'
          
          data.dataToDelete.push({ ...restItem })
        } else {
          
          data.dataToSave.push({ ...restItem })
        }

        return data
      }, initialValue) ?? initialValue

    const afpType = typeof type === 'undefined' ? afp.type : type
    if (afpType === 'SUBAFP') {
      const hasAnyEmptyDescription = payload.pelafpline?.some(
        item => item?.pelafplinedetail?.length && item?.pelafplinedetail?.some(e => !e?.description)
      )

      if (hasAnyEmptyDescription) {
        return setStatusError({
          action: true,
          message: 'There are AFP Lines without description'
        })
      }
    }

    if (dataToDelete?.length) {
      const res = await deleteAfpLineData({
        pelafpline: dataToDelete
      })

      if (!res) {
        setLoadingStatus(false)
      }
    }

    if (dataToSave?.length) {
      payload.pelafpline = dataToSave
    }

    if (dataToSave?.length || !afp?.href || afp?.href) {
      setLoadingStatus(true)

      const res = await (afp.href
        ? isUpdatedByOther(payload)
        : createAfp(payload, addPersistentErrorToast, addSuccessToast))
      setLoadingStatus(false)
      if (!res) {
        return false
      }
      const data = {
        ...payload,
        ...res
      }

      
      const { isUpdated, pelAfpLines } = await getAfpLinesContracts(
        data.type,
        data?.pelafpline,
        setLoadingStatus
      )
      if (isUpdated) {
        data.pelafpline = pelAfpLines
      }

      if (id && id.includes('new_') && res?.afpnum) {
        
        const newAfp = {
          ...payload,
          ...res
        }

        addAfp(newAfp)

        onClose(id, { isModified: false })
      } else {
        updateAfpData({
          id,
          label: res.afpnum,
          data,
          metadata: {
            isModified: false
          }
        })

        reset(mapInitValues(data))

        setLoadingStatus(false)
      }
    }
  }

  const onModalOkClick = () => {
    setStatusWarning({ action: false, message: '' })
    handleSubmit(submit)()
  }

  return (
    <>
      {isLoading ? <Loading modal /> : null}
      <div className="afp--form_container">
        <div className="afp--form">
          <Form className="pel--work-order-form">
            <div className="bx--row">
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelTextInput name="afpnum" value={afp.afpnum} labelText="AFP Reference" readOnly />
              </div>
              <div className="bx--col-lg-4 bx--col-md-4 pel--bottom">
                <PelSelectInput
                  ref={register}
                  name="siteid"
                  labelText="Site"
                  defaultText="Select Site"
                  options={formOptsState.sites}
                  disabled={isAfpExist}
                  skeleton={loadingState}
                />
              </div>
              <div className="bx--col bx--col-md-4">
                <PelSelectInput
                  ref={register}
                  name="status"
                  labelText="AFP Status"
                  defaultText="Select Status"
                  onChange={validateAfpData}
                  options={statusOpts}
                  disabled={!isAfpExist || isAfpSubmitted}
                />
              </div>
            </div>
            <div className="bx--row">
              <div className="bx--col-lg-4 bx--col-md-4 pel--bottom">
                <PelSelectInput
                  ref={register}
                  name="type"
                  labelText="AFP Type"
                  defaultText="Select AFP type"
                  options={formOptsState.types}
                  skeleton={loadingState}
                  disabled={isAfpExist}
                />
              </div>
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelSelectInput
                  ref={register}
                  name="pelbusunit"
                  labelText="Business Unit"
                  defaultText="Select Business Unit"
                  options={formOptsState.busUnits}
                  skeleton={loadingState}
                  disabled
                />
              </div>
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelDateTimePicker
                  name="statusdate"
                  label="Status Date"
                  value={afp?.statusdate}
                  withTime={false}
                  readOnly
                  dateReadOnly
                />
              </div>
            </div>

            <div className="bx--row">
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelDateTimePicker.Rhf
                  name="startdate"
                  label="AFP Start Date"
                  control={control}
                  withTime={false}
                  readOnly={isAfpExist}
                  dateReadOnly={isAfpExist}
                  maxDate={enddate || currDate.current}
                  minDate=""
                />
              </div>
              {submittedDates.map(opts => (
                <div key={opts.name} className="bx--col">
                  <PelDateTimePicker {...opts} withTime readOnly dateReadOnly />
                </div>
              ))}
            </div>
            <div className="bx--row">
              <div className="bx--col">
                <PelTextArea
                  ref={register}
                  name="description"
                  labelText="Description"
                  rows={6}
                  wrapperClassName="afp--textarea"
                  disabled={isAfpSubmitted}
                />
              </div>
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelDateTimePicker.Rhf
                  control={control}
                  label="* AFP End Date"
                  name="enddate"
                  withTime={false}
                  readOnly={isAfpExist}
                  dateReadOnly={isAfpExist}
                  invalid={!!errors.enddate}
                  invalidText="End Date is required"
                  maxDate={currDate.current}
                  minDate={startdate || ''}
                  rules={{ required: isDirty }}
                />
                <PelTextInput
                  value={afp.pelafpline?.length || 0}
                  name="appnumlines"
                  labelText="Number of Application Lines"
                  readOnly
                />
              </div>
            </div>
            <div className="bx--row flex--reverse">
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelTextInput
                  value={currencyFormatter({ value: getTotalAppValue() })}
                  name="totalappvalue"
                  labelText="Total Application Value"
                  readOnly
                />
              </div>
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelTextInput
                  name="changeby"
                  labelText="Changed By"
                  value={afp?.changeby}
                  readOnly
                />
              </div>
              <div className="bx--col-lg-4 bx--col-md-4">
                <PelDateTimePicker
                  value={afp?.changedate}
                  label="Change Date"
                  name="changedate"
                  withTime={false}
                  readOnly
                  dateReadOnly
                />
              </div>
            </div>
          </Form>
        </div>
        <div className="afp--cta-container afp--form_cta">
          <Button
            renderIcon={Save32}
            onClick={handleSubmit(submit)}
            disabled={
              (!['NEW', 'QUERY'].includes(afp?.status) && afp?.afpnum) ||
              (!isValid && isDraftStatus) ||
              (isSubmitting && isDraftStatus) ||
              !enddate
            }
          >
            {isAfpExist ? 'Save' : `Create`} AFP
          </Button>
          {afp.status === 'NEW' && isEmpty(afp?.pelafpline) && (
            <Button className="afp-del-btn" onClick={onModalDeleteClick}>
              Delete AFP
            </Button>
          )}
        </div>

        <Modal
          open={statusWarning.action}
          modalHeading="Are you sure you want to change the AFP status to SUBMITTED?"
          primaryButtonText="OK"
          secondaryButtonText="Cancel"
          onRequestSubmit={onModalOkClick}
          onRequestClose={() => restoreStatus()}
        >
          {statusWarning.message}
        </Modal>

        <Modal
          open={showModal}
          modalHeading="Are you sure you want to delete this AFP?"
          primaryButtonText="Delete AFP"
          secondaryButtonText="Cancel"
          onRequestSubmit={onDeleteConfirmation}
          onRequestClose={onDeleteConfirmationClose}
          preventCloseOnClickOutside
        >
          {statusWarning.message}
        </Modal>

        <Modal
          open={mhaWarning.action}
          modalHeading="Create AFP"
          passiveModal
          onRequestClose={() =>
            setMhaWarning({
              action: false,
              message: ''
            })
          }
        >
          {mhaWarning.message}
        </Modal>

        <ComposedModal
          open={statusError.action}
          size="sm"
          className="info-modal"
          preventCloseOnClickOutside
        >
          <ModalHeader title={statusError.message} buttonOnClick={() => restoreStatusBack()} />
          <ModalBody />
          <ModalFooter primaryButtonText="OK" onRequestSubmit={() => restoreStatusBack()} />
        </ComposedModal>
      </div>
    </>
  )
}

AfpForm.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func
}
