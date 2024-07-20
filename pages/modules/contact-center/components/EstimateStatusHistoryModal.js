import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Time16 from '@carbon/icons-react/lib/time/16'
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
import { useObject } from '../../../shared/hooks/useObject'
import { api } from '../../app/api'
import { PelModalWrapper } from './PelModalWrapper'
import { PelTableRow, DateCell, TooltipCell } from '../../../shared/CarbonHelpers/DataTable'

export const EstimateStatusHistoryModal = ({
  objectStructure,
  historyObjectName,
  query,
  ...props
}) => {
  if (!query) {
    return null
  }

  const [state, setState] = useState({
    loadData: false
  })

  const { loading, data, error } = useObject(
    api,
    objectStructure,
    state.loadData ? `${query}&_dropnulls=1` : null
  )

  const history = loading
    ? []
    : data?.member
        ?.map(hist => ({
          id: hist.worklogid,
          ...hist
        }))
        .sort((a, b) => {
          if (a.modifydate < b.modifydate) return -1
          if (a.modifydate > b.modifydate) return 1
          return 0
        })

  const modalProps = {
    modalHeading: 'Estimate Status History',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: true,
    renderTriggerButtonIcon: () => <Time16 />,
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'flex pel--history-button bx--btn--sm bx--btn--icon-only no-border',
    beforeOpen: () => {
      setState({ loadData: true })
    },
    ...props
  }

  const tableHeaders = [
    {
      header: 'Estimate Status',
      key: 'pluspeststat'
    },
    {
      header: 'Estimate Date',
      key: 'modifydate'
    },
    {
      header: 'Change By',
      key: 'modifyby'
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
                    {rows.map(row => (
                      <PelTableRow
                        {...getRowProps({ row })}
                        row={row}
                        render={({ rowData }) => (
                          <>
                            <TableCell>{rowData.pluspeststat}</TableCell>
                            <DateCell value={rowData.modifydate} />
                            <TableCell>{rowData.modifyby}</TableCell>
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

EstimateStatusHistoryModal.propTypes = {
  historyObjectName: PropTypes.string,
  objectStructure: PropTypes.string,
  query: PropTypes.string
}
