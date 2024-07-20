import React, { useState, useEffect } from 'react'
import { DataTable, Checkbox } from 'carbon-components-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Filter16 from '@carbon/icons-react/lib/filter/16'
import FilterEdit16 from '@carbon/icons-react/lib/filter--edit/16'
import DOMPurify from 'dompurify'
import { api } from '../../../modules/app/api'
import { CreateWorkLog } from './CreateWorkLog'
import { NoResults } from '../../../modules/contact-center/components/NoResults'
import { useObject } from '../../hooks/useObject'
import getRelativePath from '../../../util/getRelativePath'
import { useToast } from '../../toasts/ToastProvider'
import { useSession } from '../../../modules/auth/SessionProvider'
import {
  PelTableRow,
  DateCell,
  LongDescriptionCell,
  TooltipCell
} from '../../CarbonHelpers/DataTable'
import './scss/table.scss'
import { DeleteConfirmationModal } from '../../components/Modal/DeleteConfirmationModal'
import { Loading } from '../../../modules/shared-components/Loading'

export const WorkLogs = ({
  data,
  logTypes,
  hideCreateButton,
  hideDeleteButton,
  forceClientViewable,
  isSubCon
}) => {
  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableToolbar,
    TableToolbarContent,
    TableToolbarMenu,
    TableToolbarAction
  } = DataTable
  const [isLoading, setIsLoading] = useState(false)
  const convertLogs = sr => {
    const dupSr = sr.worklog?.filter(wl => wl?.worklogid)
    return {
      worklog: dupSr ? dupSr.map(wl => ({ id: wl.worklogid?.toString(), ...wl })) : [], 
      sr
    }
  }

  const removeBadData = sr => {
    return {
      ...sr,
      worklog: sr?.worklog ? sr.worklog.filter(wl => wl?.worklogid) : []
    }
  }

  const [state, setState] = useState()
  const [session] = useSession()
  const { addSuccessToast, addPersistentErrorToast } = useToast()
  const [updatedData, setUpdatedData] = useState(removeBadData(_.get(data, 'member[0]', [])))
  const [filter, setFilter] = useState()

  const filterLogTypes = () => {
    const availableLogtypes = []
    return logTypes.filter(logtype => availableLogtypes.includes(logtype.value))
  }

  const [filteredLogtype, setFilteredLogtype] = useState(filterLogTypes())

  useEffect(() => {
    if (filter) {
      const filteredList = updatedData.worklog.filter(wl => wl?.logtype === filter)
      setState(convertLogs({ worklog: filteredList, href: updatedData.href }))
    } else {
      setState(convertLogs(updatedData))
    }
  }, [filter])

  useEffect(() => {
    if (data) {
      setState(convertLogs(_.get(data, 'member[0]', [])))
      setUpdatedData(removeBadData(_.get(data, 'member[0]', [])))
    }
  }, [data])

  const handleUpdate = sr => {
    if (sr) {
      setUpdatedData(removeBadData(sr))
      setState(convertLogs(sr))
      setFilteredLogtype(filterLogTypes())
    }
  }

  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
    
    if ('target' in node) {
      node.setAttribute('target', '_blank')
      
      node.setAttribute('rel', 'noopener noreferrer')
    }
    
    if (
      !node.hasAttribute('target') &&
      (node.hasAttribute('xlink:href') || node.hasAttribute('href'))
    ) {
      node.setAttribute('xlink:show', 'new')
    }
  })

  const getRowDataById = id => state?.worklog?.find(row => row.id === id) ?? {}

  const deleteRecord = async id => {
    const recordToDelete = getRowDataById(id)
    setIsLoading(true)
    const deleteURL = getRelativePath(recordToDelete.localref).replace('pelos/', 'os/')
    try {
      const res = await api.delete(deleteURL)
      if (res.status === 204) {
        addSuccessToast({
          subtitle: `Log note deleted successfully`
        })

        setState(state => ({
          ...state,
          worklog: state?.worklog?.filter(row => row?.id !== id)
        }))
      }
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      addPersistentErrorToast({
        subtitle: `Failed to delete the log note`,
        caption: err.message
      })
    }
  }

  return (
    <>
      {isLoading && <Loading modal />}
      {updatedData?.worklog?.length > 0 && (
        <div className="pel--container pel-flex-column pel--bottom-space pel--worklogs-table-toolbar">
          <DataTable
            headers={[
              {
                header: 'Date Created',
                key: 'createdate',
                visible: true
              },
              {
                header: 'Source',
                key: 'recordkey',
                visible: true
              },
              {
                header: 'Type',
                key: 'logtype_description',
                visible: true
              },
              {
                header: 'Created By',
                key: 'person',
                visible: true
              },
              {
                header: 'Description',
                key: 'description',
                visible: true
              },
              {
                header: 'Long Description',
                key: 'description_longdescription',
                visible: true
              },
              {
                header: 'Client Viewable',
                key: 'clientviewable',
                visible: !forceClientViewable
              },
              {
                header: '',
                key: 'id',
                visible: true
              }
            ]}
            locale="en"
            rows={state?.worklog?.length > 0 ? state?.worklog : []}
            size={null}
            render={({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getToolbarProps,
              getTableContainerProps
            }) => (
              <TableContainer {...getTableContainerProps()}>
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <TableToolbarMenu
                      renderIcon={() => (filter ? <FilterEdit16 /> : <Filter16 />)}
                      iconDescription="Filter"
                    >
                      <TableToolbarAction onClick={() => setFilter('')}>
                        No filter
                      </TableToolbarAction>
                      {filteredLogtype?.map(logType => (
                        <TableToolbarAction
                          key={logType.value}
                          onClick={() => {
                            setFilter(logType.value)
                          }}
                        >
                          {logType.description}
                        </TableToolbarAction>
                      ))}
                    </TableToolbarMenu>
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()} className="pel--worklogs-table">
                  <TableHead>
                    <TableRow>
                      {headers.map(
                        header =>
                          header.visible && (
                            <TableHeader {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows?.map(row => (
                      <PelTableRow
                        {...getRowProps({ row })}
                        row={row}
                        render={({ rowData }) => (
                          <>
                            <DateCell value={rowData.createdate} />
                            <TableCell>{rowData.recordkey}</TableCell>
                            <TableCell>{rowData.logtype_description}</TableCell>
                            {rowData?.person ? (
                              <TooltipCell
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
                              />
                            ) : (
                              <TableCell>{getRowDataById(row?.id)?.createby || ''}</TableCell>
                            )}
                            <TableCell>{rowData.description}</TableCell>
                            <LongDescriptionCell value={rowData.description_longdescription} />
                            {!forceClientViewable && (
                              <TableCell>
                                <Checkbox
                                  id="clientViewable"
                                  labelText=""
                                  checked={rowData.clientviewable}
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              {!hideDeleteButton &&
                                session?.maxuser?.[0]?.userid ===
                                  getRowDataById(rowData?.id)?.createby && (
                                  <div className="lognote-action__buttons">
                                    <DeleteConfirmationModal
                                      data={row}
                                      modalHeading="Are you sure you want to delete this log note?"
                                      handleOnDelete={({ id = '' }) => deleteRecord(id)}
                                    />
                                  </div>
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
        </div>
      )}
      {!state?.worklog?.length && (
        <NoResults
          heading="No Logs Notes Found"
          description="This service request does not currently have any log notes."
        />
      )}

      {!!state?.sr && !hideCreateButton && (
        <div className="bx--row pel--footer-bar">
          <CreateWorkLog
            sr={state?.sr}
            onUpdate={handleUpdate}
            logTypes={logTypes}
            forceClientViewable={forceClientViewable}
            isSubCon={isSubCon}
          />
        </div>
      )}
    </>
  )
}

WorkLogs.propTypes = {
  data: PropTypes.shape({
    member: PropTypes.arrayOf(PropTypes.object)
  }),
  logTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  forceClientViewable: PropTypes.bool,
  hideCreateButton: PropTypes.bool,
  hideDeleteButton: PropTypes.bool,
  isSubCon: PropTypes.bool
}

export const WorkLogsLoadable = ({
  objectType,
  logTypes,
  hideCreateButton,
  hideDeleteButton,
  id,
  isSubCon,
  refresh
}) => {
  const field = objectType === 'pelsrlogs' ? 'ticketid' : 'wonum'
  const worklogQuery = `oslc.select=${field},worklog{worklogid,createdate,logtype,createby,clientviewable,recordkey,description,description_longdescription,logtype_description,person{displayname,primaryemail,primaryphone}}&oslc.where=${field}="${id}"`
  const { data } = useObject(api, objectType, worklogQuery, false, refresh, true)

  return (
    <WorkLogs
      data={data}
      logTypes={logTypes}
      isSubCon={isSubCon}
      hideDeleteButton={hideDeleteButton}
      hideCreateButton={hideCreateButton}
    />
  )
}

WorkLogsLoadable.propTypes = {
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  objectType: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  logTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  hideCreateButton: PropTypes.bool,
  hideDeleteButton: PropTypes.bool,
  isSubCon: PropTypes.bool
}
