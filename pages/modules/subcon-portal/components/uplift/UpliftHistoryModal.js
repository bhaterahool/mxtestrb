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
import { useObject } from '../../../../shared/hooks/useObject'
import { api } from '../../../app/api'
import { LongDescriptionModal } from '../../../../shared/forms'
import { PelModalWrapper } from '../../../contact-center/components/PelModalWrapper'
import { PelTableRow, DateCell, TooltipCell } from '../../../../shared/CarbonHelpers/DataTable'

export const UpliftHistoryModal = ({
  objectStructure,
  upliftHistoryObjectName,
  query,
  ...props
}) => {
  if (!query) {
    return null
  }

  const [state, setState] = useState({
    loadData: false
  })

  const [refresh, setRefresh] = useState(false)

  const { loading, data, error } = useObject(
    api,
    objectStructure,
    state.loadData ? query : null,
    false, 
    refresh,
    true 
  )

  const history = loading
    ? []
    : data?.member?.[0]?.[upliftHistoryObjectName]
        ?.map(hist => ({
          id: hist.eaudittransid,
          ...hist
        }))
        .sort((a, b) => {
          if (a.pelupliftdate < b.pelupliftdate) return -1
          if (a.pelupliftdate > b.pelupliftdate) return 1
          return 0
        })

  const modalProps = {
    modalHeading: 'Uplift Status History',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: true,
    renderTriggerButtonIcon: () => <Time16 />,
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    beforeOpen: () => {
      setState({ loadData: true })
      setRefresh(Math.random())
    },
    ...props
  }

  const tableHeaders = [
    {
      header: 'Change Date',
      key: 'pelupliftdate'
    },
    {
      header: 'Status',
      key: 'pelupliftstatus'
    },
    {
      header: 'PO Value',
      key: 'linecost'
    },
    {
      header: 'Uplift Total',
      key: 'pelupliftcost'
    },
    {
      header: 'Comment',
      key: 'pelupliftdesc'
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
                            <DateCell value={rowData.pelupliftdate} />
                            <TableCell>{rowData.pelupliftstatus}</TableCell>
                            <TableCell>{rowData.linecost}</TableCell>
                            <TableCell>{rowData.pelupliftcost}</TableCell>
                            <TableCell>
                              {rowData.pelupliftdesc}
                              {rowData.longdescription && (
                                <LongDescriptionModal
                                  longdescription={rowData.pelupliftdesc_longdescription}
                                />
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
        )}
      </div>
    </PelModalWrapper>
  )
}

UpliftHistoryModal.propTypes = {
  objectStructure: PropTypes.string.isRequired,
  upliftHistoryObjectName: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired
}
