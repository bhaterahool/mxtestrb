import { useMaxProp } from '../hooks/useMaxProp'

const CheckDocumentDeleteCapability = currentStatus => {
  const allowedEditDeleteDocumentMaxProp = useMaxProp('pel.mxplus.subcon.allowedEditDeleteDocument')
  return allowedEditDeleteDocumentMaxProp?.maxpropvalue?.propvalue
    ?.split(',')
    ?.includes(currentStatus)
}


export default CheckDocumentDeleteCapability
