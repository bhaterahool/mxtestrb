import { descriptionFormatter, numberCurrencyFormatter } from '../../../utilities/formatters'
import { editable } from '../../../../../shared/grid/grid'

const propsAll = {
  resizable: true,
  cellRenderer: 'cellRendererDefault',
  filter: 'agTextColumnFilter',
  sortable: true
}
const limitText = ({ data, newValue }, colName, limitLength) => {
  
  data[colName] = newValue.slice(0, limitLength)
  const isTextValid = newValue.length <= limitLength

  return isTextValid
}

const numberSort = (a, b) => parseFloat(a, 10) - parseFloat(b, 10)

export const additionalFields = [
  {
    ...propsAll,
    field: 'linedescription',
    headerName: 'Line Description',
    editable,
    valueFormatter: descriptionFormatter,
    tooltipField: 'linedescription',
    valueSetter: params => limitText(params, 'linedescription', 100)
  },
  {
    ...propsAll,
    field: 'linecost',
    headerName: 'Line Price',
    editable,
    valueFormatter: numberCurrencyFormatter,
    filter: 'agNumberColumnFilter',
    comparator: numberSort
  },
  
  
  
  
  
  
  
  {
    ...propsAll,
    field: 'committed',
    headerName: 'Committed'
  },
  {
    ...propsAll,
    field: 'error',
    headerName: 'Error',
    tooltipField: 'error'
  },
  
  { headerName: 'Restore columns', field: 'unhiddenColumn', lockVisible: true, hide: true }
]

export const colDefs = [
  {
    ...propsAll,
    field: 'wonum',
    headerName: 'Work Order Number',
    isPrimaryKey: true
  },
  {
    ...propsAll,
    field: 'siteid',
    headerName: 'Site'
  },
  {
    ...propsAll,
    field: 'worktype',
    headerName: 'Work Order Type'
  },
  {
    ...propsAll,
    field: 'commoditygroup',
    headerName: 'Service Group'
  },
  {
    ...propsAll,
    field: 'commodity',
    headerName: 'Service'
  },
  {
    ...propsAll,
    field: 'description',
    headerName: 'Work Order Description',
    valueFormatter: descriptionFormatter
  },
  {
    ...propsAll,
    field: 'pluspcustomer',
    headerName: 'Customer ID'
  },
  {
    ...propsAll,
    field: 'status',
    headerName: 'Work Order Status',
    cellEditor: 'cellEditorStatus',
    editable: props =>
      props?.data?.default?.status === 'MANBILL' ? true : props?.data?.status === 'MANBILL'
  }
].concat(additionalFields)
