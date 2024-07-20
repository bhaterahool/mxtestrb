import React from 'react'
import PropTypes from 'prop-types'
import { DataTable } from 'carbon-components-react'
import { PelTableRow, TooltipCell, DateCell } from '../../../shared/CarbonHelpers/DataTable'
import { WorkHistoryModal } from '../../../shared/forms/WorkHistoryModal'
import { BookAppointmentModal } from './BookAppointmentModal'
import { serviceRequest } from '../props/serviceRequest'
import { CancelAppointmentModal } from './CancelAppointmentModal'
import { StatusChangeModal } from './status-change/StatusChangeModal'
import { decimalTime } from '../../../util/decimalTime'

export const WorkOrderLabour = ({ wo, sr, reload }) => {
  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader
  } = DataTable

  if (!wo?.assignment || wo?.assignment?.length === 0) {
    return ''
  }

  // carbon datatable required string "id" property on row data
  const tabledata = wo.assignment.map(ass => ({ id: ass.assignmentid.toString(), ...ass }))

  // condition to show book app btn
  const showBookApp = wo.assignment?.[0]?.pelsendtoclick && wo.assignment?.[0]?.apptrequired

  // condition to show cancel app btn
  const showCancelAppBtn =
    wo.assignment?.[0]?.pelsendtoclick &&
    wo.assignment?.[0]?.apptrequired &&
    wo.assignment?.[0]?.pelappointslotstart &&
    wo.assignment?.[0]?.pelappointslotfinish

  const columns = [
    {
      header: 'Craft',
      key: 'craft'
    },
    {
      header: 'Assigned To',
      key: 'laborcode'
    },
    {
      header: 'Status',
      key: 'status_description'
    },
    {
      header: 'Start',
      key: 'scheduledate'
    },
    {
      header: 'Duration (hrs)',
      key: 'laborhrs'
    },
    {
      header: 'Description',
      key: 'peldescription'
    },
    {
      header: '',
      key: 'pelappointslotstart'
    },
    {
      header: '',
      key: 'status'
    }
  ]

  return (
    <>
      <div className="bx--form pel--indent">
        <h4 className="pel--sub-header">Work Assignments</h4>
        <DataTable
          headers={columns}
          locale="en"
          rows={tabledata}
          size={null}
          render={({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getTableContainerProps
          }) => (
            <TableContainer
              {...getTableContainerProps()}
              className={rows.length < 5 ? 'cc-table-container' : ''}
            >
              <Table {...getTableProps()}>
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
                      key={`${Math.random()}}`}
                      render={({ rowData }) => (
                        <>
                          <TableCell>{rowData.craft?.[0]?.description}</TableCell>
                          <TooltipCell
                            value={rowData.laborcode}
                            key="laborcode"
                            objectType="MXLABOR"
                            title="person[0].displayname"
                            query={`oslc.where=laborcode="${rowData.laborcode}"&oslc.select=*&lean=1`}
                            loadingElement={<>{rowData.laborcode}</>}
                            fields={[
                              {
                                field: 'person[0].primaryemail'
                              },
                              {
                                field: 'person[0].primaryphone'
                              }
                            ]}
                          />
                          <TableCell>
                            <div className="flex align-center">
                              {rowData.status_description}
                              {rowData.status === 'WAPPTOPTION' && (
                                <StatusChangeModal
                                  currentStatus={rowData.status_description}
                                  sr={sr}
                                  assignmentData={wo?.assignment?.[0]}
                                />
                              )}
                              <WorkHistoryModal
                                objectStructure="PELASSIGNMENT"
                                historyObjectName="pelassignmenthistory"
                                query={
                                  row?.id &&
                                  `oslc.where=assignmentid=${row.id}&oslc.select=wonum,craft,laborcode,peldescription,siteid,pelassignmenthistory{*},pelperson{displayname,primaryemail,primaryphone}`
                                }
                                modalTitle="Assignment Status History"
                              />
                            </div>
                          </TableCell>
                          <DateCell value={rowData.scheduledate} />
                          <TableCell>{decimalTime(rowData.laborhrs)}</TableCell>
                          <TableCell>{rowData.peldescription}</TableCell>
                          <TableCell>
                            {showBookApp && ['WAPPT'].includes(rowData.status) && (
                              <div className="flex align-center">
                                <BookAppointmentModal
                                  ticketid={sr?.ticketid}
                                  assignmentid={row?.id && row.id}
                                  reload={reload}
                                />
                              </div>
                            )}
                            {['ASSIGNED'].includes(rowData.status) && showCancelAppBtn && (
                              <div className="flex align-center">
                                <CancelAppointmentModal
                                  wonum={wo?.wonum}
                                  assignmentid={row?.id && row.id}
                                  reload={reload}
                                  ticketid={sr?.ticketid}
                                />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>&nbsp;</TableCell>
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
    </>
  )
}

WorkOrderLabour.propTypes = {
  wo: PropTypes.shape({
    assignment: PropTypes.arrayOf(
      PropTypes.shape({
        assignmentid: PropTypes.number,
        pelownersystem: PropTypes.string,
        pelsendtoclick: PropTypes.bool,
        pelappointslotstart: PropTypes.string,
        pelappointslotfinish: PropTypes.string,
        apptrequired: PropTypes.bool
      })
    ),
    wonum: PropTypes.string
  }),
  sr: serviceRequest,
  reload: PropTypes.func.isRequired
}
