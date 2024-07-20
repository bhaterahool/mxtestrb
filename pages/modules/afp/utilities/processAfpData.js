export const processChildData = (data = [], metadata = {}) =>
  data.map(
    ({
      pelafplinedetailid,
      contractlineid,
      contractlinenum,
      description,
      comment,
      orderqty = 1,
      unitcost,
      linecost = 0,
      localref,
      chgqtyonuse,
      chgpriceonuse,
      child_description
    }) => ({
      pelafplinedetailid,
      contractlineid,
      contractlinenum,
      description,
      child_description: child_description || description,
      comment,
      orderqty,
      unitcost,
      linecost,
      metadata: {
        localref,
        editableField: {
          orderqty: chgqtyonuse,
          unitcost: chgpriceonuse
        },
        ...metadata
      }
    })
  )

export const processAfpData = ({
  pelafpline = [],
  afpnum,
  type,
  pelafpid,
  mfaref,
  mfarevisonnum
}) =>
  pelafpline.map(
    ({
      pelafplineid,
      status,
      linecost,
      description,
      comment,
      assignmentid,
      assignment = [{ wonum: undefined }],
      ponum,
      pelafplinedetail,
      pelafplinedetail_collectionref,
      pelpoline,
      poMaximum,
      statusmemo,
      wonum,
      ogStatus,
      pelmfaref
    }) => ({
      pelafplineid,
      pelmfaref,
      status,
      ogStatus: ogStatus || status,
      linecost,
      statusmemo: statusmemo || '',
      description,
      comment,
      assignmentid,
      wonum: wonum || assignment[0]?.wonum,
      ponum,
      children: processChildData(pelafplinedetail, { afpnum }),
      pelpoline,
      metadata: {
        pelafplinedetail_collectionref,
        afpnum,
        type,
        pelafpid,
        mfaref,
        mfarevisonnum,
        poMaximum: pelpoline?.[0].linecost ?? poMaximum
      }
    })
  )
