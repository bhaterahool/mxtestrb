import { useMaxProp } from '../hooks/useMaxProp'

const CheckDocumentNonProvidedReason = currentStatus => {
  const allowedDocumentNonProvidedReasonMaxProp = useMaxProp(
    'pel.mxplus.subcon.allowedDocumentNotProvidedReason'
  )
  return allowedDocumentNonProvidedReasonMaxProp?.maxpropvalue?.propvalue
    ?.split(',')
    ?.includes(currentStatus)
}


export default CheckDocumentNonProvidedReason
