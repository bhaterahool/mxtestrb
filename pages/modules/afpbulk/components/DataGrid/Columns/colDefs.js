import { editable } from '../../../../../shared/grid/grid'

import { valueFormatters } from '../Cell/valueFormatters'
import { valueSetters } from '../Cell/valueSetters'

const propsAll = {
  resizable: true,
  cellRenderer: 'cellRendererDefault',
  filter: 'agTextColumnFilter',
  sortable: true
}


export const fixCol = {
  headerName: 'Restore columns',
  field: 'unhiddenColumn',
  lockVisible: true,
  hide: true
}

const intValueSetter = ({ data, newValue }, colName) => {
  const newValInt = Number(newValue)
  const isValidChange = !Number.isNaN(newValInt) && data[colName] !== newValInt

  if (isValidChange) {
    data[colName] = newValInt
  }

  return isValidChange
}

export const additionalFieldsAssets = [fixCol]

const valueSetterMaxLen = ({ key, len }) => params => {
  const { data, newValue } = params
  data[key] = newValue.length < len ? params.newValue : params.newValue.substring(0, len)
  return true
}

export const additionalFieldsAssignments = [
  {
    ...propsAll,
    field: 'committed',
    headerName: 'Committed'
  },
  {
    ...propsAll,
    field: 'error',
    headerName: 'Error'
  },
  fixCol
]

export const colDefsAssignments = [
  {
    ...propsAll,
    field: 'assignmentid',
    headerName: 'Assignment'
  },
  {
    ...propsAll,
    field: 'apptrequired',
    headerName: 'Appointment Required'
  },
  {
    ...propsAll,
    field: 'pelappointslotstart',
    cellEditor: 'dateTimeEditor',
    headerName: 'Appointment Start',
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'pelappointslotfinish',
    headerName: 'Appointment Finish',
    cellEditor: 'dateTimeEditor',
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'peldescription',
    headerName: 'Assignment Description'
  },
  {
    ...propsAll,
    field: 'pelpermitref',
    headerName: 'Permit Reference',
    editable
  },
  {
    ...propsAll,
    field: 'pelpermitrequired',
    headerName: 'Permit Required'
  },
  {
    ...propsAll,
    field: 'ticketid',
    headerName: 'SR Number'
  },
  {
    ...propsAll,
    field: 'wonum',
    headerName: 'Work Order'
  },
  {
    ...propsAll,
    field: 'pluspcustomer',
    headerName: 'Customer'
  },
  {
    ...propsAll,
    field: 'pellocbuilding',
    headerName: 'Building'
  },
  {
    ...propsAll,
    field: 'status',
    headerName: 'Status',
    editable,
    cellEditor: 'dropdownEditor',
    headerComponentParams: {
      dropdownKey: 'statuses'
    }
  },
  {
    ...propsAll,
    field: 'pelreasoncode',
    headerName: 'Reason Code',
    editable: props => props.data?.default?.status !== props.data.status && !props.data.locked,
    cellEditor: 'dropdownEditor',
    headerComponentParams: {
      dropdownKey: 'reasoncodes'
    }
  },
  {
    ...propsAll,
    field: 'startdate',
    headerName: 'Actual Start',
    cellEditor: 'dateTimeEditor',
    editable,
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'finishdate',
    headerName: 'Actual Finish',
    cellEditor: 'dateTimeEditor',
    editable,
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'pelassignstart',
    headerName: 'Estimated Start',
    cellEditor: 'dateTimeEditor',
    editable,
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'pelassignfinish',
    headerName: 'Estimated Finish',
    cellEditor: 'dateTimeEditor',
    editable,
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'worktype',
    headerName: 'Worktype'
  },
  {
    ...propsAll,
    field: 'targstartdate',
    headerName: 'Target Start',
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'targcompdate',
    headerName: 'Target Finish',
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'pelsrtype',
    headerName: 'Service Request Type'
  },
  {
    ...propsAll,
    field: 'wopriority',
    headerName: 'Priority'
  },
  {
    ...propsAll,
    field: 'mtfmcof',
    headerName: 'Failure Reason',
    editable
  },
  {
    ...propsAll,
    field: 'failurecode',
    headerName: 'Failure Class',
    editable,
    valueSetter: valueSetterMaxLen({ key: 'failurecode', len: 8 })
  },
  {
    ...propsAll,
    field: 'failurereportProblem',
    headerName: 'Problem',
    editable,
    valueSetter: valueSetterMaxLen({ key: 'failurereportProblem', len: 8 })
  },
  {
    ...propsAll,
    field: 'failurereportCause',
    headerName: 'Cause',
    editable,
    valueSetter: valueSetterMaxLen({ key: 'failurereportCause', len: 8 })
  },
  {
    ...propsAll,
    field: 'failurereportRemedy',
    headerName: 'Remedy',
    editable,
    valueSetter: valueSetterMaxLen({ key: 'failurereportRemedy', len: 8 })
  }
].concat(additionalFieldsAssignments)

export const colDefsAssets = [
  {
    ...propsAll,
    field: 'assignmentid',
    headerName: 'Assignment'
  },
  {
    ...propsAll,
    field: 'wonum',
    headerName: 'Work Order'
  },
  {
    ...propsAll,
    field: 'multiid',
    headerName: 'Multi Asset'
  },
  {
    ...propsAll,
    field: 'assetnum',
    headerName: 'Asset'
  },
  {
    ...propsAll,
    field: 'location',
    headerName: 'Location'
  },
  {
    ...propsAll,
    field: 'pelworkcomp',
    headerName: 'Work Complete',
    editable,
    cellEditor: 'booleanEditor',
    cellRenderer: 'cellRendererCheck',
    valueFormatter: valueFormatters.BOOLEAN,
    valueSetter: valueSetters.BOOLEAN
  },
  {
    ...propsAll,
    field: 'pelcompdate',
    headerName: 'Work Complete Date',
    cellEditor: 'dateTimeEditor',
    editable,
    valueFormatter: valueFormatters.DATETIME
  },
  {
    ...propsAll,
    field: 'pelworkoutcome',
    headerName: 'Work Outcome',
    editable,
    cellEditor: 'dropdownEditor',
    headerComponentParams: {
      dropdownKey: 'workoutcomes'
    }
  },
  {
    ...propsAll,
    field: 'pelcompnotes',
    headerName: 'Work Completion Notes',
    editable
  },
  {
    ...propsAll,
    field: 'pelnoncompreason',
    headerName: 'Non-Completion Reason',
    editable,
    cellEditor: 'dropdownEditor',
    headerComponentParams: {
      dropdownKey: 'noncompreasons'
    }
  },
  {
    ...propsAll,
    field: 'lastreading',
    headerName: 'Current Condition'
  },
  {
    ...propsAll,
    field: 'newreading',
    headerName: 'New Condition',
    editable: params => {
      return params?.data?.asset?.[0]?.assetmeter?.[0]?.href ?? false
    },
    cellEditor: 'dropdownEditor',
    headerComponentParams: {
      dropdownKey: 'assetconditions'
    },
    valueSetter: params => intValueSetter(params, 'newreading')
  }
].concat(additionalFieldsAssets)
