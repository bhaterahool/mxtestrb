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
import { useObject } from '../../shared/hooks/useObject'
import { api } from '../app/api'
import { PelModalWrapper } from './components/PelModalWrapper'
import { PelTableRow, DateCell, TooltipCell } from '../../shared/CarbonHelpers/DataTable'

export const CarStatusHistoryModal = ({ objectStructure, historyObjectName, query, ...props }) => {
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
          id: hist.pelsrcarstatushistid,
          ...hist
        }))
        .sort((a, b) => {
          if (a.changedate < b.changedate) return -1
          if (a.changedate > b.changedate) return 1
          return 0
        })

  const modalProps = {
    modalHeading: 'CAR Status History',
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
      header: 'Status',
      key: 'status'
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
                            <TableCell>{rowData.mandatestatus}</TableCell>
                            <DateCell value={rowData.changedate} />
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

CarStatusHistoryModal.propTypes = {
  historyObjectName: PropTypes.string,
  objectStructure: PropTypes.string,
  query: PropTypes.string
}
