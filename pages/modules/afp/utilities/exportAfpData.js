import XLSX from 'xlsx'

const getLinecostValues = ({ orderqty = 1, unitcost = 0 }) => orderqty * unitcost

const getafpLinesDetail = (type, afpMainDtil, afplines, pelmfaref) => {
  const {
    pelafplinedetailid,
    contractlinenum,
    comment,
    orderqty,
    unitcost,
    description,
    child_description
  } = afplines
  return {
    ...afpMainDtil,
    'Line Detail ID': pelafplinedetailid,
    ...(type === 'SUBAFP' && { 'MFA Reference': pelmfaref }),
    ...(type === 'SUBAFP' && { 'MFA Line No': contractlinenum }),
    ...(type === 'SUBAFP' && { 'Line Description': description || child_description }),
    'Line Notes': comment,
    Qty: orderqty,
    'Unit Cost': unitcost,
    'Detail Line Cost': getLinecostValues(afplines).toFixed(2)
  }
}

const getafpDetail = (type, afpdata) => {
  const {
    assignmentid,
    ponum,
    status,
    pelafplinedetail = [],
    assignment = [],
    description,
    linecost,
    comment,
    wonum,
    pelmfaref = '',
    statusmemo = ''
  } = afpdata

  const afpMainDtil = {
    'Assignment ID': assignmentid,
    'Work Order No': wonum ?? assignment[0]?.wonum,
    PO: ponum,
    'AFP Line Status': status,
    'Status Memo': statusmemo,
    'Assignment Description': description,
    'AFP Line Cost': linecost ?? 0,
    'Assignment Notes': comment
  }

  const afpLineDetails = {
    'Line Detail ID': '',
    ...(type === 'SUBAFP' && { 'MFA Reference': pelmfaref }),
    ...(type === 'SUBAFP' && { 'MFA Line No': '' }),
    ...(type === 'SUBAFP' && { 'Line Description': '' }),
    'Line Notes': '',
    Qty: 0,
    'Unit Cost': 0,
    'Detail Line Cost': 0
  }

  if (pelafplinedetail.length === 0) return [{ ...afpMainDtil, ...afpLineDetails }]

  return pelafplinedetail.map(afplines => getafpLinesDetail(type, afpMainDtil, afplines, pelmfaref))
}

const handleSubAFPDataExport = (type, pelafpline) =>
  pelafpline.reduce((acc, afpdata) => {
    const linedetails = getafpDetail(type, afpdata)
    return [...acc, ...linedetails]
  }, [])

const getListForExport = async afpData => {
  const { pelafpline } = afpData

  const listData = pelafpline?.reduce((afpContractLines, currentRow) => {
    const isContractLinePushed =
      afpContractLines?.length &&
      afpContractLines?.some(
        ({ contractnum, revisionnum }) =>
          contractnum === currentRow?.pelmfaref && revisionnum === currentRow?.pelmfarevisonnum
      )
    return !isContractLinePushed && currentRow?.pelContractLines?.length
      ? afpContractLines.concat(currentRow?.pelContractLines)
      : afpContractLines
  }, [])

  return listData.map(
    ({
      contractnum,
      revisionnum,
      contractlineid,
      contractlinenum,
      description,
      remark,
      enterdate,
      chgqtyonuse,
      chgpriceonuse,
      orderunit,
      unitcost,
      orderqty,
      linecost
    }) => ({
      'MFA Line Num': contractlinenum,
      'MFA Reference': contractnum,
      'Revision Number': revisionnum,
      'MFA Line ID': contractlineid,
      'MFA Line Description': description,
      Remark: remark,
      'Enter date': enterdate,
      'Change Qty': chgqtyonuse,
      'Change Price': chgpriceonuse,
      'Order Unit': orderunit,
      'Unit Cost': unitcost,
      'Order Qty': orderqty,
      'Line Cost': linecost
    })
  )
}

const exportToExcel = (type, label, afplines, contractline) => {
  const afpLinesWorksheet = XLSX.utils.json_to_sheet(afplines)
  const contractLinesWorksheet = type === 'SUBAFP' && XLSX.utils.json_to_sheet(contractline)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, afpLinesWorksheet, 'AFP Lines')
  if (contractLinesWorksheet) {
    XLSX.utils.book_append_sheet(workbook, contractLinesWorksheet, 'Contract list')
  }
  XLSX.writeFile(workbook, `${label}.xlsx`)
}

export const exportAfpData = async (afpData, label) => {
  const { pelafpline, type } = afpData
  if (!pelafpline) {
    return false
  }

  const afplines = handleSubAFPDataExport(type, pelafpline).map(row => {
    
    delete row['AFP Line Cost'] 
    delete row['Detail Line Cost'] 
    return row
  })

  if (type === 'SUBAFP') {
    const contractline = await getListForExport(afpData)
    exportToExcel(type, label, afplines, contractline)
  } else {
    exportToExcel(type, label, afplines, [])
  }
}
