import { useMaxProp } from '../../../shared/hooks/useMaxProp'

export const wopricingSearchStatus = () => {
  const allowedWOPSearchStatusMaxProp = useMaxProp('pel.mxplus.wop.allowedsearchstatus')
  return allowedWOPSearchStatusMaxProp?.maxpropvalue?.propvalue
    ?.split(',')
    ?.map(status => ({ id: status, text: status, defaultSelected: status === 'MANBILL' }))
}
