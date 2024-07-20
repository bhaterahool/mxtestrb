import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  DataTableSkeleton,
  TableCell,
  Modal
} from 'carbon-components-react'
import { useObject } from '../../../../shared/hooks/useObject'
import { api } from '../../../app/api'
import { PelTableRow, DateCell } from '../../../../shared/CarbonHelpers/DataTable'

export const AfpLineStatusHistoryModal = ({
  objectStructure,
  query,
  pelAfpLineId,
  modalTitle,
  ...props
}) => {
  if (!query || !pelAfpLineId) {
    return null
  }

  const { loading, data } = useObject(
    api,
    objectStructure,
    `${query}&_dropnulls=1`,
    false 
  )

  const history = loading
    ? []
    : data?.member
        ?.map(hist => ({
          id: String(hist.pelafplinestatushistid),
          ...hist
        }))
        .sort((a, b) => {
          if (a.changedate < b.changedate) return -1
          if (a.changedate > b.changedate) return 1
          return 0
        })

  const modalProps = {
    modalHeading: modalTitle,
    className: 'pel-modal',
    passiveModal: true,
    ...props
  }

  const tableHeaders = [
    {
      header: 'Status',
      key: 'status'
    },
    {
      header: ' Status Memo',
      key: 'statusmemo'
    },
    {
      header: 'Change Date',
      key: 'changedate'
    },
    {
      header: 'Change By',
      key: 'changeby'
    }
  ]

  return (
    <Modal {...modalProps}>
      <div className="pel--container bx--grid pel--worklogs pel-flex-column no-padding">
        {loading ? (
          <DataTableSkeleton headers={tableHeaders} />
        ) : (
          <DataTable
            headers={tableHeaders}
            locale="en"
            rows={history ?? []}
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
                    {rows.length > 0 ? (
                      rows.map(row => (
                        <PelTableRow
                          {...getRowProps({ row })}
                          row={row}
                          render={({ rowData }) => (
                            <>
                              <TableCell>{rowData.status}</TableCell>
                              <TableCell>{rowData.statusmemo}</TableCell>
                              <DateCell value={rowData.changedate} />
                              <TableCell>{rowData.changeby}</TableCell>
                            </>
                          )}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>No Data Found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          />
        )}
      </div>
    </Modal>
  )
}

AfpLineStatusHistoryModal.propTypes = {
  modalTitle: PropTypes.string,
  objectStructure: PropTypes.string,
  query: PropTypes.string,
  pelAfpLineId: PropTypes.number
}
