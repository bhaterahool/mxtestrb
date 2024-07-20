import { AFP_STATUS_NEW, AFP_STATUS_QUERY } from '../../../../shared/grid/constants'
import { currencyFormatter } from '../../utilities/formatters'

export const STATUS = {
  hold: 'HOLD',
  query: 'QUERY',
  wapper: 'WAPPR'
}

const STATUS_LIST = Object.values(STATUS).map(status => ({ status }))

const includeStatuses = incl =>
  Object.values(STATUS).reduce((accum, status) => {
    if (incl.indexOf(status) !== -1) {
      accum.push({ status })
    }
    return accum
  }, [])

export const getStatus = curStatus => {
  switch (curStatus) {
    case 'QUERY':
      return STATUS_LIST
    case 'WAPPR':
    case 'HOLD':
      return includeStatuses([STATUS.hold, STATUS.wapper])
    default:
      return []
  }
}

const getTotalCost = ({ data, node, api }) => {
  const { linecost, children } = data
  const { id } = node
  const detailGrid = api.getDetailGridInfo(`detail_${id}`)
  let total = 0
  if (detailGrid) {
    detailGrid?.api.forEachNode(({ data }) => {
      const { orderqty, unitcost } = data
      total += orderqty * unitcost
    })
  } else {
    children.forEach(({ orderqty, unitcost }) => {
      total += orderqty * unitcost
    })
  }
  return total ?? linecost
}

const checkStatus = status => !['SUBMITTED', 'APPROVED', 'CLOSED', 'ABOVEPO'].includes(status)
const getAfpLineDeleteColumnStatus = status => ![AFP_STATUS_NEW, AFP_STATUS_QUERY].includes(status)

const gridDefinition = afpStatus => [
  {
    field: 'assignmentid',
    headerName: 'Assignment ID',
    cellRenderer: 'agGroupCellRenderer',
    editable: false,
    cellRendererParams: {
      innerRenderer: 'cellAfpLineAssignment'
    },
    resizable: true
  },
  {
    field: 'wonum',
    headerName: 'Work Order Number',
    editable: false,
    resizable: true
  },
  {
    field: 'ponum',
    headerName: 'PO',
    editable: false,
    resizable: true
  },
  {
    field: 'status',
    headerName: 'AFP Line Status',
    resizable: true,
    cellClass: checkStatus(afpStatus) ? 'pel--editable-grid-cell' : '',
    editable: checkStatus(afpStatus),
    cellEditor: 'cellEditorStatus',
    cellEditorParams: {
      values: getStatus,
      field: 'status',
      withSearch: false,
      containerElQuery: '#afp-lines-grid .ag-body-viewport'
    },
    filter: true
  },
  {
    field: 'statusmemo',
    headerName: 'Status Memo',
    editable: ({ data }) => {
      return data.status !== data.ogStatus
    },
    resizable: true
  },
  {
    field: 'description',
    headerName: 'Description',
    editable: false,
    resizable: true
  },
  {
    field: 'linecost',
    headerName: 'AFP Line Cost',
    editable: false,
    valueFormatter: currencyFormatter,
    resizable: true,
    valueGetter: getTotalCost
  },
  {
    field: 'comment',
    headerName: 'Notes',
    cellClass: checkStatus(afpStatus) ? 'pel--editable-grid-cell' : '',
    editable: checkStatus(afpStatus),
    resizable: true
  },
  {
    field: 'afpLineStatusHistory',
    headerName: 'AFP Line Status History',
    editable: false,
    cellRenderer: 'cellAfpLineStatusHistory',
    resizable: true
  },
  {
    field: 'actions',
    headerName: '',
    editable: false,
    cellRenderer: 'cellAssignmentDelete',
    cellClass: 'afp--action-cell',
    filter: false,
    suppressMenu: true,
    pinned: 'right',
    width: 90,
    hide: getAfpLineDeleteColumnStatus(afpStatus)
  }
]

export default gridDefinition
