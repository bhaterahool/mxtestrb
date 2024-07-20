import { useMaxProp } from '../../hooks/useMaxProp'

const CheckWorkLogDeleteCapability = currentStatus => {
  const allowedDeleteWorkLogMaxProp = useMaxProp('pel.mxplus.subcon.allowedWorkLogDeleteStatus')
  return allowedDeleteWorkLogMaxProp?.maxpropvalue?.propvalue?.split(',')?.includes(currentStatus)
}


export default CheckWorkLogDeleteCapability
