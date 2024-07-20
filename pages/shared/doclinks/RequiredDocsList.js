import React, { useState, useRef } from 'react'
import {
  DataTable,
  Button,
  Modal,
  Form,
  Select,
  SelectItem,
  TextArea
} from 'carbon-components-react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Document16, Edit16 } from '@carbon/icons-react'
import { PelTableRow } from '../CarbonHelpers/DataTable'
import { DocModal } from './DocModal'
import './RequiredDocsList.scss'
import useDocumentMissingReason from '../hooks/useDocumentMissingReasons'
import TriStateCheckbox from '../components/TriStateCheckbox/TriStateCheckbox'
import { api } from '../../modules/app/api'
import getRelativePath from '../../util/getRelativePath'
import { useSession } from '../../modules/auth/SessionProvider'
import { useToast } from '../toasts/ToastProvider'
import { useRegistry } from '../RegistryProvider'
import CheckDocumentDeleteCapability from './CheckDocumentDeleteCapability'
import CheckDocumentDeleteCapabilityOnPrestart from './CheckDocumentDeleteCapabilityOnPrestart'
import CheckDocumentNonProvidedReason from './CheckDocumentNonProvidedReason'
import { DeleteConfirmationModal } from '../components/Modal/DeleteConfirmationModal'
import { Loading } from '../../modules/shared-components/Loading'

