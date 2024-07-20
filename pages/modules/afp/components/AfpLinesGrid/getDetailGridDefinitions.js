import { currencyFormatter, lineIdFormatter } from '../../utilities/formatters'
import { AFP_STATUS_APPR } from '../../../../shared/grid/constants'

const getLinecostValues = ({ data }) => {
  const { orderqty = 1, unitcost = 0 } = data
  return orderqty * unitcost
}

const checkPermission = ({ contractlinenum }, fieldName, contractLineData) => {
  if (!contractlinenum) return true
  const lineData = contractLineData?.find(item => item.contractlinenum === contractlinenum) ?? {}
  return lineData[fieldName] || false
}

const onSelect = ({
  selectedItem,
  api,
  data: {
    pelafplinedetailid,
    metadata,
    orderqty: selectedorderqty,
    unitcost: selectedunitcost,
    contractlinenum: selectedcontractlinenum
  },
  ...props
}) => {
  const [
    { orderqty, unitcost, description, chgqtyonuse, chgpriceonuse, contractlinenum, contractlineid }
  ] = selectedItem

  if (orderqty) {
    api.applyTransaction({
      update: [
        {
          pelafplinedetailid,
          contractlinenum,
          contractlineid,
          orderqty:
            selectedcontractlinenum === contractlinenum && selectedorderqty !== 0
              ? parseFloat(selectedorderqty)
              : orderqty,
          unitcost:
            selectedcontractlinenum === contractlinenum && selectedunitcost !== 0
              ? parseFloat(selectedunitcost)
              : unitcost,
          description,
          child_description: description,
          metadata: {
            ...metadata,
            editableField: {
              orderqty: chgqtyonuse,
              unitcost: chgpriceonuse
            }
          }
        }
      ]
    })
  }

  api.redrawRows({
    rowNodes: [props.node],
    columns: [props.column],
    force: true,
    suppressFlash: false
  })
}

const intValueSetter = ({ data, newValue }, colName) => {
  const newValInt = Number(newValue)
  const isValidChange = !Number.isNaN(newValInt) && data[colName] !== newValInt

  if (isValidChange) {
    data[colName] = newValInt
  }

  return isValidChange
}

const checkStatus = status => !['SUBMITTED', 'APPROVED', 'CLOSED'].includes(status)
const checkAppLineStatus = status => status === AFP_STATUS_APPR

export const getDetailGridDefinitions = async (type, params) => {
  const { status, afpLineStatus = status, afpContractLines } = params
  const contractLineData = type === 'SUBAFP' ? afpContractLines : []

  switch (type) {
    case 'SUBAFP':
      return [
        {
          field: 'contractlinenum',
          headerName: 'MFA Line Num',
          cellClass: checkStatus(status) ? 'pel--editable-grid-cell' : '',
          editable: false,
          resizable: true,
          cellEditor: 'cellSelect',
          cellEditorParams: {
            values: contractLineData,
            onSelect,
            field: 'contractlinenum'
          },
          hide: true
        },
        {
          field: 'child_description',
          headerName: 'Description',
          cellClass: checkStatus(status) ? 'pel--editable-grid-cell' : '',
          editable: checkStatus(status),
          resizable: true,
          cellEditor: 'cellAutocomplete',
          cellEditorParams: {
            cellSelectOptions: contractLineData,
            onSelect,
            field: 'description'
          }
        },
        {
          field: 'comment',
          headerName: 'Notes',
          cellClass: checkStatus(status) ? 'pel--editable-grid-cell' : '',
          editable: checkStatus(status),
          resizable: true
        },
        {
          field: 'orderqty',
          headerName: 'Qty',
          cellClass: params =>
            checkStatus(status) && checkPermission(params.data, 'chgqtyonuse', contractLineData)
              ? 'pel--editable-grid-cell'
              : '',
          editable: params =>
            checkStatus(status) && checkPermission(params.data, 'chgqtyonuse', contractLineData),
          resizable: true,
          cellEditor: 'cellNumberEditor',
          cellRenderer: 'cellRenderer'
        },
        {
          field: 'unitcost',
          headerName: 'Unit Cost',
          valueFormatter: currencyFormatter,
          cellClass: params =>
            checkStatus(status) && checkPermission(params.data, 'chgpriceonuse', contractLineData)
              ? 'pel--editable-grid-cell'
              : '',
          editable: params =>
            checkStatus(status) && checkPermission(params.data, 'chgpriceonuse', contractLineData),
          resizable: true,
          cellEditor: 'cellNumberEditor',
          cellRenderer: 'cellRenderer'
        },
        {
          field: 'linecost',
          headerName: 'Detail Line Cost',
          editable: false,
          valueFormatter: currencyFormatter,
          resizable: true,
          valueGetter: getLinecostValues
        },
        {
          field: 'actions',
          headerName: '',
          editable: false,
          cellRenderer: 'actionsCell',
          cellRendererParams: {
            status,
            afpLineStatus
          },
          cellClass: 'afp--action-cell',
          filter: false,
          suppressMenu: true,
          pinned: 'right',
          width: 90,
          hide: checkAppLineStatus(afpLineStatus)
        }
      ]
    case 'SUBPO':
      return [
        {
          field: 'pelafplinedetailid',
          headerName: 'Line Detail ID',
          editable: false,
          resizable: true,
          valueFormatter: lineIdFormatter
        },
        {
          field: 'comment',
          headerName: 'Notes',
          cellClass: 'pel--editable-grid-cell',
          editable: true,
          resizable: true
        },
        {
          field: 'orderqty',
          headerName: 'Qty',
          cellClass: 'pel--editable-grid-cell',
          editable: true,
          resizable: true,
          valueSetter: params => intValueSetter(params, 'orderqty')
        },
        {
          field: 'unitcost',
          headerName: 'Unit Cost',
          cellClass: 'pel--editable-grid-cell',
          editable: true,
          resizable: true,
          cellEditor: 'cellNumberEditor',
          valueFormatter: currencyFormatter,
          valueSetter: params => intValueSetter(params, 'unitcost')
        },
        {
          field: 'linecost',
          headerName: 'Detail Line Cost',
          editable: false,
          cellEditor: 'cellNumberEditor',
          valueFormatter: currencyFormatter,
          resizable: true,
          valueGetter: getLinecostValues
        },
        {
          field: 'actions',
          headerName: '',
          editable: false,
          cellRenderer: 'actionsCell',
          cellRendererParams: {
            status
          },
          cellClass: 'afp--action-cell',
          filter: false,
          suppressMenu: true,
          pinned: 'right',
          width: 90
        }
      ]
    default:
      break
  }
}
