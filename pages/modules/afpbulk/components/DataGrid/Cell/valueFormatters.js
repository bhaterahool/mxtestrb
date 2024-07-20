import { format, isValid } from 'date-fns'
import { compareEmptyNullUndef } from '../../../../../shared/grid/grid'
import { COMMIT_FAIL, COMMIT_SUCCESS } from '../../../../../shared/grid/constants'

export const getRenderClass = ({ data, colDef }) => {
  const { field } = colDef
  const classDisabled = data.locked ? 'afpbulk__col_disabled' : ''
  const classCommitted =
    data.committed === COMMIT_SUCCESS && data.edited.indexOf(field) !== -1
      ? 'afpbulk__col_change_committed'
      : ''
  const classError =
    field === 'error' || (data.committed === COMMIT_FAIL && field === 'committed')
      ? 'afpbulk__col_error'
      : ''

  return `${classCommitted} ${classDisabled} ${classError}`
}

export const numberFormatter = ({ value }) => value && Number(value)

export const valueFormatters = {
  BOOLEAN: params => Boolean(compareEmptyNullUndef(params.valueFormatted, params.value)),
  DATETIME: params => {
    const value = compareEmptyNullUndef(params.valueFormatted, params.value)
    const dt = value ? new Date(value) : ''
    return dt && isValid(dt) ? format(dt, "dd-MM-yyyy' 'HH:mm:ss") : ''
  }
}
