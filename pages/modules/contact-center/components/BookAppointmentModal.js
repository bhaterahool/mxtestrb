import React, { useState } from 'react'
import {
  Form,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  DataTableSkeleton,
  TableSelectRow,
  TableCell,
  FormGroup,
  RadioButtonGroup,
  RadioButton
} from 'carbon-components-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Moment from 'react-moment'
import { PelModalWrapper } from './PelModalWrapper'
import { api } from '../../app/api'

import { useToast } from '../../../shared/toasts/ToastProvider'

export const BookAppointmentModal = ({ assignmentid, reload, ticketid, ...props }) => {
  if (!assignmentid) {
    return null
  }

  const { addSuccessToast, addPersistentErrorToast, addInfoToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [appointmentslots, setAppointmentslots] = useState({ data: [] })
  const [bookappointmentdata, setBookappointmentdata] = useState({})
  const [selectedRow, setSelectedRow] = useState()

  const getAppointmentsData = async data => {
    try {
      setLoading(true)
      const res = await api.post(`/pelos/PELAPPOINTREQUEST?&action=wsmethod:getAppointment`, data)
      setLoading(false)
      setBookappointmentdata({
        RecordKey: 'assignmentid',
        KeyValue: assignmentid,
        BookingID: res?.data?.BookingID,
        SlotFinish: '',
        SlotStart: '',
        Profile: data.Profile
      })

      const appointmentData = res?.data?.AvailableAppointments?.map((e, i) => ({
        ...e,
        id: i.toString(),
        value: i.toString()
      }))

      setAppointmentslots({ data: appointmentData })
    } catch (err) {
      const message = _.get(err, 'response.data.Error.message', err.message)
      addPersistentErrorToast({
        subtitle: 'Failed to retrive appointment slots',
        caption: message
      })
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedRow) {
      return
    }

    const data = {
      ...bookappointmentdata,
      SlotStart: selectedRow?.cells[0].value,
      SlotFinish: selectedRow?.cells[1].value
    }

    try {
      const result = await api.post(
        `/pelos/PELAPPOINTREQUEST?&action=wsmethod:bookAppointment`,
        data
      )
      if (result?.data['Status-Code'] === '200') {
        addInfoToast({
          subtitle: 'Please wait until booking is confirmed'
        })
        setTimeout(() => {
          addSuccessToast({
            subtitle: 'Appointment booked'
          })
          reload(ticketid)
        }, 30000)
      } else {
        addPersistentErrorToast({
          subtitle: 'Failed to book appointment',
          caption: result?.data['Status-Reason'] ?? 'Error booking appointment, please try again'
        })
      }
    } catch (err) {
      const message = _.get(err, 'response.data.Error.message', err.message)
      addPersistentErrorToast({
        subtitle: 'Failed to book appointment',
        caption: message ?? 'Error booking appointment, please try again'
      })
    }
  }

  const modalProps = {
    modalHeading: 'Appointment Booking',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    buttonTriggerText: 'Appointment Booking',
    buttonTriggerClassName: 'bx--btn--sm  pel--btn-small',
    handleSubmit,
    beforeOpen: () => {
      setLoading(true)
      getAppointmentsData({
        RecordKey: 'assignmentid',
        KeyValue: assignmentid,
        Profile: bookappointmentdata?.Profile ?? 'AM-PM'
      })
    },
    ...props
  }

  const tableHeaders = [
    {
      header: 'Start time',
      key: 'SlotStart'
    },
    {
      header: 'End time',
      key: 'SlotFinish'
    }
  ]

  const items = loading ? [] : appointmentslots.data

  return (
    <PelModalWrapper {...modalProps}>
      <Form>
        <FormGroup className="no-margin" legendText="Appointment Type">
          <RadioButtonGroup
            defaultSelected="AM-PM"
            name="Profile"
            orientation="vertical"
            labelPosition="right"
            onChange={value =>
              getAppointmentsData({
                RecordKey: 'assignmentid',
                KeyValue: assignmentid,
                Profile: value
              })
            }
          >
            <RadioButton value="AM-PM" id="radio-apptyp1" labelText="AM-PM" />
            <RadioButton value="Full Day" id="radio-apptyp2" labelText="Full Day" />
          </RadioButtonGroup>
        </FormGroup>
        {loading ? (
          <DataTableSkeleton showHeader={false} showToolbar={false} headers={tableHeaders} />
        ) : (
          items.length !== 0 && (
            <DataTable rows={items} headers={tableHeaders} radio>
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getSelectionProps,
                getTableProps,
                getTableContainerProps,
                selectRow
              }) => (
                <TableContainer title="Select a slot for appointment" {...getTableContainerProps()}>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        <th scope="col" aria-label=" " />
                        {headers.map((header, i) => (
                          
                          <TableHeader key={i} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, i) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          <TableSelectRow
                            {...getSelectionProps({ row, onClick: () => setSelectedRow(row) })}
                          />
                          {row.cells.map(cell => (
                            <TableCell
                              key={cell.id}
                              className="cell-select"
                              onClick={() => selectRow(row.id) || setSelectedRow(row)}
                            >
                              <Moment format="DD-MMM-YYYY HH:mm" read>
                                {cell.value}
                              </Moment>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          )
        )}
        {!loading && items.length === 0 && <div>No slots available for appointments</div>}
      </Form>
    </PelModalWrapper>
  )
}

BookAppointmentModal.propTypes = {
  objectStructure: PropTypes.string,
  assignmentid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reload: PropTypes.func.isRequired,
  ticketid: PropTypes.string
}
