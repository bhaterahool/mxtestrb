import { useMaxProp } from '../../hooks/useMaxProp'

const CheckAttendanceEditCapability = currentStatus => {
  const allowedEditAttendanceMaxProp = useMaxProp('pel.mxplus.subcon.allowededitattendance')
  return allowedEditAttendanceMaxProp?.maxpropvalue?.propvalue?.split(',')?.includes(currentStatus)
}


export default CheckAttendanceEditCapability
