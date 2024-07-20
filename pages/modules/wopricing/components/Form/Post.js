import React, { useState } from 'react'
import { chunk } from 'lodash'
import { Modal, Button } from 'carbon-components-react'
import { useGridCtx } from '../../context/grid-context'
import { useFileCtx } from '../../context/file-context'
import {
  postRowSuccess,
  postRowError,
  updatePostRows,
  postBulkRowSuccess,
  postBulkRowError
} from '../../context/grid-reducer'
import { bulkPost, postWopricing } from '../../services/wopricingService'
import { updateFile } from '../../context/file-reducer'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import {
  COMMIT_SUCCESS,
  WORK_ORDER_STATUS_BILLABLE,
  WORK_ORDER_STATUS_MANBILL,
  WORK_ORDER_STATUS_NONBILL
} from '../../../../shared/grid/constants'
import { Loading, LoadingIcon } from '../../../shared-components/Loading'
import { isEmpty } from '../../../../util'

const getPostError = (wonum, errorMessage, status = null, data = null) => {
  return errorMessage
}

const postAndDispatch = ({ manualBillFeeType, customerId, row, dispatchGrid }) => {
  const { wonum, linecost, href, linedescription, status } = row
  const skipStatus = ![WORK_ORDER_STATUS_BILLABLE, WORK_ORDER_STATUS_NONBILL].includes(status)

  return postWopricing({
    manualBillFeeType,
    href,
    linedescription,
    linecost,
    status,
    skipStatus
  })
    .then(({ status, data }) => {
      if (status >= 200 && status <= 300) {
        dispatchGrid(
          postRowSuccess({
            customerId,
            href
          })
        )
      } else {
        dispatchGrid(
          postRowError({
            customerId,
            href,
            error: getPostError(wonum, `Post Error: status=${status}`, status, data)
          })
        )
      }
    })
    .catch(err => {
      dispatchGrid(
        postRowError({
          customerId,
          href,
          error: getPostError(wonum, err.toString())
        })
      )
    })
}

const getCustomerRowsChanged = customers =>
  Object.keys(customers).reduce((accum, customerId) => {
    const { tableData } = customers[customerId]
    tableData.forEach(row => {
      const {
        committed,
        status,
        locked,
        linecost = 0,
        linedescription = '',
        default: initialData
      } = row
      if (status && committed !== COMMIT_SUCCESS && !locked) {
        if (
          (linecost && String(linecost).trim() && !Number.isNaN(Math.sign(linecost))) ||
          (linedescription && String(linedescription).trim().length) ||
          initialData?.status !== status
        ) {
          accum.push({ customerId, row })
        }
      }
    })
    return accum
  }, [])

