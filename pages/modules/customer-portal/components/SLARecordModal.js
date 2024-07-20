import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Hourglass16 from '@carbon/icons-react/lib/hourglass/16'
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  DataTableSkeleton,
  TableCell
} from 'carbon-components-react'
import { PelModalWrapper } from './PelModalWrapper'
import { PelTableRow, DateCell } from '../../../shared/CarbonHelpers/DataTable'
import { useObject } from '../../../shared/hooks/useObject'
import { api } from '../../app/api'

export const SLARecordModal = ({ ticketuid, ...props }) => {
  const query = `oslc.where=ownerid=${ticketuid}&querytemplate=BASIC_SEARCH&savedQuery=TICKETONLY`
  const { loading, data } = useObject(api, 'PELSLARECORD', query)

  const slaRecords = loading ? [] : data?.member?.map(record => ({ id: record.slanum, ...record }))

  const modalProps = {
    modalHeading: 'SR SLA Records',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: true,
    renderTriggerButtonIcon: () => <Hourglass16 />,
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    ...props
  }

  if (slaRecords?.length === 0) {
    return null
  }

  const tableHeaders = [
    {
      header: 'SLA no',
      key: 'slanum'
    },
    {
      header: 'Description',
      key: 'sla'
    },
    {
      header: 'Response Date',
      key: 'responsedate'
    },
    {
      header: 'Resolution Date',
      key: 'resolutiondate'
    }
  ]

  return (
    <PelModalWrapper {...modalProps}>
      <div className="pel--container bx--grid pel--worklogs pel-flex-column no-padding">
        {loading ? (
          <DataTableSkeleton headers={tableHeaders} />
        ) : (
          <DataTable
            headers={tableHeaders}
            locale="en"
            rows={slaRecords ?? []}
            size={null}
            render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => (
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
                        row={row}
                        render={({ rowData }) => (
                          <>
                            <TableCell>{rowData.slanum}</TableCell>
                            <TableCell>{rowData.sla.description}</TableCell>
                            <DateCell value={rowData.responsedate} />
                            <DateCell value={rowData.resolutiondate} />
                          </>
                        )}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          />
        )}
      </div>
    </PelModalWrapper>
  )
}

SLARecordModal.propTypes = {
  ticketuid: PropTypes.number
}
