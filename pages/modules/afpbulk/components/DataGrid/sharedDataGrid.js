import { cloneObj } from '../../../../util/clone'
import { BooleanEditor } from './Cell/BooleanEditor'
import { CellRendererDefault } from './Cell/CellRendererDefault'
import { CellRendererCheck } from './Cell/CellRendererCheck'
import { DateTimeEditor } from './Cell/DateTimeEditor'
import { DropdownEditor } from './Cell/DropdownEditor'

export { DateTimeEditor, DropdownEditor }

export const frameworkComponents = {
  cellRendererDefault: CellRendererDefault,
  dateTimeEditor: DateTimeEditor,
  dropdownEditor: DropdownEditor,
  booleanEditor: BooleanEditor,
  cellRendererCheck: CellRendererCheck
}

export const getPostRowChanges = ({ postRowUpdates, tableDataName, groupedTableData, key }) =>
  postRowUpdates.map(
    row =>
      cloneObj(groupedTableData[row.groupId][tableDataName].find(item => item[key] === Number(row[key])))
    
    
  )
