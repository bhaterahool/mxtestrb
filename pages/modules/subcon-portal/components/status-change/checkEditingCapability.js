import { useMaxProp } from '../../../../shared/hooks/useMaxProp'

const checkEditingCapability = currentStatus => {
  const allowedEditStatusMaxProp = useMaxProp('pel.mxplus.subcon.alloweditstatus')
  return allowedEditStatusMaxProp?.maxpropvalue?.propvalue?.split(',')?.includes(currentStatus)
}


export default checkEditingCapability
