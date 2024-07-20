import React from 'react'
import Information16 from '@carbon/icons-react/lib/information/16'
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
import moment from 'moment'

import { PelTextInput } from '../../../../shared/forms'
import { PelTableRow, DateCell } from '../../../../shared/CarbonHelpers/DataTable'
import { PelModalWrapper } from '../../../contact-center/components/PelModalWrapper'
import { multiassetlocci } from './props'
import './scss/assetDetailModal.scss'

export const AssetDetailModal = ({ multiassetlocci }) => {
  const asset = multiassetlocci?.assetdetails ?? []
  const assetSpecData =
    asset?.assetspec?.map(
      ({
        assetattrid,
        numvalue,
        alnvalue,
        tablevalue,
        measureunitid,
        assetattribute: [{ description = '' }] = [{ description: '' }]
      }) => ({
        id: assetattrid,
        assetattrid,
        description,
        measureunitid,
        value: alnvalue || numvalue || tablevalue
      })
    ) || []

  const assetMeterData =
    asset?.assetmeter?.map(
      ({
        assetmeterid,
        metername,
        meter: [{ description = '', metertype_description = '' }] = [
          { description: '', metertype_description: '' }
        ],
        measureunitid,
        lastreading,
        lastreadingdate,
        remarks
      }) => ({
        id: assetmeterid.toString(),
        metername,
        metertype_description,
        description,
        measureunitid,
        lastreading,
        lastreadingdate,
        remarks
      })
    ) || []

  const modalProps = {
    modalHeading: 'Asset Details',
    className: 'pel-modal',
    shouldCloseAfterSubmit: true,
    passiveModal: true,
    renderTriggerButtonIcon: () => <Information16 />,
    triggerButtonKind: 'tertiary',
    buttonTriggerClassName: 'flex pel--history-button bx--btn--sm bx--btn--icon-only no-border'
  }

  const assetMeterTableHeaders = [
    {
      header: 'Meter',
      key: 'metername'
    },
    {
      header: 'Type',
      key: 'metertype_description'
    },
    {
      header: 'Description',
      key: 'description'
    },
    {
      header: 'Last Reading',
      key: 'lastreading'
    },
    {
      header: 'Measuring Unit',
      key: 'measureunitid'
    },
    {
      header: 'Last Reading Date',
      key: 'lastreadingdate'
    },
    {
      header: 'Remarks',
      key: 'remarks'
    }
  ]

  const assetSpecTableHeaders = [
    {
      header: 'Asset Attr ID',
      key: 'assetattrid'
    },
    {
      header: 'Description',
      key: 'description'
    },
    {
      header: 'Value',
      key: 'value'
    },
    {
      header: 'Measuring Unit',
      key: 'measureunitid'
    }
  ]

  return (
    <PelModalWrapper {...modalProps}>
      <div className="pel--container bx--grid pel--asset-details pel-flex-column no-padding">
        <div className="bx--row">
          <div className="bx--col-lg-3 bx--col-md-3">
            <PelTextInput readOnly labelText="Asset Number" value={asset?.assetnum} />
            <PelTextInput readOnly labelText="Description" value={asset?.description} />
            <PelTextInput
              readOnly
              labelText="Status"
              value={`${asset?.status}: ${asset?.status_description}`}
            />
          </div>
          <div className="bx--col-lg-3 bx--col-md-3">
            <PelTextInput readOnly labelText="Asset Model" value={asset?.mtfmassetmodel} />
            <PelTextInput readOnly labelText="Serial Number" value={asset?.serialnum} />
            <PelTextInput readOnly labelText="Asset Barcode" value={asset?.assettag} />
          </div>
          <div className="bx--col-lg-3 bx--col-md-3">
            <PelTextInput readOnly labelText="Asset Local Name" value={asset?.mtfmasstlocal} />
            <PelTextInput
              readOnly
              labelText="Expiry Date"
              value={moment(asset?.mtfmexpdate).format('DD-MMM-YYYY')}
            />
            <PelTextInput readOnly labelText="Inscope" value={asset?.inscope} />
          </div>
        </div>
        {assetMeterData?.length > 0 && (
          <div className="bx--row">
            <div className="bx--col-lg-12 bx--col-md-12">
              <h4 className="pel-asset-detail-label">Asset Meters</h4>
              <div>
                <DataTable
                  headers={assetMeterTableHeaders}
                  locale="en"
                  rows={assetMeterData ?? []}
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
                            {headers
                              .filter(header => header.key !== 'measureunitid')
                              .map(header => (
                                <TableHeader {...getHeaderProps({ header })}>
                                  {header.header}
                                </TableHeader>
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
                                  <TableCell>{rowData.metername}</TableCell>
                                  <TableCell>{rowData.metertype_description}</TableCell>
                                  <TableCell>{rowData.description}</TableCell>
                                  <TableCell>
                                    {`${rowData.lastreading} ${rowData.measureunitid}`}
                                  </TableCell>
                                  <DateCell value={rowData.lastreadingdate} />
                                  <TableCell>{rowData.remarks}</TableCell>
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
            </div>
          </div>
        )}
        {assetSpecData?.length > 0 && (
          <div className="bx--row">
            <div className="bx--col-lg-12 bx--col-md-12">
              <h4 className="pel-asset-detail-label">Asset Specification</h4>
              <div>
                <DataTable
                  headers={assetSpecTableHeaders}
                  locale="en"
                  rows={assetSpecData}
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
                            {headers
                              .filter(header => header.key !== 'measureunitid')
                              .map(header => (
                                <TableHeader {...getHeaderProps({ header })}>
                                  {header.header}
                                </TableHeader>
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
                                  <TableCell>{rowData.assetattrid}</TableCell>
                                  <TableCell>{rowData.description}</TableCell>
                                  <TableCell>
                                    {`${rowData.value} ${rowData.measureunitid}`}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </PelModalWrapper>
  )
}

AssetDetailModal.propTypes = {
  multiassetlocci
}
