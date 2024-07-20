import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from 'carbon-components-react'
import { PelTableRow, DateCell } from '../../../shared/CarbonHelpers/DataTable'
import { isEmpty } from '../../../util'

export const CostBillingTable = ({ relatedWorkOrders, showNoDataFoundMsg = false }) => {
  const tabledata = relatedWorkOrders?.reduce((result, item) => {
    if (item?.pluspbillline?.length > 0 || item?.pluspbillbatch?.length > 0) {
      const [pluspbillline] = item.pluspbillline
      const [pluspbillbatch] = item.pluspbillbatch
      const workorderWithBillingInfo = _.merge({}, item, {
        agreedprice: pluspbillline.agreedprice,
        pluspBilllineStatus: pluspbillline.status_description,
        billbatchnum: pluspbillbatch.billbatchnum,
        pluspBillbatchStatus: pluspbillbatch.status_description,
        statusdate: pluspbillbatch.statusdate
      })

      result.push({
        id: item.wonum,
        ...workorderWithBillingInfo
      })
    }

    return result
  }, [])

  const columns = [
    {
      header: 'WONUM',
      key: 'wonum'
    },
    {
      header: 'Agreed Price',
      key: 'agreedprice'
    },
    {
      header: 'Status',
      key: 'pluspBilllineStatus'
    },
    {
      header: 'Bill Batch No',
      key: 'billbatchnum'
    },
    {
      header: 'Status',
      key: 'pluspBillbatchStatus'
    },
    {
      header: 'Status Date',
      key: 'statusdate'
    }
  ]

  if (showNoDataFoundMsg && isEmpty(tabledata)) {
    return <p>This work order does not currently have any cost billing information.</p>
  }

  return (
    <>
      <div className="bx--form">
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
                  {rows.map(row => {
                    return (
                      <PelTableRow
                        {...getRowProps({ row })}
                        row={row}
                        render={({ rowData }) => (
                          <>
                            <TableCell>{rowData.wonum}</TableCell>
                            <TableCell>{rowData.agreedprice}</TableCell>
                            <TableCell>{rowData.pluspBilllineStatus}</TableCell>
                            <TableCell>{rowData.billbatchnum}</TableCell>
                            <TableCell>{rowData.pluspBillbatchStatus}</TableCell>
                            <DateCell value={rowData.statusdate} />
                          </>
                        )}
                      />
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        />
      </div>
    </>
  )
}

CostBillingTable.propTypes = {
  showNoDataFoundMsg: PropTypes.bool,
  relatedWorkOrders: PropTypes.arrayOf(
    PropTypes.shape({
      wonum: PropTypes.string.isRequired
    })
  ).isRequired
}
