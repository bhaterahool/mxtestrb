export const AFP_STATUS = {
  draft: 'DRAFT',
  new: 'NEW',
  query: 'QUERY',
  submitted: 'SUBMITTED',
  approved: 'APPROVED',
  closed: 'CLOSED'
}
export const AFP_TYPES = ['SUBAFP', 'SUBPO']
export const DEFAULT_TYPE = 'SUBAFP'

export const sortChangeDate = dates =>
  dates
    .filter(({ status }) => status === AFP_STATUS.submitted)
    .sort((a, b) => a.changedate.localeCompare(b.changedate))

export const getAfpStatusOpts = (status, linesAbovepo = false) => {
  switch (status) {
    case AFP_STATUS.draft:
      return [
        {
          text: AFP_STATUS.new,
          value: AFP_STATUS.new
        }
      ]
    case AFP_STATUS.query:
    case AFP_STATUS.new:
      return [
        {
          text: status,
          value: status
        },
        {
          text: AFP_STATUS.submitted,
          value: AFP_STATUS.submitted,
          disabled: linesAbovepo
        }
      ]

    default:
      return [
        {
          text: status,
          value: status
        }
      ]
  }
}

export const mapInitValues = ({
  afpnum,
  status,
  startdate,
  enddate,
  siteid,
  pelbusunit,
  type = DEFAULT_TYPE,
  mfaref = '',
  mfarevisonnum = '',
  description = ''
}) => ({
  type,
  siteid,
  enddate,
  startdate,
  pelbusunit,
  description,
  mfaref,
  mfarevisonnum,
  status: afpnum ? status : AFP_STATUS.new
})
