import React from 'react'
import PropTypes from 'prop-types'
import { DataTable } from 'carbon-components-react'
import _ from 'lodash'
import Launch16 from '@carbon/icons-react/lib/launch/16'
import { PelTableRow, IconCell, LongDescriptionCell } from '../../../shared/CarbonHelpers/DataTable'

export const WorkOrderMaterials = ({ wo }) => {
  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader
  } = DataTable

  const [mx] = wo.localref.split('/oslc/')

  const wpmaterialserv = [].concat(wo?.wpservice ?? [], wo?.wpmaterial ?? [])

  if (!wpmaterialserv || wpmaterialserv?.length === 0) {
    return null
  }

  const openPO = ponum => e => {
    window.open(
      `${mx}/ui/login?login=url&event=loadapp&value=pelpo&uniqueid=${ponum}`,
      '_blank',
      'noopener noreferrer'
    )
  }

  const tabledata = wpmaterialserv?.map(item => {
    const [po] = item?.po ?? [{}]

    
    const wpserviceWithPO = _.merge({}, item, {
      poid: po?.poid,
      ponum: po?.ponum,
      
      status_description: po?.status_description
    })

    
    return {
      id: item.wpitemid.toString(),
      ...wpserviceWithPO
    }
  })

  const tableHeaders = [
    {
      header: 'Type',
      key: 'linetype_description'
    },
    {
      header: 'Item/Service',
      key: 'itemnum'
    },
    {
      header: 'Description',
      key: 'description'
    },
    {
      header: '',
      key: 'description_longdescription',
      type: 'longdescription'
    },
    {
      header: 'Quantity',
      key: 'itemqty'
    },
    {
      header: 'PO Status',
      key: 'status_description'
    },
    {
      header: 'PO',
      key: 'poid',
      type: 'icon',
      icon: Launch16,
      onClick: val => openPO(val)
    }
  ]

  return (
    <>
      <div className="bx--form pel--indent">
        <h4 className="pel--sub-header">Materials / Services</h4>
        <DataTable
          headers={tableHeaders}
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
                  {rows.map(row => (
                    <PelTableRow
                      {...getRowProps({ row })}
                      row={row}
                      render={({ rowData }) => (
                        <>
                          <TableCell>{rowData.linetype_description}</TableCell>
                          <TableCell>{rowData.itemnum}</TableCell>
                          <TableCell>{rowData.description}</TableCell>
                          <LongDescriptionCell value={rowData.description_longdescription} />
                          <TableCell>{rowData.itemqty}</TableCell>
                          <TableCell>{rowData.status_description}</TableCell>
                          <IconCell
                            value={rowData.poid}
                            displayValue={
                              tabledata?.find(value => rowData.poid === value.poid)?.ponum
                            }
                            icon={Launch16}
                            handleClick={val => openPO(val)}
                          />
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

WorkOrderMaterials.propTypes = {
  wo: PropTypes.shape({
    wpservice: PropTypes.arrayOf(
      PropTypes.shape({
        wpitemid: PropTypes.number
      })
    ),
    wpmaterial: PropTypes.arrayOf(
      PropTypes.shape({
        wpitemid: PropTypes.number
      })
    ),
    localref: PropTypes.string
  })
}
