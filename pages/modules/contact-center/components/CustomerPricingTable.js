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

export const CustomerPricingTable = ({
  relatedWorkOrders,
  onBillingApprovalResponse,
  showNoDataFoundMsg = false
}) => {
  const tabledata = relatedWorkOrders.reduce((result, item) => {
    if (item?.pluspcustpricest?.length > 0) {
      const pluspcustpricest = item.pluspcustpricest[item.pluspcustpricest.length - 1]
      const workorderWithLatestEstimate = _.merge({}, item, {
        plusppricesched: item?.plusppricesched,
        peladjestprice: item?.peladjestprice,
        pluspeststat: pluspcustpricest?.pluspeststat,
        pluspeststatdt: pluspcustpricest?.pluspeststatdt,
        pelcustomercomment: pluspcustpricest?.description,
        worklogid: pluspcustpricest?.worklogid
      })

      result.push({
        id: item.wonum,
        ...workorderWithLatestEstimate
      })
    }

    return result
  }, [])

  if (showNoDataFoundMsg && isEmpty(tabledata)) {
    return <p>This work order does not currently have any customer price information.</p>
  }

  const onBillingStatusChange = value => {
    onBillingApprovalResponse(value)
  }

  const columns = [
    {
      header: 'WONUM',
      key: 'wonum'
    },
    {
      header: 'Pricing Schedule',
      key: 'plusppricesched'
    },
    {
      header: 'Adj Estimate Price',
      key: 'peladjestprice'
    },
    {
      header: 'Estimate Status',
      key: 'pluspeststat'
    },
    {
      header: 'Estimate Status Date',
      key: 'pluspeststatdt'
    },
    {
      header: 'Description',
      key: 'pelcustomercomment'
    }
  ]

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
                            <TableCell>{rowData.plusppricesched?.inctotal}</TableCell>
                            <TableCell>{rowData.peladjestprice}</TableCell>
                            <TableCell>{rowData.pluspeststat}</TableCell>
                            <DateCell value={rowData.pluspeststatdt} />
                            <TableCell>{rowData.pelcustomercomment}</TableCell>
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

CustomerPricingTable.propTypes = {
  workOrder: PropTypes.shape({}),
  showNoDataFoundMsg: PropTypes.bool,
  relatedWorkOrders: PropTypes.arrayOf(
    PropTypes.shape({
      wonum: PropTypes.string.isRequired
    })
  ).isRequired,
  onBillingApprovalResponse: PropTypes.func.isRequired
}
