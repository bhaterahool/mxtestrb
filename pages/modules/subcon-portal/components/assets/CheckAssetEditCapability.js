import { useMaxProp } from '../../../../shared/hooks/useMaxProp'

const CheckAssetEditCapability = currentStatus => {
  const allowedEditMultiAssetMaxProp = useMaxProp('pel.mxplus.subcon.allowededitmultiasset')
  return allowedEditMultiAssetMaxProp?.maxpropvalue?.propvalue?.split(',')?.includes(currentStatus)
}


export default CheckAssetEditCapability
