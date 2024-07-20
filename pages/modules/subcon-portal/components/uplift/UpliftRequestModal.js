import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, TextArea } from 'carbon-components-react'
import moment from 'moment'
import { useForm, useWatch } from 'react-hook-form'
import MacShift16 from '@carbon/icons-react/lib/mac--shift/16'
import { useDispatch } from 'react-redux'
import { PelTextInput } from '../../../../shared/forms'
import getRelativePath from '../../../../util/getRelativePath'
import { api } from '../../../app/api'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import { PelModalWrapper } from '../../../contact-center/components/PelModalWrapper'
import './UpliftRequestModal.scss'
import config from '../../../app/config'
import * as actions from '../../state/actions'
import { assignment } from '../form/props'
import { fetchAssignmentById } from '../../services/apiHandler'
import { ConfirmationModal } from '../../../../shared/components/Modal/ConfirmationModal'
import { Loading } from '../../../shared-components/Loading'

export const UpliftRequestModal = ({ assignment, formData, data }) => {
  const { register, setValue, handleSubmit, control, getValues } = useForm()
  const [showConfirmationDialog, setShowConfirmationDialog] = useState({
    open: false,
    data: null
  })

  const [loading, setLoading] = useState(false)
  const upliftModelRef = useRef()
  const dispatch = useDispatch()

  const { addSuccessToast, addErrorToast, addPersistentErrorToast } = useToast()

  const wpservice = assignment?.wpservice?.[0] ?? []

  const isUpliftRejected = wpservice?.pelupliftstatus === 'REJECTED'

  const calUpliftcost = () => {
    if (wpservice.pelupliftcost && isUpliftRejected) {
      return 0
    }
    if (wpservice.pelupliftcost) {
      return wpservice.pelupliftcost - wpservice.linecost ?? 0
    }

    return 0
  }

  const [upliftamount, setUpliftamount] = useState(calUpliftcost())

  const [total, setTotal] = useState(wpservice.pelupliftcost ?? 0 + wpservice.linecost ?? 0)

  const postRequest = wp => {
    api
      .post(getRelativePath(assignment?.href), wp, {
        headers: {
          patchtype: 'MERGE',
          'x-method-override': 'PATCH',
          'Content-Type': 'application/json',
          properties: config.search.pelassignment.fields
        }
      })
      .then(res => {
        addSuccessToast({
          subtitle: 'Uplift Request saved successfully'
        })

        if (res?.data) {
          dispatch(actions.updateAssignment(res.data))
        }
        
      })
      .catch(error => {
        addPersistentErrorToast({
          subtitle: error.message
        })
      })
      .finally(() => {
        setLoading(false)
        upliftModelRef.current.handleClose()
      })
  }

  const handleFormSubmit = formdata => {
    const upliftRequestData = formdata
    upliftRequestData.pelupliftcost = parseInt(total)
    upliftRequestData.pelupliftdate = new Date()
    upliftRequestData.href = wpservice.href
    upliftRequestData.pelupliftstatus = 'PENDING'
    const wp = {
      wpservice: [upliftRequestData]
    }

    setLoading(true)

    fetchAssignmentById(assignment.assignmentid).then(res => {
      if (res.ok) {
        if (+wpservice?.linecost === +res?.result?.wpservice?.[0]?.linecost) {
          postRequest(wp)
        } else {
          setLoading(false)
          setShowConfirmationDialog({
            open: true,
            data: res.result
          })
        }
      }
    })
  }

  const handleRecall = () => {
    const formdata = {
      href: wpservice.href,
      pelupliftdate: new Date(),
      pelupliftstatus: 'REJECTED',
      pelupliftdesc: getValues('pelupliftdesc')
    }
    const wp = {
      wpservice: [formdata]
    }
    postRequest(wp)
  }

  const secondaryBtnList = [
    {
      buttonText: 'Cancel',
      onClick: () => {
        upliftModelRef.current.handleClose()
      }
    },
    {
      buttonText: 'Recall',
      onClick: () => {
        handleRecall()
        upliftModelRef.current.handleClose()
      }
    }
  ]

  const modalProps = {
    modalHeading: 'Uplift Request',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    size: 'sm',
    renderTriggerButtonIcon: () => <MacShift16 />,
    handleSubmit: handleSubmit(handleFormSubmit),
    triggerButtonKind: 'tertiary',
    secondaryButtons:
      wpservice.pelupliftstatus === 'PENDING' || wpservice.pelupliftstatus === 'WDECISION'
        ? secondaryBtnList
        : [
            {
              buttonText: 'Cancel',
              onClick: () => {
                upliftModelRef.current.handleClose()
              }
            }
          ],
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    formData,
    data,
    saveFn: handleSubmit,
    beforeOpen: () => {
      setTotal(
        wpservice.pelupliftcost && !isUpliftRejected ? wpservice.pelupliftcost : wpservice.linecost
      )
      setUpliftamount(calUpliftcost())
      setValue('pelupliftcost', calUpliftcost())
    }
  }

  const upliftdateProps = {
    id: 'pelupliftdate',
    name: 'pelupliftdate',
    labelText: 'Uplift Date',
    type: 'text',
    ref: register
  }

  const currentPValueProps = {
    id: 'wlcurrentpvalue',
    name: 'wlcurrentpvalue',
    labelText: 'Current Purchase Order Value',
    type: 'text'
  }

  const upliftstatusProps = {
    id: 'pelupliftstatus',
    name: 'pelupliftstatus',
    labelText: 'Uplift Status',
    value: !isUpliftRejected ? wpservice.pelupliftstatus : '',
    type: 'text',
    ref: register
  }

  const upliftamountProps = {
    id: 'pelupliftcost',
    name: 'pelupliftcost',
    labelText: 'Uplift Amount',
    type: 'number',
    min: `-${wpservice.linecost}`,
    defaultValue: upliftamount,
    ref: register
  }

  const upliftamountTotalProps = {
    id: 'totalcost',
    name: 'totalcost',
    labelText: 'Total',
    type: 'number'
  }

  const upliftcost = useWatch({ control, name: 'pelupliftcost' })

  useEffect(() => {
    if (upliftcost) {
      const upliftcostInt = parseInt(upliftcost)
      const upliftcostSign = Math.sign(upliftcostInt)
      if (upliftcostSign === -1) {
        const isValid = upliftcostInt * upliftcostSign <= wpservice.linecost
        if (isValid) {
          const value = wpservice.linecost + upliftcostInt
          setTotal(value)
        } else {
          addErrorToast({
            subtitle: 'Negative Uplift Amount cannot exceed the exceed PO value'
          })
          setValue('pelupliftcost', calUpliftcost())
        }
      } else {
        const value = wpservice.linecost + upliftcostInt
        setTotal(value)
      }
    } else {
      setTotal(wpservice.linecost)
    }
  }, [upliftcost])

  const notesProps = {
    id: 'pelupliftdesc',
    name: 'pelupliftdesc',
    labelText: 'Uplift Description',
    type: 'text',
    placeholder: 'Enter description',
    defaultValue: wpservice.pelupliftdesc,
    ref: register
  }

  const handleOnConfirmationDialoagSubmit = () => {
    if (showConfirmationDialog?.data) {
      dispatch(actions.updateAssignment(showConfirmationDialog.data))
    }

    setShowConfirmationDialog({
      open: false,
      data: null
    })

    addSuccessToast({
      subtitle: 'Assignment Reloaded.'
    })
  }

  const handleOnConfirmationDialoagCancelOrClose = () => {
    setShowConfirmationDialog({
      open: false,
      data: null
    })
  }

  return (
    <>
      {loading && <Loading modal />}
      <ConfirmationModal
        open={showConfirmationDialog.open}
        primaryButtonText="Reload Assignment"
        modalHeading="Uplift Request"
        modalDescription="The current Purchase Order value has changed since you opened this Assignment. Please refresh before requesting another uplift."
        onSubmit={handleOnConfirmationDialoagSubmit}
        onClose={handleOnConfirmationDialoagCancelOrClose}
        onCancel={handleOnConfirmationDialoagCancelOrClose}
      />
      <PelModalWrapper {...modalProps} ref={upliftModelRef}>
        <Form>
          <h4>Please enter the details and describe the reason for the uplift request</h4>
          <div className="bx--row">
            <div className="bx--col-lg-6 bx--col-md-6">
              <PelTextInput {...upliftdateProps} value={moment().format('lll')} readOnly />
              <PelTextInput {...upliftstatusProps} readOnly />
            </div>
            <div className="bx--col-lg-6 bx--col-md-6">
              <PelTextInput {...currentPValueProps} value={wpservice.linecost} readOnly />
              <PelTextInput {...upliftamountProps} />
            </div>
            <div className="bx--offset-lg-6 bx--col-md-4">
              <PelTextInput {...upliftamountTotalProps} value={total} readOnly />
            </div>
          </div>
          <TextArea {...notesProps} className="pel--uplift-request-text-area" />
        </Form>
      </PelModalWrapper>
    </>
  )
}

UpliftRequestModal.propTypes = {
  assignment,
  formData: PropTypes.shape(PropTypes.any),
  data: PropTypes.shape(PropTypes.any)
}
