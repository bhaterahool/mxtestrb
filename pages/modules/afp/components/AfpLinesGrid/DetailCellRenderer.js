import React, { useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllModules } from 'ag-grid-enterprise'
import { Button } from 'carbon-components-react'
import { Add16 } from '@carbon/icons-react'
import { ActionCell } from './ActionCell'
import CellEditor from './CellEditor'
import CellSelect from './CellSelect'
import { getDetailGridDefinitions } from './getDetailGridDefinitions'
import { useUI } from '../../context/ui-context/ui-context'
import CellRenderer from './CellRenderer'
import { useAfpCtx } from '../../context/afp-context'
import { Loading } from '../../../shared-components/Loading'
import { CellNumberEditor } from '../../../../shared/grid/cellNumberEditor'
import { CellAutoCompelete } from './CustomGridComponents'

export const DetailCellRenderer = ({ context, data, node, api: masterGridApi }) => {
  const { afps } = useAfpCtx()
  const [detailGridApi, setDetailGridApi] = useState()
  const [detailGridDefinitions, setDetailGridDefinitions] = useState()
  const rootElRef = useRef()

  const { type, pelafpid, mfarevisonnum, mfaref } = data.metadata
  const afpData = afps.get(context.tabId)

  const afpContractLines =
    afpData?.data?.pelafpline?.find(({ pelafplineid }) => pelafplineid === node?.data?.pelafplineid)
      ?.pelContractLines ?? []

  useEffect(() => {
    let safeToUpdate = true
    getDetailGridDefinitions(type, {
      id: pelafpid,
      mfarevisonnum,
      mfaref,
      status: afpData?.data?.status,
      afpLineStatus: data?.status,
      afpContractLines,
      masterGridApi
    }).then(definitions => {
      let colDefs = [...definitions]
      if (
        ['SUBMITTED', 'APPR', 'CLOSED'].includes(data?.status) ||
        ['SUBMITTED', 'APPROVED', 'CLOSED'].includes(afpData?.data?.status)
      ) {
        colDefs = definitions.map(({ editable, ...restitem }) => ({
          ...restitem,
          editable: false
        }))
      }
      if (safeToUpdate) {
        setDetailGridDefinitions(colDefs)
      }
    })

    return () => {
      safeToUpdate = false
    }
  }, [])

  const rowId = node.id
  const dataLength = data.children?.length

  const { gridRef } = useUI()

  const updateRowHeights = () => {
    node.setRowHeight(window.innerHeight - 600)
    masterGridApi.onRowHeightChanged()
  }

  useEffect(() => {
    if (gridRef.current) {
      
    }
  }, [dataLength])

  useEffect(() => {
    if (detailGridApi) {
      const ro = new ResizeObserver(([{ target }]) => {
        if (target.offsetWidth > 0) {
          detailGridApi.api.sizeColumnsToFit()
          detailGridApi.columnApi.autoSizeColumns(['child_description', 'comment'])
        }
      })

      ro.observe(rootElRef.current)

      return () => ro.disconnect()
    }
  }, [rootElRef.current, detailGridApi])

  useEffect(() => {
    if (detailGridApi) {
      const ro = new ResizeObserver(([{ target }]) => {
        if (target.offsetWidth > 0) {
          detailGridApi.api.sizeColumnsToFit()
        }
      })

      ro.observe(rootElRef.current)

      return () => ro.disconnect()
    }
  }, [detailGridApi])

  const onRowDataUpdated = ({ api }) => {
    masterGridApi.applyTransaction({}) 
    
  }

  const onGridReady = ({ api, columnApi }) => {
    const gridInfo = {
      id: rowId,
      api,
      columnApi
    }
    setDetailGridApi(gridInfo)
    masterGridApi.addDetailGridInfo(rowId, gridInfo)
  }

  const addRow = () => {
    if (detailGridApi?.api) {
      detailGridApi.api.applyTransaction({
        add: [
          {
            pelafplinedetailid: `new_${Date.now()}`,
            orderqty: 0,
            unitcost: 0,
            metadata: {
              newRow: true,
              editableField: {
                orderqty: false,
                unitcost: false
              }
            }
          }
        ]
      })
    }
  }

  const onCellValueChanged = ({ colDef }) => {
    const { field } = colDef
    switch (field) {
      case 'unitcost':
      case 'orderqty':
      case 'comment':
        masterGridApi.applyTransaction({}) 
        break
      default:
        break
    }
  }

  const getContextMenuItems = () => ['copy', 'autoSizeAll', 'resetColumns']

  if (!detailGridDefinitions) {
    return <Loading />
  }

  return (
    <div className="afp-detail-cell-renderer__wrapper" ref={rootElRef}>
      <AgGridReact
        id="detailGrid"
        frameworkComponents={{
          actionsCell: ActionCell,
          cellEditor: CellEditor,
          cellSelect: CellSelect,
          cellAutocomplete: CellAutoCompelete,
          cellRenderer: CellRenderer,
          cellNumberEditor: CellNumberEditor
        }}
        className="full-width-grid ag-theme-alpine"
        columnDefs={detailGridDefinitions}
        rowData={data.children}
        modules={AllModules}
        onGridReady={onGridReady}
        getRowId={({ data }) => data.pelafplinedetailid}
        onRowDataUpdated={onRowDataUpdated}
        onCellValueChanged={onCellValueChanged}
        stopEditingWhenCellsLoseFocus
        animateRows
        enableRangeSelection
        singleClickEdit
        getContextMenuItems={getContextMenuItems}
        context={{
          masterGrid: {
            api: masterGridApi,
            data
          }
        }}
      />
      <div className="afp-detail-cell-renderer__row--right">
        <Button
          renderIcon={Add16}
          disabled={
            ['SUBMITTED', 'APPR', 'CLOSED'].includes(data?.status) ||
            ['SUBMITTED', 'APPROVED', 'CLOSED'].includes(afpData?.data?.status)
          }
          onClick={addRow}
        >
          Add row
        </Button>
      </div>
    </div>
  )
}
