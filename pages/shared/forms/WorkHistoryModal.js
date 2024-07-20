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
import { useObject } from '../hooks/useObject'
import { api } from '../../modules/app/api'
import { PelModalWrapper } from '../../modules/contact-center/components/PelModalWrapper'
import { PelTableRow, DateCell, TooltipCell } from '../CarbonHelpers/DataTable'

export const WorkHistoryModal = ({
  objectStructure,
  historyObjectName,
  query,
  modalTitle,
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
    state.loadData ? `${query}&_dropnulls=1` : null,
    false, 
    refresh, 
    true 
  )

  const history = loading
    ? []
    : data?.member?.[0]?.[historyObjectName]
        ?.map(hist => ({
          id: `id${hist.wostatusid ?? hist.pelassignmenthistoryid}`,
          ...hist
        }))
        .sort((a, b) => {
          if (a.pelassignmenthistoryid < b.pelassignmenthistoryid) return -1
          if (a.pelassignmenthistoryid > b.pelassignmenthistoryid) return 1
          return 0
        })

  const modalProps = {
    modalHeading: modalTitle || 'Work Status History',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: true,
    renderTriggerButtonIcon: () => <Time16 />,
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'bx--btn--sm bx--btn--icon-only no-border',
    beforeOpen: () => {
      setRefresh(Math.random())
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
      key: 'person'
    },
    {
      header: 'Memo',
      key: 'memo'
    }
  ]

  const getRowDataById = id => history?.find(row => row.id === id) ?? {}

  return (
    <PelModalWrapper {...modalProps}>
      <div className="pel--container bx--grid pel--worklogs pel-flex-column no-padding">
        {loading ? (
          <DataTableSkeleton headers={tableHeaders} />
        ) : (
          history ? <DataTable
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
                        key={`${Math.random()}}`}
                        render={({ rowData }) => (
                          <>
                            <TableCell>{rowData.status}</TableCell>
                            <DateCell value={rowData.changedate} />
                            {rowData?.person ? <TooltipCell
                              title="displayname"
                              personData={rowData?.person}
                              fields={[
                                {
                                  field: 'primaryemail'
                                },
                                {
                                  field: 'primaryphone'
                                }
                              ]}
                            /> : <TableCell>{getRowDataById(row?.id)?.changeby || ''}</TableCell>}
                            <TableCell>{rowData.memo}</TableCell>
                          </>
                        )}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          /> : <div>No Data Found</div>
        )}
      </div>
    </PelModalWrapper>
  )
}

WorkHistoryModal.propTypes = {
  historyObjectName: PropTypes.string,
  objectStructure: PropTypes.string,
  query: PropTypes.string,
  modalTitle: PropTypes.string
}
