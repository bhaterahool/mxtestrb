import { DataTable } from 'carbon-components-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { PelTableRow } from '../../CarbonHelpers/DataTable'
import './scss/table.scss'

export const PersonInfo = ({ data, mitcateam }) => {
  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader
  } = DataTable

  const clientRecords =
    mitcateam && data?.member
      ? [].concat(
          ...[].concat(
            ...data?.member?.map(gpr =>
              gpr?.persongroupteam?.map(pgt =>
                pgt?.person?.map(p => ({
                  id: p?.personid || '',
                  personid: p?.personid || '',
                  displayname: p?.displayname || '',
                  email: p.email[0]?.emailaddress || ''
                }))
              )
            )
          )
        )
      : []

  return (
    <>
      <div className="pel--container pel-flex-column pel--bottom-space pel--worklogs-table-toolbar">
        <DataTable
          headers={[
            {
              header: 'Person ID',
              key: 'personid',
              visible: true
            },
            {
              header: 'Name',
              key: 'displayname',
              visible: true
            },
            {
              header: 'Email',
              key: 'email',
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
                          <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
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
                          <TableCell>{rowData.personid}</TableCell>
                          <TableCell>{rowData.displayname}</TableCell>
                          <TableCell>{rowData.email}</TableCell>
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

PersonInfo.propTypes = {
  data: PropTypes.shape({
    member: PropTypes.arrayOf(PropTypes.object)
  }),
  mitcateam: PropTypes.string
}
