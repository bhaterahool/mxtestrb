import React, { useEffect, useRef, useState, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import PropTypes from 'prop-types'
import { Modal, Button, ButtonSet } from 'carbon-components-react'
import { DocumentDownload32, Save32, Upload32 } from '@carbon/icons-react'
import XLSX from 'xlsx'
import { DetailCellRenderer } from './DetailCellRenderer'
import { processAfpData, processChildData } from '../../utilities/processAfpData'
import { useToast } from '../../../../shared/toasts/ToastProvider'
import {
  saveAfpData,
  deleteAfpLines,
  addAfpLineDetail,
  deleteAfpData,
  getAfpLinesContracts,
  getAfpData
} from '../../services/afpApiService'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { useAfpCtx } from '../../context/afp-context'
import { useUI } from '../../context/ui-context/ui-context'
import afpGridDefinition from './gridDefinition'
import { verifySpreadsheetData } from './verifySpreadsheetData'
import { exportAfpData } from '../../utilities/exportAfpData'
import './AfpLinesGrid.scss'
import { addUploadedDataToGrid } from './addUploadDataToGrid'
import { Loading } from '../../../shared-components/Loading'
import {
  hasEmptyRow as verifySpreadsheetHasEmptyRow,
  isEmpty,
  removeEmptyRows as removeEmptyRowsFromSpreadsheet
} from '../../../../util'
import {
  AfpLineGridAssignmentDeleteButton,
  CellAfpLineStatusHistory,
  CellEditorStatus
} from './index'
import { AfpLineStatusHistoryModal, AfpLineAssignmentDetailModal } from '../Modal'
import { CellAfpLineAssignment } from './CustomCellRenderer'
import { AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM } from '../../utilities'

export const AfpLinesGrid = ({ id, onClose, searchRef, setShowEditedByElseModal }) => {
  const { gridRef, setDirtyGrid, isGridDirty, setPristineGrid } = useUI()
  const [gridApi, setGridApi] = useState(null)
  const [pelAfpLineId, setPelAfpLineId] = useState(null)
  const [isLoaderVisible, setIsLoaderVisible] = useState()
  const { afps, updateAfpData } = useAfpCtx()
  const { data: afpData, label } = afps.get(id)
  const { addErrorToast, addSuccessToast, addPersistentErrorToast, addWarningToast } = useToast()
  const grandTotal = useRef(0)
  const subTotal = useRef(0)
  const lineDataToSave = useRef(afpData.pelafpline)
  const rootElRef = useRef()
  const fileInputRef = useRef()
  const [statusWarning, setStatusWarning] = useState({
    action: false,
    message: ''
  })

  const [afpLineStatusHistoryModalStatus, setAfpLineStatusHistoryModalStatus] = useState(false)
  const [afpLineAssignmentModalData, setAfpLineAssignmentModalData] = useState({
    open: false,
    assignmentId: 0
  })

  const isSUBPO = afpData.type === 'SUBPO'
  const isSUBAFP = afpData.type === 'SUBAFP'

  const onGridReady = ({ api, columnApi }) => {
    setGridApi(api)
    
    columnApi.getColumn('statusmemo').getColDef().editable = true
  }

  const saveData = async (href, dataToSave) => {
    return saveAfpData(href, dataToSave, addErrorToast, addSuccessToast).then(async result => {
      setIsLoaderVisible(false)
      if (result) {
        setPristineGrid(id)
        const { isUpdated, pelAfpLines } = await getAfpLinesContracts(
          result?.type,
          result?.pelafpline,
          setIsLoaderVisible
        )

        if (isUpdated) {
          
          result.pelafpline = pelAfpLines
        }

        updateAfpData({
          id,
          label: result.afpnum,
          data: result
        })
      }
    })
  }

  const handleCellAfpLineSatusHistoryButtonClick = pelafplineid => {
    setAfpLineStatusHistoryModalStatus(true)
    setPelAfpLineId(pelafplineid)
  }

  const handleCellAfpLineAssignmentClick = assignmentId => {
    setAfpLineAssignmentModalData({ open: true, assignmentId })
  }

  const extractDetailGridData = (data, childData, forApiPost, removePelDetailsLineId) => {
    let transformedData = data
    if (!data.metadata) {
      const processedData = processChildData([data])
      
      transformedData = processedData[0]
    }
    const {
      child_description,
      linecost,
      pelafplinedetailid,
      metadata: {
        editableField: { orderqty, unitcost }
      },
      ...rest
    } = transformedData

    childData.push({
      ...rest,
      chgqtyonuse: orderqty,
      chgpriceonuse: unitcost,
      description: child_description,
      ...(removePelDetailsLineId ? {} : { pelafplinedetailid })
    })
  }

  const getChildData = (id, forApiPost, removePelDetailsLineId) => {
    const rowNode = gridApi.getRowNode(id)
    let childData = []
    if (forApiPost) {
      const detailGridApi = gridApi.getDetailGridInfo(`detail_${id}`)

      if (rowNode || detailGridApi) {
        if (detailGridApi) {
          detailGridApi?.api?.forEachNode(({ data }) => {
            extractDetailGridData(data, childData, forApiPost, removePelDetailsLineId)
          })
        } else {
          rowNode?.data?.children?.forEach(row => {
            extractDetailGridData(row, childData, forApiPost, removePelDetailsLineId)
          })
        }
      } else {
        const { pelafplinedetail = [] } =
          afpData?.pelafpline?.find(({ assignmentid }) => +assignmentid === +id) ?? {}

        pelafplinedetail.forEach(dtl => {
          const {
            chgpriceonuse,
            chgqtyonuse,
            contractlineid,
            contractlinenum,
            description,
            orderqty,
            unitcost,
            comment,
            pelafplinedetailid
          } = dtl
          childData.push({
            chgpriceonuse,
            chgqtyonuse,
            contractlineid,
            contractlinenum,
            description,
            orderqty,
            unitcost,
            comment,
            ...(removePelDetailsLineId && { pelafplinedetailid })
          })
        })
      }
    } else {
      childData = rowNode.data.children
    }
    return childData
  }

  const extractGridData = (
    forApiPost = false,
    removePelDetailsLineId = false,
    persistOldPelAfpLine = false
  ) => {
    const data = []

    gridApi.forEachNode(
      ({
        id,
        data: {
          pelafplineid,
          status,
          description,
          comment,
          assignmentid,
          wonum,
          ponum,
          metadata,
          statusmemo,
          isdeleted,
          ogStatus
        }
      }) => {
        const pelAfpLine =
          (persistOldPelAfpLine &&
            afpData?.pelafpline?.find(
              row => row?.pelafplineid === pelafplineid && row?.assignmentid === assignmentid
            )) ||
          {}

        data.push({
          ...pelAfpLine,
          pelafplineid,
          status,
          description,
          comment,
          assignmentid,
          wonum,
          ponum,
          isdeleted,
          ...(!forApiPost && metadata),
          linecost: subTotal.current[id],
          pelafplinedetail: getChildData(id, forApiPost, removePelDetailsLineId),
          ogStatus,
          statusmemo: statusmemo || ''
        })
      }
    )
    return data
  }

  const getDataToSaveAndDelete = (doNotCheckDeletedRows = true) => {
    const dataToSave = []
    const dataToDelete = []
    const extractedGridData = extractGridData(true, true)

    extractedGridData.forEach(row => {
      const { isdeleted } = row

      // eslint-disable-next-line no-param-reassign
      delete row.isdeleted

      if (doNotCheckDeletedRows && isdeleted) {
        // eslint-disable-next-line no-underscore-dangle,  no-param-reassign
        row._action = 'Delete'
        dataToDelete.push(row)
      } else {
        dataToSave.push(row)
      }
    })

    return { dataToSave, dataToDelete }
  }

  const deleteAfpLineData = data => {
    const { href } = afpData
    setStatusWarning({ action: false, message: '' })
    return deleteAfpLines(href, data, addErrorToast, addSuccessToast).then(result => {
      setIsLoaderVisible(false)
      if (result) {
        if (!result?.pelafpline) {
          // eslint-disable-next-line no-param-reassign
          result.pelafpline = []
        }
        /* setPristineGrid(id)
        updateAfpData({
          id,
          label: result.afpnum,
          data: result
        }) */
      } else {
        setStatusWarning({ action: false, message: '' })
      }
    })
  }

  const handleExportClick = () => {
    setIsLoaderVisible(true)
    afpData.pelafpline = extractGridData(true, false, true)

    setTimeout(() => {
      updateAfpData({
        id,
        label: afpData.afpnum,
        data: afpData
      })
      exportAfpData(afpData, label)
      setIsLoaderVisible(false)
    }, 2000)
  }

  const checkIfAfpLineUpdatedByAnotherUser = async () => {
    setIsLoaderVisible(true)
    const latestAFPData = await getAfpData(afpData.afpnum, addPersistentErrorToast)
    // eslint-disable-next-line no-underscore-dangle
    if (+latestAFPData?._rowstamp > +afpData?._rowstamp) {
      setShowEditedByElseModal(() => ({
        afpNum: afpData.afpnum,
        action: true,
        actionTriggeredFrom: AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM.AFP_LINE_GRID
      }))

      return true
    }

    return false
  }

  const validateAndSave = async (data, checkAfpUpdatedByAnotherUser = true) => {
    const { href, type } = afpData
    const dataToSave = {
      pelafpline: data
    }

    if (type === 'SUBAFP') {
      const errorList = dataToSave.pelafpline.reduce((acc, element) => {
        const childGridData = element.pelafplinedetail.filter(item => !item.contractlinenum)

        if (childGridData && childGridData.length > 0) {
          childGridData.forEach(() => {
            acc.push(`Assignment ${element.assignmentid} requires MFA Line Number.`)
          })
        }
        return acc
      }, [])
      if (errorList.length) {
        addErrorToast({
          title: 'Error saving Afp lines!',
          subtitle: errorList.join('\n\n'),
          className: 'afp-error'
        })

        return false
      }
    }

    if (dataToSave?.pelafpline?.length) {
      setIsLoaderVisible(true)

      let isAfpUpdatedByUser = false

      if (checkAfpUpdatedByAnotherUser) {
        isAfpUpdatedByUser = await checkIfAfpLineUpdatedByAnotherUser()
      }

      if (isAfpUpdatedByUser === false) {
        await saveData(href, dataToSave)
      }

      setIsLoaderVisible(false)
    }
  }

  const handleSave = async () => {
    gridApi?.stopEditing()

    const { dataToDelete } = getDataToSaveAndDelete()

    if (dataToDelete?.length) {
      return setStatusWarning({
        action: true,
        message: ''
      })
    }

    setTimeout(async () => {
      const { dataToSave } = getDataToSaveAndDelete()
      await validateAndSave(dataToSave)
    }, 1000)
  }

  const onDeleteConfirmation = async () => {
    const { dataToSave, dataToDelete } = getDataToSaveAndDelete()

    setIsLoaderVisible(true)

    const isAfpUpdatedByUser = await checkIfAfpLineUpdatedByAnotherUser()

    if (isAfpUpdatedByUser) {
      setIsLoaderVisible(false)
      return false
    }

    await deleteAfpLineData({
      pelafpline: dataToDelete
    }).then(async () => {
      await validateAndSave(dataToSave, false)
    })
  }

  const onDeleteConfirmationClose = async () => {
    const { dataToSave } = getDataToSaveAndDelete(false)
    await validateAndSave(dataToSave)
  }

  const checkLinecosts = (id, newTotal) => {
    gridApi.forEachNode(({ data }) => {
      const { assignmentid, status, metadata, ...rest } = data

      if (+assignmentid !== +id) return

      const detailGrid = gridApi.getDetailGridInfo(`detail_${id}`)
      const detailGridRows = []

      detailGrid?.api.forEachNode(({ data }) => {
        detailGridRows.push(data)
      })

      if (rest?.children?.length !== detailGridRows.length) {
        rest.children = detailGridRows
      }

      const { poMaximum } = metadata
      const isTotalOverMax = Math.floor(newTotal * 100) / 100 > poMaximum // Rounding off the value for 0.01 tolerance

      const rowNode = gridApi.getRowNode(assignmentid)

      if (isTotalOverMax && (status === 'WAPPR' || status === 'QUERY' || status === 'HOLD')) {
        rowNode.setDataValue('status', 'ABOVEPO')
      }

      if (!isTotalOverMax && status === 'ABOVEPO') {
        rowNode.setDataValue('status', 'WAPPR')
      }
    })
  }

  const handleEmptyDetailGrid = (assignmentid, node) => {
    subTotal.current = {
      ...subTotal.current,
      [assignmentid]: 0
    }
    gridApi.applyTransaction({
      update: [
        {
          ...node,
          status: 'WAPPR',
          linecost: 0,
          children: []
        }
      ]
    })
  }

  const handleRowDataUpdate = ({ api, reCalcLineCost = false }) => {
    setDirtyGrid(id)
    grandTotal.current = 0
    api.forEachNode(({ id, data }) => {
      const detailGrid = api.getDetailGridInfo(`detail_${id}`)
      const noOfRows = detailGrid?.api.rowModel?.getRowCount()
      const rowNode = gridApi.getRowNode(id)

      if (detailGrid && noOfRows === 0 && data.linecost > 0) {
        handleEmptyDetailGrid(id, data)
        return
      }

      let newTotal = 0

      
      if (detailGrid) {
        detailGrid?.api?.forEachNode(({ data: { orderqty = 0, unitcost = 0 } }) => {
          newTotal += +orderqty * +unitcost
        })
      } else if (rowNode?.data) {
        rowNode?.data?.children?.forEach(({ orderqty = 0, unitcost = 0 }) => {
          newTotal += +orderqty * +unitcost
        })
      } else {
        const { pelafplinedetail = [] } =
          afpData?.pelafpline?.find(({ assignmentid }) => +assignmentid === +id) ?? {}
        pelafplinedetail.forEach(({ orderqty, unitcost }) => {
          newTotal += +orderqty * +unitcost
        })
      }

      const currentTotal = subTotal.current[id] || 0

            if (currentTotal !== newTotal || (currentTotal === 0 && newTotal === 0) || reCalcLineCost) {
        
        checkLinecosts(id, newTotal)
      }

      subTotal.current = {
        ...subTotal.current,
        [id]: newTotal
      }

      grandTotal.current += newTotal
    })

    lineDataToSave.current = extractGridData(true, false, true)
  }

  const gridUpdated = (reCalcLineCost = false) => {
    setTimeout(() => {
      handleRowDataUpdate({ api: gridApi, reCalcLineCost })
      lineDataToSave.current = extractGridData(true, false, true)
      setIsLoaderVisible(false)
      addSuccessToast({
        subtitle: 'File import complete.'
      })
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (isGridDirty(id)) {
        setPristineGrid(id)
        updateAfpData({
          id,
          metadata: {
            ...afpData.metadata,
            isModified: true
          },
          data: {
            totalappvalue: grandTotal.current,
            pelafpline: lineDataToSave.current
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    if (gridApi) {
      const ro = new ResizeObserver(([{ target }]) => {
        if (target.offsetWidth > 0) gridApi.sizeColumnsToFit()
      })

      ro.observe(rootElRef.current)

      return () => ro.disconnect()
    }
  }, [rootElRef.current, gridApi])

  const getContextMenuItems = () => ['copy', 'autoSizeAll', 'resetColumns']

  const triggerFileImport = () => {
    
    
    
    
    
    
    
    fileInputRef.current.click()
  }

  const readFile = file => {
    const fileReader = new FileReader()
    fileReader.onload = async ({ target }) => {
      const { result: binaryString } = target
      const workbook = XLSX.read(binaryString, { type: 'binary' })
      const [firstSheetName] = workbook.SheetNames
      const worksheet = workbook.Sheets[firstSheetName]
      const data = removeEmptyRowsFromSpreadsheet(
        XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      )

      if (data) {
        const hasEmptyRow = verifySpreadsheetHasEmptyRow(
          XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
        )
        if (hasEmptyRow) {
          fileReader.abort()
          return addPersistentErrorToast({
            title: 'Error reading file!',
            subtitle: 'Attempting to add AFP Lines that are not contiguous'
          })
        }
      }
      const verificationPassed = await verifySpreadsheetData(
        data,
        afpData,
        addPersistentErrorToast,
        addWarningToast
      )
      if (verificationPassed && data.length > 0) {
        setIsLoaderVisible(true)
        addUploadedDataToGrid({
          gridApi,
          gridUpdated,
          isSUBAFP,
          isSUBPO,
          addAfpLineDetail,
          afpData,
          addErrorToast,
          data
        })
      }
    }
    fileReader.onerror = () => {
      addPersistentErrorToast({
        title: 'Error reading file!',
        subtitle: fileReader.error
      })
      fileReader.abort()
    }
    fileReader.readAsBinaryString(file)
  }

  const handleFileImport = ({ target }) => {
    const { files } = target
    const [file] = files
    readFile(file)
    
    target.value = ''
  }

  const handleCellValueChange = ({ newValue, colDef }) => {
    const { field } = colDef

    setDirtyGrid(id)

    if (field === 'status' && newValue === 'WAPPR') {
      checkLinecosts()
    }

    gridApi.applyTransaction({})
  }

  const handleCellEditingStarted = ({ column, data, api: gridApi }) => {
    if (column.colId === 'statusmemo') {
      const { assignmentid } = data

      const afpLine = lineDataToSave.current.filter(row => +row.assignmentid === +assignmentid)
      if (afpLine) {
        const { status } = afpLine[0]

        if (data?.ogStatus === status) {
          gridApi.stopEditing()
        }
      }
    }
  }

  const gridData = useMemo(() => processAfpData(afpData), [])

  const handleCloseAfpLineStatusHistoryModal = () => {
    setPelAfpLineId(null)
    setAfpLineStatusHistoryModalStatus(false)
  }

  const getColumnDef = () => {
    const columnDefs = afpGridDefinition(afpData.status)
    if (afpData.type === 'SUBAFP') {
      columnDefs.splice(6, 0, {
        field: 'pelmfaref',
        headerName: 'MFA Reference',
        editable: false,
        resizable: true
      })
    }
    return columnDefs
  }

  const [showModal, setShowModal] = useState(false)

  const onModalDeleteClick = () => {
    setShowModal(true)
  }

  const onAFPDeleteConfirmation = async () => {
    
    const deleteURL = afpData.href.replace('pelos/', 'os/')
    await deleteAfpData(deleteURL, {}, addPersistentErrorToast, addSuccessToast)
    setShowModal(false)
    onClose(id, { isModified: false })
    searchRef.current.clearInput('')
  }

  const onAFPDeleteConfirmationClose = () => {
    setShowModal(false)
  }

  return (
    <>
      <AfpLineStatusHistoryModal
        modalTitle="Afp Line Status History"
        open={afpLineStatusHistoryModalStatus}
        objectStructure="PELAFPLINESTATUSHIST"
        pelAfpLineId={pelAfpLineId}
        query={`oslc.where=pelafplineid=${pelAfpLineId}&oslc.select=*`}
        onRequestClose={handleCloseAfpLineStatusHistoryModal}
      />

      <Modal
        open={statusWarning.action}
        modalHeading="Are you sure you want to delete the AFP Lines marked for deletion?"
        primaryButtonText="OK"
        secondaryButtonText="Cancel"
        onRequestSubmit={onDeleteConfirmation}
        onRequestClose={onDeleteConfirmationClose}
        preventCloseOnClickOutside
      >
        {statusWarning.message}
      </Modal>
      <Modal
        open={showModal}
        modalHeading="Are you sure you want to delete this AFP?"
        primaryButtonText="Delete AFP"
        secondaryButtonText="Cancel"
        onRequestSubmit={onAFPDeleteConfirmation}
        onRequestClose={onAFPDeleteConfirmationClose}
        preventCloseOnClickOutside
      />

      <AfpLineAssignmentDetailModal
        data={afpLineAssignmentModalData}
        handleModalStatus={setAfpLineAssignmentModalData}
      />

      <div
        id="afp-lines-grid"
        className="afp-afplinesgrid__grid-wrapper ag-theme-alpine"
        ref={rootElRef}
      >
        <div className="afp-afplinesgrid__row">
          <div>
            <h3>Application for Payment Line Detail</h3>
            <p>
              First add the AFP lines, then complete the details by adding actuals to determine the
              value.
            </p>
          </div>
        </div>
        <AgGridReact
          ref={gridRef}
          rowData={gridData}
          onGridReady={onGridReady}
          columnDefs={getColumnDef()}
          detailCellRenderer="customDetailCellRenderer"
          frameworkComponents={{
            cellAssignmentDelete: AfpLineGridAssignmentDeleteButton,
            cellAfpLineAssignment: CellAfpLineAssignment,
            cellAfpLineStatusHistory: CellAfpLineStatusHistory,
            cellSelect: CellEditorStatus,
            cellEditorStatus: CellEditorStatus,
            customDetailCellRenderer: DetailCellRenderer
          }}
          masterDetail
          context={{
            tabId: id,
            handleCellAfpLineSatusHistoryButtonClick,
            handleCellAfpLineAssignmentClick
          }}
          getRowId={({ data }) => data.assignmentid}
          onRowDataUpdated={handleRowDataUpdate}
          stopEditingWhenCellsLoseFocus
          keepDetailRows
          keepDetailRowsCount={10000}
          getContextMenuItems={getContextMenuItems}
          onCellValueChanged={handleCellValueChange}
          onCellEditingStarted={handleCellEditingStarted}
          singleClickEdit
        />
        <div className="afp--cta-container afp-detail-cell-renderer__row">
          <ButtonSet>
            <input
              hidden
              ref={fileInputRef}
              className="afp-afplinesgrid__hidden-input"
              type="file"
              accept=".xls,.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileImport}
            />
            <Button
              renderIcon={DocumentDownload32}
              onClick={handleExportClick}
              size="sm"
              kind="tertiary"
            >
              Export
            </Button>
            <Button renderIcon={Upload32} onClick={triggerFileImport} size="sm" kind="tertiary">
              Import
            </Button>
          </ButtonSet>
          <ButtonSet className="afp-grid__action--buttons">
            {afpData.status === 'NEW' && isEmpty(afpData?.pelafpline) && (
              <Button className="afp-del-btn" onClick={onModalDeleteClick}>
                Delete AFP
              </Button>
            )}

            {gridApi && (
              <Button
                renderIcon={Save32}
                disabled={!['NEW', 'QUERY'].includes(afpData?.status)}
                onClick={handleSave}
              >
                Save AFP
              </Button>
            )}
          </ButtonSet>
        </div>
      </div>
      {isLoaderVisible ? <Loading modal /> : null}
    </>
  )
}

AfpLinesGrid.propTypes = {
  id: PropTypes.string
}
