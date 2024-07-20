import React, { useState, useEffect } from 'react'
import { DataTable } from 'carbon-components-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { assignment } from '../../../modules/subcon-portal/components/form/props'
import { api } from '../../../modules/app/api'
import { CreateAttendance } from './CreateAttendance'
import { NoResults } from '../../../modules/contact-center/components/NoResults'
import { PelTableRow, DateCell } from '../../CarbonHelpers/DataTable'
import getRelativePath from '../../../util/getRelativePath'
import { useToast } from '../../toasts/ToastProvider'
import './scss/table.scss'
import { DeleteConfirmationModal } from '../../components/Modal/DeleteConfirmationModal'

export const AttendanceList = ({
  assignment,
  hideCreateButton,
  handleAssignmentUpdate,
  showLoading,
  reloadAssignment
}) => {
  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader
  } = DataTable

  const [state, setState] = useState()
  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const convertLabtrans = sr => {
    const dupSr = sr?.labtrans?.filter(attandance => attandance?.labtransid)
    return {
      attendanceListData: dupSr
        ? dupSr.map(labtrans => ({
            id: labtrans?.labtransid?.toString(),
            memo: labtrans?.memo,
            start: labtrans?.starttime || labtrans?.startdate,
            finish: labtrans?.finishtime || labtrans?.finishdate,
            localref: labtrans?.localref,
            pelnumattendees: labtrans?.pelnumattendees,
            href: labtrans?.href
          }))
        : [], 
      sr
    }
  }

  useEffect(() => {
    if (assignment) {
      setState(convertLabtrans(assignment))
    }
  }, [assignment])

  const deleteRecord = async id => {
    const recordToDelete = state?.attendanceListData?.find(attandance => attandance?.id === id)
    const deleteURL = getRelativePath(recordToDelete.localref).replace('pelos/', 'os/')
    try {
      showLoading(true)
      const res = await api.delete(deleteURL)
      if (res.status === 204) {
        addSuccessToast({
          subtitle: `Attendance record deleted successfully`
        })

        setState(state => ({
          ...state,
          attendanceListData: state?.attendanceListData?.filter(row => row?.id !== id)
        }))
        reloadAssignment(Math.random())
      }
      showLoading(false)
    } catch (err) {
      addPersistentErrorToast({
        subtitle: `Failed to delete the attendance record`,
        caption: err.message
      })
      showLoading(false)
    }
  }

  const handleUpdate = data => {
    handleAssignmentUpdate(data)
    showLoading(false)
  }

  return (
    <>
      {state?.attendanceListData?.length > 0 && (
        <div className="pel--container pel-flex-column">
          <DataTable
            headers={[
              {
                header: 'Description',
                key: 'memo'
              },
              {
                header: 'Start Date & Time',
                key: 'start'
              },
              {
                header: 'End Date & Time',
                key: 'finish'
              },
              {
                header: 'Number of Attendees',
                key: 'pelnumattendees'
              },
              {
                header: '',
                key: 'id'
              }
            ]}
            locale="en"
            rows={state.attendanceListData}
            size={null}
            render={({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getTableContainerProps
            }) => (
              <TableContainer {...getTableContainerProps()}>
                <Table {...getTableProps()} className="pel--attendance-list-table">
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <PelTableRow
                        {...getRowProps({ row })}
                        row={row}
                        render={({ rowData }) => (
                          <>
                            <TableCell>{rowData.memo}</TableCell>
                            <DateCell value={rowData.start} />
                            <DateCell value={rowData.finish} />
                            <TableCell>{rowData.pelnumattendees}</TableCell>
                            <TableCell>
                              {!hideCreateButton && (
                                <div className="attendence-action__buttons">
                                  <CreateAttendance
                                    data={state?.attendanceListData?.find(
                                      ({ id }) => id === row.id
                                    )}
                                    onUpdate={handleUpdate}
                                    assignment={assignment}
                                    editAttendance
                                    showLoading={showLoading}
                                  />
                                  <DeleteConfirmationModal
                                    data={row}
                                    modalHeading="Are you sure you want to delete this Attendance record?"
                                    handleOnDelete={({ id = '' }) => deleteRecord(id)}
                                  />
                                </div>
                              )}
                            </TableCell>
                          </>
                        )}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          />
        </div>
      )}
      {!state?.attendanceListData?.length && (
        <NoResults
          heading="No Attendance Found"
          description="This service request does not currently have any attendance records."
        />
      )}
      {!hideCreateButton && (
        <div className="bx--row pel--footer-bar">
          <CreateAttendance
            onUpdate={handleUpdate}
            assignment={assignment}
            showLoading={showLoading}
          />
        </div>
      )}
    </>
  )
}

AttendanceList.propTypes = {
  assignment,
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  hideCreateButton: PropTypes.bool.isRequired,
  handleAssignmentUpdate: PropTypes.func.isRequired,
  showLoading: PropTypes.func,
  reloadAssignment: PropTypes.func
}
