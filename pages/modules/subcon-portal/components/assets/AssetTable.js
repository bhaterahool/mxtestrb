import React from 'react'
import PropTypes from 'prop-types'
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectRow
} from 'carbon-components-react'
import './scss/table.scss'

import { AssetDetailModal } from './AssetDetailModal'

export const AssetTable = ({ rows, handleAssetSelect, selectedMultiID, nonCompletionReasons }) => {
  const multiassetlocci = rows ?? []

  return (
    <>
      <DataTable
        headers={[
          { header: 'Sequence', key: 'sequence' },
          { header: 'Asset Number', key: 'assetnum' },
          { header: 'Asset Description', key: 'description' },
          { header: 'Asset Barcode', key: 'assettag' },
          { header: 'Location', key: 'location' },
          { header: 'Work Outcome', key: 'pelworkoutcome' },
          { header: 'Work Complete Status', key: 'pelworkcomp' }
        ]}
        rows={rows}
        radio
      >
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getSelectionProps }) => (
          <Table {...getTableProps()} className="pel--asset-table">
            <TableHead>
              <TableRow>
                <th scope="col" aria-labelledby="rowselector" />
                {headers.map(header => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows ||
                (!rows.length && (
                  <TableRow>
                    <TableCell colSpan="8">No data</TableCell>
                  </TableRow>
                ))}
              {rows.map((row, i) => (
                <TableRow onClick={() => handleAssetSelect(row)} {...getRowProps({ row })}>
                  <TableSelectRow
                    {...getSelectionProps({ row })}
                    checked={row.id === selectedMultiID}
                  />
                  {row.cells.slice(0, 6).map(cell => (
                    <TableCell key={cell.id}>
                      <div className="flex align-center">
                        {cell.value}
                        {cell.info.header === 'description' && cell.value && (
                          <AssetDetailModal multiassetlocci={multiassetlocci[i]} />
                        )}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="pel--table-checkbox-label">
                      {row.cells[5]?.value && <p>Work Complete</p>}
                      {!row.cells[5]?.value &&
                        nonCompletionReasons?.find(
                          ({ value }) => multiassetlocci?.[i]?.pelnoncompreason === value
                        )?.description}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </>
  )
}

AssetTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      sequence: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      asset: PropTypes.string,
      location: PropTypes.string,
      pelworkoutcome: PropTypes.string,
      pelworkcomp: PropTypes.bool,
      assetdetails: PropTypes.arrayOf
    })
  ),
  handleAssetSelect: PropTypes.func.isRequired,
  selectedMultiID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nonCompletionReasons: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      value: PropTypes.string
    })
  )
}