export const Post = () => {
  const { addErrorToast, addPersistentErrorToast } = useToast()
  const [isPosting, setPosting] = useState(false)
  const { fileState, dispatchFile } = useFileCtx()
  const { gridState, dispatchGrid, getGridState } = useGridCtx()

  const { files } = fileState
  const { manualBillFeeType, customers } = gridState
  const [showDialog, setShowDialog] = useState({
    open: false,
    totalRecordsToBeCommitted: 0,
    totalRecordsToBeCommittedProcessed: 0
  })

  const validateChangedRows = data => {
    const errorLog = []
    const filteredData = data.filter(item => {
      if (
        item.row.status === WORK_ORDER_STATUS_MANBILL &&
        item.row.linecost &&
        !Number.isNaN(Math.sign(item.row.linecost))
      ) {
        errorLog.push(
          `Work Order: ${item.row.wonum} Please change the work order status, Because you have added a line price.`
        )
        return false
      }

      if (item.row.status === WORK_ORDER_STATUS_BILLABLE) {
        if (!item.row.linecost) {
          errorLog.push(`Work Order: ${item.row.wonum} line price is empty`)
          return false
        }

        if (item.row.linecost && Number.isNaN(Math.sign(item.row.linecost))) {
          errorLog.push(`Work Order: ${item.row.wonum} line price is invalid: ${item.row.linecost}`)
          return false
        }
      }

      return true
    })
    return {
      errorLog,
      filteredData
    }
  }

  const rowsByCustomerId = data => {
    return (
      data?.reduce((acc, curr) => {
        if (!acc[curr.customerId]) {
          // eslint-disable-next-line no-param-reassign
          acc[curr.customerId] = []
        }

        acc[curr.customerId].push(curr)

        return acc
      }, {}) ?? []
    )
  }

  const handleBulkPostResponse = (response, postedData) => {
    const { data = [], errors = [] } = response?.data?.reduce(
      (acc, { _responsedata: resData }, currIndex) => {
        if (resData?.wonum) {
          acc.data.push({
            ...resData,
            customerId: resData?.pluspgbtrans?.[0]?.customer
          })
        } else {
          acc.errors.push({
            ...postedData[currIndex].row,
            customerId: postedData[currIndex].customerId,
            errorMessage: resData?.Error?.message ?? 'Something Went wrong'
          })
        }

        return acc
      },
      { data: [], errors: [] }
    ) ?? { data: [], errors: [] }

    if (!isEmpty(errors)) {
      addPersistentErrorToast({
        title: 'Error found !',
        subtitle: `\n${errors?.map(({ errorMessage }) => errorMessage).join('\n\n')}`,
        className: 'afpbulk-error'
      })

      const errorsByCustomerId = rowsByCustomerId(errors)

      Object.keys(errorsByCustomerId).forEach(customerId => {
        if (customerId) {
          dispatchGrid(
            postBulkRowError({
              customerId,
              data: errorsByCustomerId[customerId]
            })
          )
        }
      })
    }

    if (!isEmpty(data)) {
      const customerData = rowsByCustomerId(data)

      Object.keys(customerData).forEach(customerId => {
        if (customerId) {
          dispatchGrid(
            postBulkRowSuccess({
              customerId,
              data: customerData[customerId]
            })
          )
        }
      })
    }
  }

  const buildBulkPostData = data => {
    return data.map(({ row: { linecost, href, linedescription, status } }) => {
      const skipStatus = ![WORK_ORDER_STATUS_BILLABLE, WORK_ORDER_STATUS_NONBILL].includes(status)
      return {
        _data: {
          ...(!skipStatus && { status }),
          pluspgbtrans: [
            {
              type: manualBillFeeType,
              description: linedescription,
              lineprice: Number(linecost)
            }
          ]
        },
        _meta: {
          uri: href,
          method: 'PATCH',
          patchtype: 'MERGE'
        }
      }
    })
  }

  const handlePost = async () => {
    setTimeout(async () => {
      const customerRowsChanged = getCustomerRowsChanged(customers)

      const { errorLog, filteredData } = validateChangedRows(customerRowsChanged)

      if (errorLog.length) {
        addPersistentErrorToast({
          title: 'Error found !',
          subtitle: `\n${errorLog.join('\n\n')}`,
          className: 'afpbulk-error'
        })
      }

      if (filteredData.length) {
        const filteredDataChunks = chunk(chunk(filteredData, 100), 2)

        setShowDialog(prev => ({
          ...prev,
          open: true,
          totalRecordsToBeCommitted: filteredData.length
        }))

        for (let i = 0; i < filteredDataChunks.length; i += 1) {
          let postDataCount = 0
          const promises = []

          for (let j = 0; j < filteredDataChunks[i].length; j += 1) {
            const bulkPostData = filteredDataChunks[i][j]

            postDataCount += bulkPostData.length

            const promise = bulkPost(buildBulkPostData(bulkPostData))
              .then(res => {
                handleBulkPostResponse(res, bulkPostData)
              })
              .catch(() => {})
            promises.push(promise)
          }

          setShowDialog(({ totalRecordsToBeCommittedProcessed, ...prev }) => ({
            ...prev,
            totalRecordsToBeCommittedProcessed: totalRecordsToBeCommittedProcessed + postDataCount
          }))

          
          await Promise.allSettled(promises)
        }

        const updateGrid = () => {
          const { selectedFileId } = fileState
          const customers = getGridState()?.customers

          if (selectedFileId && files[selectedFileId]) {
            dispatchFile(
              updateFile({
                fileId: selectedFileId,
                customers
              })
            )
          }

          const updated = customerRowsChanged.map(crc =>
            customers[crc.customerId].tableData.find(workorder => workorder.href === crc.row.href)
          )
          dispatchGrid(
            updatePostRows({
              postRowUpdatesCustomers: updated
            })
          )

          setShowDialog(() => ({
            open: false,
            totalRecordsToBeCommitted: 0,
            totalRecordsToBeCommittedProcessed: 0
          }))
        }

        setTimeout(() => updateGrid(), 0)
      } else if (!errorLog.length) {
        addErrorToast({
          subtitle: 'Unable to commit',
          caption: 'You have not made any changes to the Work Orders you are committing.'
        })
        setShowDialog(() => ({
          open: false,
          totalRecordsToBeCommitted: 0,
          totalRecordsToBeCommittedProcessed: 0
        }))
      }
    }, 1000)
  }

  const { totalRecordsToBeCommitted, totalRecordsToBeCommittedProcessed } = showDialog

  return (
    <>
      <Modal
        open={showDialog.open}
        modalHeading="Commit to Maximo"
        primaryButtonText="OK"
        secondaryButtonText="Cancel"
        onRequestSubmit={() => {}}
        onRequestClose={() => {}}
        className="wopricing__commit-to-maximo--modal"
        passiveModal
      >
        <div className="loading__description">
          <LoadingIcon />
          <b>
            Committing: {totalRecordsToBeCommittedProcessed} of {totalRecordsToBeCommitted} records
          </b>
        </div>
      </Modal>

      <Button
        onClick={async () => {
          await handlePost()
        }}
        className="bx--btn wopricing-btn--secondary"
        labelText="Commit to Maximo"
      >
        Commit to Maximo
      </Button>
      {}
    </>
  )
}
