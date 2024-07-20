export const checkSRtypeCondition = (
  srtype,
  srTypesCondition,
  isleafSelected,
  isBranchSelected
) => {
  const [filteredSR] = srTypesCondition?.filter(sr => sr?.srtype === srtype)

  switch (filteredSR?.alnvalue) {
    case 'LEAF':
      return isleafSelected
    case 'NA':
      return true
    case 'BRANCH':
      return isBranchSelected
    default:
      return false
  }
}
