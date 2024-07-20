import { useMaxProp } from '../../../../shared/hooks/useMaxProp'

const checkFailureEditingCapability = currentStatus => {
  const allowedFailureEditMaxProp = useMaxProp('pel.mxplus.subcon.allowededitfailure')
  return allowedFailureEditMaxProp?.maxpropvalue?.propvalue?.split(',')?.includes(currentStatus)
}


export default checkFailureEditingCapability
