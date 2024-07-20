import { useMaxProp } from '../hooks/useMaxProp'

const CheckDocumentDeleteCapabilityOnPrestart = currentStatus => {
  const allowedEditDeleteDocumentOnPrestartMaxProp = useMaxProp(
    'pel.mxplus.subcon.allowedEditDeleteDocOnPrestart'
  )
  return allowedEditDeleteDocumentOnPrestartMaxProp?.maxpropvalue?.propvalue
    ?.split(',')
    ?.includes(currentStatus)
}


export default CheckDocumentDeleteCapabilityOnPrestart
