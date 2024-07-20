const getStatusOptions = currentStatus => {
  switch (currentStatus) {
    case 'SUBDISPATCH':
      return ['SUBACCEPT', 'SUBRETURNED']

    case 'SUBWNOTIFY':
      return ['SUBRETURNED', 'SUBACCEPT']

    case 'SUBACCEPT':
    case 'SUBPREDOCS':
      return ['SUBINPRG']

    case 'SUBINPRG':
      return ['SUBFINISH']

    case 'SUBWDOCS':
      return ['SUBENGCOMP']

    default:
      return []
  }
}


export default getStatusOptions
