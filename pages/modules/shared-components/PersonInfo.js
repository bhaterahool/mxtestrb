import { DataTable, Checkbox } from 'carbon-components-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  PelTableRow,
  DateCell
} from '../../CarbonHelpers/DataTable'
import './scss/table.scss'

export const ClientApproval = ({
  data
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

  const clientRecords = data?.member?.map(item => ({ id: item.mitcahistoryid, ...item }))
  return (
    <>
        <div className="pel--container pel-flex-column pel--bottom-space pel--worklogs-table-toolbar">
          <DataTable
            headers={[
              {
                header: 'Change Date',
                key: 'changedate',
                visible: true
              },
              {
                header: 'Change By',
                key: 'changeby',
                visible: true
              },
              {
                header: 'Client Approval Status',
                key: 'mitcastatus',
                visible: true
              },
              {
                header: 'Date of Client Approval',
                key: 'mitcadate',
                visible: true
              },
              {
                header: 'Client Approver Person',
                key: 'mitcaperson',
                visible: true
              },
              {
                header: 'Client Approver Team',
                key: 'mitcateam',
                visible: true
              },
              {
                header: 'Reason for change in client Approval',
                key: 'mitcareason',
                visible: true
              },
              {
                header: 'Site ID',
                key: 'siteid',
                visible: true
              }
            ]}
            locale="en"
            rows={clientRecords ?? []}
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
                <Table {...getTableProps()} className="pel--worklogs-table">
                  <TableHead>
                    <TableRow>
                      {headers.map(
                        header =>
                          header.visible && (
                            <TableHeader {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows?.map(row => (
                      <PelTableRow
                        {...getRowProps({ row })}
                        row={row}
                        render={({ rowData }) => (
                          <>
                            <DateCell value={rowData.changedate} />
                            <TableCell>{rowData.changeby}</TableCell>
                            <TableCell>{rowData.mitcastatus}</TableCell>
                            <DateCell value={rowData.mitcadate} />
                            <TableCell>{rowData.mitcaperson}</TableCell>
                            <TableCell>{rowData.mitcateam}</TableCell>
                            <TableCell>{rowData.mitcareason}</TableCell>
                            <TableCell>{rowData.siteid}</TableCell>
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


ClientApproval.propTypes = {
  data: PropTypes.shape({
    member: PropTypes.arrayOf(PropTypes.object)
  })
}