export const RequiredDocsList = ({
  pelreqdocs,
  href,
  hideCreateButton,
  isSubCon,
  refresh,
  siteId,
  assignmentStatus = '',
  doclinks,
  pluscdoclinks,
  refreshAssignment,
  handleCreateDoclink = () => {}
}) => {
  const [registry] = useRegistry()

  const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader
  } = DataTable

  const { register, getValues, watch, reset, setValue } = useForm()

  const isValid = watch('notprovidedreason') !== 'default' && watch('notprovideddesc')

  const [showCannotProvideReasonModal, setShowCannotProvideReasonModal] = useState(false)
  const [showCannotProvideDescriptionModal, setShowCannotProvideDescriptionModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [updateDocument, setUpdateDocument] = useState({
    isUpdate: false,
    data: {}
  })
  const [showLoader, setShowLoader] = useState(false)

  const activeRecord = useRef()
  const [session] = useSession()

  const { addSuccessToast, addPersistentErrorToast } = useToast()

  const useCache = !refresh

  const { documentMissingReasons } = useDocumentMissingReason(refresh, useCache)

  const docs = pelreqdocs

  const handleModalSubmit = () => {
    const payload = {
      ...getValues(),
      notprovided: true
    }
    const { href } = activeRecord.current

    setShowCannotProvideReasonModal(false)

    reset()
    setShowLoader(true)

    api
      .post(getRelativePath(href), payload, {
        headers: {
          'x-method-override': 'PATCH',
          patchtype: 'MERGE'
        }
      })
      .then(() => {
        const index = docs.findIndex(
          item => item.pelreqdocswoid === activeRecord.current.pelreqdocswoid
        )
        docs[index].notprovidedreason = payload.notprovidedreason
        docs[index].notprovideddesc = payload.notprovideddesc
        docs[index].notprovided = payload.notprovided

        addSuccessToast({
          subtitle: 'Changes saved successfully'
        })
      })
      .catch(error => {
        addPersistentErrorToast({
          subtitle: error.message
        })
      })
      .finally(() => {
        setShowLoader(false)
      })
  }
  
  let documentList = docs.map(item => ({
    
    id: item._rowstamp,
    title:
      doclinks?.find(doclink => +doclink?.describedBy?.identifier === +item.doclinksid)?.describedBy
        ?.title ?? '',
    ...item
  }))

  const selectRecordById = id => docs.filter(({ _rowstamp }) => _rowstamp === id)[0]

  const handleCannotProvideClick = id => {
    activeRecord.current = selectRecordById(id)
    setShowCannotProvideReasonModal(true)
  }

  const openNonCompletionNotesModal = id => {
    activeRecord.current = selectRecordById(id)
    setShowCannotProvideDescriptionModal(true)
  }

  const handleDocModalClose = () => {
    setShowCreateModal(false)
    setUpdateDocument({
      isUpdate: false,
      data: {}
    })
  }

  const getDocumentNotProvideReason = ({ notprovidedreason, notprovideddesc }) => {
    return notprovidedreason && notprovideddesc
      ? `${notprovidedreason} - ${notprovideddesc}`
      : 'Document not provided'
  }

  const getRowDataById = id => documentList?.find(row => row.id === id) ?? {}

  const deleteRecord = async id => {
    const doc = getRowDataById(id)
    const woDocLinkHref = doclinks?.find(
      doclink => +doclink?.describedBy?.identifier === +doc.doclinksid
    )?.href

    try {
      const res = await api.post(
        getRelativePath(woDocLinkHref),
        {},
        {
          headers: {
            'x-method-override': 'DELETE'
          }
        }
      )

      if (res.status === 204) {
        try {
          const res = await api.post(
            getRelativePath(doc.href),
            {
              doclinksid: '',
              // Reset notprovided flag
              notprovided: false,
              notprovideddesc: '',
              notprovidedreason: '',
              siteid: doc.siteid
            },
            {
              headers: {
                'x-method-override': 'PATCH',
                patchtype: 'MERGE'
              }
            }
          )

          if (res.status === 204) {
            addSuccessToast({
              subtitle: `Document deleted successfully`
            })

            documentList = documentList?.filter(row => row?.id !== id)

            refreshAssignment(Math.random())
          }
        } catch (err) {
          throw new Error(err)
        }
      }
    } catch (err) {
      addPersistentErrorToast({
        subtitle: `Failed to delete the document`,
        caption: err.message
      })
    }
  }

  const editButtonProps = {
    size: 'sm',
    kind: 'tertiary',
    iconDescription: 'Edit'
  }

  const handleEditButtonClick = (data, notProvidedReason) => {
    if (!notProvidedReason) {
      setShowCreateModal(true)
      setUpdateDocument({
        isUpdate: true,
        data
      })
    } else if (notProvidedReason) {
      handleCannotProvideClick(data?.id)
      setValue('notprovidedreason', data?.notprovidedreason)
      setValue('notprovideddesc', data?.notprovideddesc)
    }
  }

  const checkUserVendor = doclink => {
    if (
      doclink &&
      doclink?.pelcreateby?.[0]?.pluspcustvendor === session?.pluspcustvendor &&
      session?.pluspcustvndtype === 'VENDOR'
    ) {
      return true
    }
    return false
  }

  const editAndDeleteButtonVisibility = ({ duebystatus = '', doclinksid = '' }) => {
    return (
      doclinksid &&
      checkUserVendor(pluscdoclinks.find(pdl => pdl?.doclinksid === doclinksid)) &&
      (duebystatus === 'PRESTART'
        ? !CheckDocumentDeleteCapabilityOnPrestart(assignmentStatus)
        : CheckDocumentDeleteCapability(assignmentStatus))
    )
  }

  return (
    <>
      {showLoader && <Loading modal />}
      {!documentList.length && (
        <div className="pel--doc-container">
          <p>No Required Documents Found</p>
        </div>
      )}
      {documentList.length > 0 && (
        <div className="pel--container pel--required-docs-table pel--worklogs pel-flex-column required-docs-list pel--doc-container">
          <DataTable
            headers={[
              {
                header: 'Document',
                key: 'doctype'
              },
              {
                header: 'Applies To',
                key: 'objectname'
              },
              {
                header: 'Asset Number',
                key: 'assignmentid'
              },
              {
                header: 'Certcode',
                key: 'certcode'
              },
              {
                header: 'Description',
                key: 'description'
              },
              {
                header: 'Due By Status',
                key: 'duebystatus'
              },
              {
                header: 'Not Provided Reason',
                key: 'notprovidedreason'
              },
              {
                header: 'Not Provided Note',
                key: 'notprovideddesc'
              },
              {
                header: 'Action',
                key: 'id'
              }
            ]}
            locale="en"
            rows={documentList ?? []}
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
                    {rows.map((row, i) => (
                      <PelTableRow
                        {...getRowProps({ row })}
                        row={row}
                        render={({
                          rowData: {
                            doctype,
                            objectname,
                            assignmentid,
                            certcode,
                            description,
                            duebystatus,
                            notprovidedreason,
                            notprovideddesc,
                            id
                          }
                        }) => {
                          const editAndDeleteButtonVisible = editAndDeleteButtonVisibility(
                            documentList?.[i] ?? {}
                          )

                                                    const editButtonVisibile =
                            notprovidedreason && CheckDocumentNonProvidedReason(assignmentStatus)

                          return (
                            <>
                              <TableCell>
                                <TriStateCheckbox
                                  label={doctype}
                                  checked={!!documentList?.[i]?.doclinksid}
                                  indeterminate={documentList?.[i]?.notprovided}
                                  checkedTitle="Document provided"
                                  indeterminateTitle={getDocumentNotProvideReason(
                                    documentList?.[i] ?? {}
                                  )}
                                  defaultTitle="Document required"
                                />
                              </TableCell>
                              <TableCell>{objectname}</TableCell>
                              <TableCell>
                                {objectname === 'MULTIASSET' &&
                                  (documentList?.[i]?.multiid ||
                                    documentList?.[i]?.multiassetlocci?.assetnum)}
                              </TableCell>
                              <TableCell>{certcode}</TableCell>
                              <TableCell>{description}</TableCell>
                              <TableCell>{duebystatus}</TableCell>
                              <TableCell>{notprovidedreason}</TableCell>
                              <TableCell>
                                {notprovideddesc && (
                                  <Button
                                    hasIconOnly
                                    onClick={() => openNonCompletionNotesModal(id)}
                                    renderIcon={Document16}
                                    size="sm"
                                    kind="tertiary"
                                    iconDescription="Notes"
                                    className="no-border"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {!documentList?.[i]?.doclinksid && !documentList?.[i]?.notprovided && (
                                  <Button
                                    kind="secondary"
                                    size="small"
                                    onClick={() => handleCannotProvideClick(id)}
                                  >
                                    Cannot provide
                                  </Button>
                                )}
                                {(editAndDeleteButtonVisible || editButtonVisibile) && (
                                  <div className="req-document-action__buttons">
                                    <Button
                                      hasIconOnly
                                      onClick={() =>
                                        handleEditButtonClick(documentList?.[i], notprovidedreason)
                                      }
                                      className="no-border"
                                      renderIcon={Edit16}
                                      {...editButtonProps}
                                    />
                                    {!editButtonVisibile && (
                                      <DeleteConfirmationModal
                                        data={row}
                                        modalHeading="Are you sure you want to delete this document?"
                                        handleOnDelete={({ id = '' }) => deleteRecord(id)}
                                      />
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            </>
                          )
                        }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          />
        </div>
      )}

      {!hideCreateButton && (
        <div className="bx--row pel--footer-bar pel--doc-bg">
          <Button onClick={() => setShowCreateModal(true)}>Create</Button>
        </div>
      )}

      <DocModal
        open={showCreateModal}
        docTypes={isSubCon ? registry.wodocTypes : registry.srdocTypes}
        requiredDocs={documentList}
        href={href}
        handleCreateDoclink={handleCreateDoclink}
        onRequestClose={handleDocModalClose}
        siteId={siteId}
        isSubCon={isSubCon}
        updateDocument={updateDocument}
      />
      <Modal
        open={showCannotProvideReasonModal}
        modalHeading="Select a reason why the document cannot be provided"
        primaryButtonText="OK"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          reset()
          setShowCannotProvideReasonModal(false)
        }}
        onRequestSubmit={handleModalSubmit}
        primaryButtonDisabled={!isValid}
      >
        <Form>
          <Select
            id="notprovidedreason"
            name="notprovidedreason"
            ref={register}
            defaultValue="default"
          >
            <SelectItem value="default" text="Please select" hidden disabled />
            {documentMissingReasons &&
              documentMissingReasons.map(({ description, value }) => (
                <SelectItem key={btoa(description)} value={value} text={description} />
              ))}
          </Select>
          <TextArea labelText="Description" name="notprovideddesc" ref={register} maxLength="256" />
        </Form>
      </Modal>
      <Modal
        passiveModal
        open={showCannotProvideDescriptionModal}
        modalHeading="Non-Completion Description"
        onRequestClose={() => setShowCannotProvideDescriptionModal(false)}
      >
        <p>{activeRecord.current?.notprovideddesc}</p>
      </Modal>
    </>
  )
}

RequiredDocsList.propTypes = {
  refresh: PropTypes.oneOfType([undefined, PropTypes.string, PropTypes.number]),
  pelreqdocs: PropTypes.arrayOf(PropTypes.object),
  doclinks: PropTypes.arrayOf(PropTypes.object),
  pluscdoclinks: PropTypes.arrayOf(PropTypes.object),
  href: PropTypes.string.isRequired,
  assignmentStatus: PropTypes.string,
  isSubCon: PropTypes.bool,
  siteId: PropTypes.string,
  handleCreateDoclink: PropTypes.func,
  refreshAssignment: PropTypes.func.isRequired,
  hideCreateButton: PropTypes.bool.isRequired
}
