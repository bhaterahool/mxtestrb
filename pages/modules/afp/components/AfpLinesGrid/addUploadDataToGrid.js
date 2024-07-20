import { uniqueId } from 'lodash'
import { log } from '../../../../dev.config'
import { isEmpty } from '../../../../util'

const checkFields = (
  { 'Line Detail ID': lineId, Qty, 'Unit Cost': unitCost },
  detailGridLineIds = []
) => {
  return !detailGridLineIds?.includes(lineId) && Qty !== '' && Qty > 0 && unitCost !== ''
}

const getStatus = (id, data, status, gridApi) => {
  const newTotal = data.reduce((acc, { 'Assignment ID': assignmentid, 'Unit Cost': unitCost }) => {
    return id === assignmentid ? acc + unitCost : acc
  }, 0)
  let newStatus = status
  gridApi.forEachNode(({ data }) => {
    const { assignmentid, metadata } = data

    if (assignmentid === id) {
      const { poMaximum } = metadata
      const isTotalOverMax = newTotal > poMaximum
      if (isTotalOverMax && (status === 'WAPPR' || status === 'QUERY' || status === 'HOLD')) {
        newStatus = 'ABOVEPO'
      }
    }
  })
  return newStatus
}

export const addUploadedDataToGrid = async ({
  gridApi,
  gridUpdated,
  isSUBAFP,
  isSUBPO,
  data,
  afpData
}) => {
  const { pelafpline: pelAfpLines = [] } = afpData

  const statusUpdates = data.reduce(
    (
      acc,
      {
        'Assignment ID': assignmentid,
        'AFP Line Status': status,
        'Assignment Notes': comment,
        'Status Memo': statusMemo
      }
    ) => {
      const newStatus = getStatus(assignmentid, data, status, gridApi)

      if (acc[assignmentid]) {
        return acc
      }

      const { status: oldStatus = '', statusmemo: oldStatusMemo = '' } =
        pelAfpLines?.find(row => row.assignmentid === assignmentid) ?? {}

      acc[assignmentid] = {
        assignmentid,
        comment,
        status: newStatus,
        statusmemo: oldStatus && oldStatus !== status ? statusMemo : oldStatusMemo
      }

      return acc
    },
    {}
  )

  const afpLineImportedData = Object.values(statusUpdates).map(
    ({ assignmentid, status, comment, statusmemo }) => ({
      ...gridApi.getRowNode(assignmentid).data,
      status,
      comment,
      statusmemo: statusmemo || ''
    })
  )

  const prepareDataForChildGrid = (data, isUpdate) => {
    if (isSUBAFP) {
      return data.map(
        ({
          'Line Detail ID': pelafplinedetailid,
          'MFA No': mfaNumber,
          'MFA Line No': mfaLineNum,
          'Line Description': child_description,
          'Line Notes': comment,
          Qty: orderqty,
          'Unit Cost': unitcost
        }) => {
          const afpLineContractList =
            pelAfpLines?.find(row => row?.pelmfaref === mfaNumber)?.pelContractLines ?? []

          const list = afpLineContractList?.find(
            ({ contractlinenum }) => contractlinenum === mfaLineNum
          )

          return {
            pelafplinedetailid: !isUpdate ? uniqueId(`new_${Date.now()}_`) : pelafplinedetailid,
            contractlinenum: mfaLineNum,
            description: child_description ?? list?.description,
            child_description: child_description ?? list?.description,
            comment,
            orderqty,
            unitcost,
            metadata: {
              editableField: {
                orderqty: list?.chgqtyonuse,
                unitcost: list?.chgpriceonuse
              }
            }
          }
        }
      )
    }

    if (isSUBPO) {
      return data.map(
        ({
          'Line Detail ID': pelafplinedetailid,
          'Line Notes': comment,
          Qty: orderqty,
          'Unit Cost': unitcost
        }) => {
          return {
            pelafplinedetailid: !isUpdate ? uniqueId(`new_${Date.now()}`) : pelafplinedetailid,
            comment,
            orderqty,
            unitcost,
            metadata: {
              editableField: {
                orderqty: true,
                unitcost: true
              }
            }
          }
        }
      )
    }
  }
  const start = new Date()

  let updateCount = 0
  let updatedCount = 0

  const requestCallback = () => {
    updatedCount += 1
    if (updateCount === updatedCount) setTimeout(() => log.dur('Imported', start), 0)
  }

  const getDetailLineIds = id => {
    const detailGridApi = gridApi.getDetailGridInfo(`detail_${id}`)
    const excelImportedLineIds = data.map(item => item['Line Detail ID'])
    const detailLineIds = []

    if (detailGridApi) {
      detailGridApi.api.forEachNode(({ data: { pelafplinedetailid } }) => {
        if (!excelImportedLineIds.includes(pelafplinedetailid)) {
          detailLineIds.push({ pelafplinedetailid })
        }
      })
    }

    return detailLineIds
  }

  const updateGrid = ({ add = [], update = [] }, assignmentid) => {
    if (!isEmpty(add) || !isEmpty(update)) {
      updateCount += (add?.length ?? 0) + (update?.length ?? 0)

      const rowUpdated = [
        {
          ...(afpLineImportedData?.find(row => row.assignmentid === assignmentid) || {}),
          children: [...add, ...update]
        }
      ]

      setTimeout(() => {
        gridApi.applyTransactionAsync(
          {
            update: rowUpdated
          },
          requestCallback
        )
      }, 0)
    }
  }

  const getDetailGridRows = id => {
    const rows = []
    const detailGridApi = gridApi.getDetailGridInfo(`detail_${id}`)

    if (detailGridApi?.api) {
      detailGridApi.api.forEachNode(row => rows.push(row.data))
    }

    return rows
  }

  
  gridApi.forEachNode(({ id, data: { assignmentid } }) => {
    const uploadedDataForThisLine = data.filter(
      ({ 'Assignment ID': filterAssignmentid }) => filterAssignmentid === assignmentid
    )

    const node = gridApi.getRowNode(assignmentid)
    const detailGridApi = gridApi.getDetailGridInfo(`detail_${id}`)

    const detailGridRows = getDetailGridRows(id)
    const detailGridLineIds = detailGridRows?.map(({ pelafplinedetailid }) => pelafplinedetailid)

    if (uploadedDataForThisLine && node) {
      const newRecords = uploadedDataForThisLine.filter(row => checkFields(row, detailGridLineIds))

      const exitingRecords = uploadedDataForThisLine.filter(({ 'Line Detail ID': lineid }) =>
        detailGridLineIds.includes(lineid)
      )

      const processedNewChildData = prepareDataForChildGrid(newRecords)
      const processedExistingChildData = prepareDataForChildGrid(exitingRecords, true)

      const detailNodeLineIds = getDetailLineIds(id)

      if (detailGridApi) {
        if (!isEmpty(detailNodeLineIds)) {
          detailGridApi.api.applyTransaction({
            remove: detailNodeLineIds
          })
        }

        if (!isEmpty(processedExistingChildData)) {
          detailGridApi.api.applyTransaction({
            update: processedExistingChildData
          })
        }

        if (!isEmpty(processedNewChildData)) {
          detailGridApi.api.applyTransaction({
            add: processedNewChildData
          })
        }
      }

      
      updateGrid(
        {
          add: processedNewChildData,
          update: processedExistingChildData
        },
        assignmentid
      )
    }
  })

  
  setTimeout(() => gridApi.applyTransactionAsync({}), 0)
  setTimeout(() => gridUpdated(true), 0)
}
