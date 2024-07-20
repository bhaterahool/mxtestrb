import React, { useState, useEffect } from 'react'
import { DataTable } from 'carbon-components-react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import DOMPurify from 'dompurify'
import { api } from '../../../modules/app/api'
import { CreateMitigationEvent } from './CreateMitigationEvent'
import { useSession } from '../../../modules/auth/SessionProvider'
import { NoResults } from '../../../modules/contact-center/components/NoResults'
import { useObject } from '../../hooks/useObject'
import getRelativePath from '../../../util/getRelativePath'
import { useToast } from '../../toasts/ToastProvider'
import {
  PelTableRow,
  DateCell,
  LongDescriptionCell,
  TooltipCell
} from '../../CarbonHelpers/DataTable'
import './scss/table.scss'
import { DeleteConfirmationModal } from '../../components/Modal/DeleteConfirmationModal'
import { Loading } from '../../../modules/shared-components/Loading'

export const MitigationEvents = ({
  data,
  eventTypes,
  wonum,
  siteid,
  hideCreateButton,
  hideDeleteButton
}) => {
  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader
  } = DataTable
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState()
  const [session] = useSession()
  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const convertEvents = sr => ({
    mitigationEvent: sr ? sr?.map((me, index) => ({ id: index.toString(), ...me })) : [], 
    sr
  })

  useEffect(() => {
    if (data) {
      setState(convertEvents(data?.member ?? []))
    }
  }, [data])

  const handleUpdate = sr => {
    if (sr) {
      const mitigationEventList = data?.member ?? []
      mitigationEventList.push(sr)
      setState(convertEvents(mitigationEventList))
    }
  }

  const getMitigationValue = value => {
    return eventTypes?.find(mitigation => mitigation.value === value)?.description
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

  const getRowDataById = id => state?.mitigationEvent?.find(row => row.id === id) ?? {}

  const deleteRecord = async id => {
    const recordToDelete = getRowDataById(id)
    setIsLoading(true)
    const deleteURL = getRelativePath(recordToDelete.href).replace('pelos/', 'os/')
    try {
      const res = await api.delete(deleteURL)
      if (res.status === 204) {
        addSuccessToast({
          subtitle: `Mitigation event deleted successfully`
        })

        setState(state => ({
          ...state,
          mitigationEvent: state?.mitigationEvent?.filter(row => row?.id !== id)
        }))
      }
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      addPersistentErrorToast({
        subtitle: `Failed to delete the mitigation event`,
        caption: err.message
      })
    }
  }

  return (
    <>
      {isLoading && <Loading modal />}
      {state?.mitigationEvent?.length > 0 && (
        <div className="pel--container pel-flex-column">
          <DataTable
            headers={[
              {
                header: 'Event Date',
                key: 'evtdate'
              },
              {
                header: 'Type',
                key: 'mitevt'
              },
              {
                header: 'Created By',
                key: 'person'
              },
              {
                header: 'Notes',
                key: 'notes'
              },
              {
                header: 'Description',
                key: 'notes_longdescription'
              },
              {
                header: '',
                key: 'id'
              }
            ]}
            locale="en"
            rows={state.mitigationEvent}
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
                <Table {...getTableProps()} className="pel--mitigation-events-table">
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
                            <DateCell value={rowData.evtdate} />
                            <TableCell>{getMitigationValue(rowData.mitevt)}</TableCell>
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
                            <TableCell>{rowData.notes}</TableCell>
                            <LongDescriptionCell value={rowData.notes_longdescription} />
                            <TableCell>
                              {!hideDeleteButton &&
                                session?.maxuser?.[0]?.userid ===
                                  getRowDataById(rowData?.id)?.createby && (
                                  <div className="mitigation-event-action__buttons">
                                    <DeleteConfirmationModal
                                      data={row}
                                      modalHeading="Are you sure you want to delete this mitigation event?"
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
      {!state?.mitigationEvent?.length && (
        <NoResults
          heading="No Events Found"
          description="This service request does not currently have any mitigation events."
        />
      )}
      {!hideCreateButton && (
        <div className="bx--row pel--footer-bar">
          <CreateMitigationEvent
            onUpdate={handleUpdate}
            eventTypes={eventTypes}
            wonum={wonum}
            siteid={siteid}
          />
        </div>
      )}
    </>
  )
}

MitigationEvents.propTypes = {
  data: PropTypes.shape({
    member: PropTypes.arrayOf(PropTypes.object)
  }),
  eventTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  wonum: PropTypes.string.isRequired,
  siteid: PropTypes.string.isRequired,
  hideCreateButton: PropTypes.bool.isRequired,
  hideDeleteButton: PropTypes.bool.isRequired
}

export const MitigationEventsLoadable = ({
  wonum,
  eventTypes,
  siteid,
  hideCreateButton,
  hideDeleteButton,
  refresh
}) => {
  const { loading, data, error } = useObject(
    api,
    'PELMTFM_WOMITEVS',
    `oslc.select=wonum,siteid,evtdate,mitevt,notes,notes_longdescription,createby,person{displayname,primaryemail,primaryphone}&oslc.where=wonum="${wonum}"&siteid="${siteid}"`,
    false, 
    refresh,
    true 
  )

  return (
    <MitigationEvents
      data={data}
      wonum={wonum}
      siteid={siteid}
      eventTypes={eventTypes}
      hideCreateButton={hideCreateButton}
      hideDeleteButton={hideDeleteButton}
    />
  )
}

MitigationEventsLoadable.propTypes = {
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  wonum: PropTypes.string.isRequired,
  siteid: PropTypes.string.isRequired,
  eventTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      description: PropTypes.string
    })
  ).isRequired,
  hideCreateButton: PropTypes.bool.isRequired,
  hideDeleteButton: PropTypes.bool.isRequired
}
