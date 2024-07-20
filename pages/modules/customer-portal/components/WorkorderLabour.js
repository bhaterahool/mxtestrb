import React from 'react'
import PropTypes from 'prop-types'
import { DataTable } from 'carbon-components-react'
import { PelTableRow, TooltipCell, DateCell } from '../../../shared/CarbonHelpers/DataTable'
import { WorkHistoryModal } from '../../../shared/forms/WorkHistoryModal'
import { serviceRequest } from '../props/serviceRequest'
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
            <TableContainer {...getTableContainerProps()}>
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
                              <WorkHistoryModal
                                objectStructure="PELASSIGNMENT"
                                historyObjectName="pelassignmenthistory"
                                query={
                                  row?.id &&
                                  `oslc.where=assignmentid=${row.id}&oslc.select=wonum,craft,laborcode,peldescription,siteid,pelassignmenthistory{*},pelperson{displayname,primaryemail,primaryphone}`
                                }
                              />
                            </div>
                          </TableCell>
                          <DateCell value={rowData.scheduledate} />
                          <TableCell>{decimalTime(rowData.laborhrs)}</TableCell>
                          <TableCell>{rowData.peldescription}</TableCell>
                          <TableCell>
                            {sr?.locations?.[0]?.pelapptent && (
                              <div className="flex align-center" />
                            )}
                            {['ASSIGNED', 'DISPATCHED'].includes(rowData.status) && (
                              <div className="flex align-center" />
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
    </>
  )
}

WorkOrderLabour.propTypes = {
  wo: PropTypes.shape({
    assignment: PropTypes.arrayOf(
      PropTypes.shape({
        assignmentid: PropTypes.number
      })
    ),
    wonum: PropTypes.string
  }),
  sr: serviceRequest,
  reload: PropTypes.func.isRequired
}
