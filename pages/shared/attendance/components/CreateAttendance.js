import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, TextInput } from 'carbon-components-react'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import Edit16 from '@carbon/icons-react/lib/edit/16'
import { assignment } from '../../../modules/subcon-portal/components/form/props'
import { PelDateTimePicker, PelTextInput } from '../../forms'
import { useToast } from '../../toasts/ToastProvider'
import { PelModalWrapper } from '../../../modules/contact-center/components/PelModalWrapper'
import { api } from '../../../modules/app/api'
import config from '../../../modules/app/config'
import 'react-quill/dist/quill.snow.css'
import './scss/attendancelist.scss'

export const CreateAttendance = ({
  onUpdate,
  assignment: {
    laborcode,
    workorder: { wonum },
    assignmentid
  },
  editAttendance,
  data,
  showLoading
}) => {
  const [serverDate, setServerDate] = useState()

  const defaultValues = {
    starttime: '',
    finishtime: '',
    memo: '',
    pelnumattendees: 1,
    ...(editAttendance && {
      starttime: data?.start,
      finishtime: data?.finish,
      memo: data?.memo,
      pelnumattendees: +data?.pelnumattendees || 1
    })
  }

  const addAttendanceModelRef = useRef()

  const { register, control, setValue, getValues, reset, watch, ...form } = useForm({
    defaultValues
  })

  const { starttime, finishtime, memo, pelnumattendees } = watch()

  const addOrUpdateButtonDisabled =
    !memo || !starttime || !finishtime || pelnumattendees < 1 || pelnumattendees > 10

  const { addSuccessToast, addErrorToast, addPersistentErrorToast } = useToast()

  const handleDescriptionChange = e => {
    const { value } = e.target
    // max allowed char for summary field in 100 from maximo
    if (value.length > 100) {
      setValue('memo', value.slice(0, 100))

      addErrorToast({
        subtitle: 'Characters limit 100',
        caption: 'Limit exceed'
      })
    }
  }

  useEffect(() => {
    if (starttime) {
      setValue('finishtime', moment(starttime).add(1, 'hours'))
    }
  }, [starttime])

  const descriptionProps = {
    id: 'memo',
    name: 'memo',
    labelText: 'Description*',
    type: 'text',
    placeholder: 'Enter description',
    ref: register,
    invalid: !memo,
    onChange: handleDescriptionChange
  }

  const validateInputFields = ({ starttime, finishtime }) => {
    const errors = []

    const start = moment(starttime).format('YYYY-MM-DD HH:mm')
    const finish = moment(finishtime).format('YYYY-MM-DD HH:mm')
    const server = moment(serverDate)
      .add(1, 'minutes')
      .format('YYYY-MM-DD HH:mm')

    if (!moment(start).isBefore(moment(finish))) {
      errors.push('Start date must be less than End date')
    }

    if (!moment(finish).isBefore(moment(server))) {
      errors.push('End date can not be in the future')
    }

    if (starttime && finishtime) {
      const duration = moment.duration(moment(finishtime).diff(moment(starttime)))
      const hours = duration.as('hours')
      if (hours > 16) {
        errors.push('The difference between the start and end dates cannot be more than 16 hours.')
      }
    }

    if (errors.length) {
      addErrorToast({
        subtitle: errors.join('\n\n'),
        className: 'afp-error'
      })
    }

    return !errors?.length
  }

  const handleSubmit = async formdata => {
    const isValid = validateInputFields(formdata)
    if (!isValid) {
      return false
    }

    const attendance = formdata
    attendance.pelassignmentid = assignmentid
    attendance.laborcode = laborcode
    attendance.refwo = wonum
    attendance.startdate = moment(starttime).format('YYYY-MM-DD')
    attendance.finishdate = moment(finishtime).format('YYYY-MM-DD')
    attendance.pelnumattendees = +attendance.pelnumattendees

    if (editAttendance) {
      attendance.href = data.href
    }

    const labtrans = []
    labtrans.push(attendance)

    try {
      addAttendanceModelRef.current.handleClose()
      showLoading(true)

      const res = await api.post(
        `/pelos/pelassignment/${assignmentid}`,
        { labtrans },
        {
          headers: {
            'x-method-override': 'PATCH',
            patchtype: 'MERGE',
            properties: config.search.pelassignment.fields
          }
        }
      )

      if (onUpdate) {
        addSuccessToast({
          subtitle: `Attendance ${editAttendance ? 'updated' : 'added'} successfully`
        })
        onUpdate(res?.data)
      }
    } catch (err) {
      addPersistentErrorToast({
        subtitle: `Failed to ${editAttendance ? 'update' : 'add'} attendance`,
        caption: err.message
      })
      showLoading(false)
    }
  }

  const getServerDate = async () => {
    try {
      await api.get(`ping`).then(res => {
        setServerDate(new Date(res.headers.date))
      })
    } catch (err) {
      addPersistentErrorToast({
        subtitle: 'Cound not retrieve server date',
        caption: err.message
      })
    }
  }

  const modalProps = {
    modalHeading: editAttendance ? 'Edit Attendance' : 'Create Attendance',
    primaryButtonText: 'Save Attendance',
    className: 'pel-modal pel-attendance-modal',
    shouldCloseAfterSubmit: false,
    handleSubmit: form.handleSubmit(handleSubmit),
    primaryButtonDisabled: addOrUpdateButtonDisabled,
    preventCloseOnClickOutside: true,
    beforeOpen: () => {
      reset(defaultValues)
      if (!editAttendance) {
        getServerDate()
      }
    }
  }
  if (editAttendance) {
    modalProps.renderTriggerButtonIcon = () => <Edit16 />
    modalProps.triggerButtonKind = 'tertiary'
    modalProps.buttonTriggerClassName =
      'flex pel--history-button bx--btn--sm bx--btn--icon-only no-border'
  } else {
    modalProps.buttonTriggerText = 'Create Attendance'
  }

  return (
    <PelModalWrapper {...modalProps} ref={addAttendanceModelRef}>
      <Form className="pel--attendance-list-table">
        <TextInput {...descriptionProps} className="pel--text-inpt" />
        <PelDateTimePicker.Rhf
          label="Start*"
          name="starttime"
          control={control}
          minDate=""
          maxDate={serverDate}
        />
        <PelDateTimePicker.Rhf
          label="End*"
          name="finishtime"
          control={control}
          minDate={watch('starttime')}
          maxDate={serverDate}
        />
        <PelTextInput
          type="number"
          ref={register}
          id="pelnumattendees"
          name="pelnumattendees"
          labelText="Number of Attendees"
          invalid={pelnumattendees < 1 && pelnumattendees <= 10}
          min={0}
          max={10}
        />
      </Form>
    </PelModalWrapper>
  )
}

CreateAttendance.propTypes = {
  data: PropTypes.objectOf({
    memo: PropTypes.string,
    start: PropTypes.string,
    finish: PropTypes.string,
    href: PropTypes.string
  }),
  onUpdate: PropTypes.func,
  showLoading: PropTypes.func,
  editAttendance: PropTypes.bool,
  assignment
}
