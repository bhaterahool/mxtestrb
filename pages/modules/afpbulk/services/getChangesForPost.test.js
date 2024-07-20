import {
  diffChange,
  populateKeyValues,
  getAssignmentEdits,
  getFailureReport,
  getMultiEdits,
  getEditedRowPropChanges
} from './getChangesForPost'

let result

const tableDataAssignmentRow = {
  href: 'https://ukd-mitmx76-05.peluk.org/maximo/oslc/os/pelassignment/_MTk1NDk3MTA-',
  assignmentid: 19549710,
  ticketid: '2990758',
  wonum: 'LN21310730',
  pluspcustomer: 'ADIDAS0001',
  pellocbuilding: 'ADIDAS - BRIDGEND - 8603 - MBFO',
  status: 'SUBACCEPT',
  pelstatusdate: '2021-01-01T00:00:00+00:00',
  pelassignstart: '2021-09-15T12:12:01+01:00',
  pelassignfinish: '2021-12-15T11:12:01+00:00',
  failurecode: 'HMOBILEP', 
  failurereportProblem: 'PWIREEXP', 
  failurereportCause: 'CCNTFAUL',
  failurereportRemedy: 'RREPLACD',
  failurereportProblemHref: 'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvRkFJTFVSRVJFUE9SVC8yOTQ-',
  failurereportCauseHref: 'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvRkFJTFVSRVJFUE9SVC8yOTU-',
  failurereportRemedyHref: 'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvRkFJTFVSRVJFUE9SVC8yOTY-',
  groupId: 'SUBACCEPT',
  edited: [],
  committed: '',
  error: '',
  unhiddenColumn: '',
  wohref: 'http:
}

const otherStuffNotToBePosted = 'hello world'

const multiEdited = ['pelworkcomp', 'pelnoncompreason', 'pelworkoutcome', 'pelcompdate']
const pelcompdate = '2021-09-15T11:12:01.000Z'
const pelworkcomp = 'false'
const pelworkoutcome = 'SUPERSEDED'
const pelnoncompreason = 'NOTFOUND'

const firstMultiAssetHref =
  'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvTVVMVElBU1NFVExPQ0NJLzEwNzgyNDM2Mw--'

const groupedTableData = {
  SUBACCEPT: {
    groupName: 'SUBACCEPT',
    tableDataAssignments: [tableDataAssignmentRow],
    tableDataAssets: [
      {
        href: firstMultiAssetHref,
        assignmentid: 19549710,
        wonum: 'LN21310730',
        multiid: 107824363,
        assetnum: '',
        location: '813599',
        pelworkcomp,
        pelcompdate,
        pelcompnotes: '',
        pelworkoutcome,
        pelnoncompreason,
        groupId: 'SUBACCEPT',
        unhiddenColumn: '',
        edited: multiEdited
      },
      {
        href: 'http:
        assignmentid: 19549738,
        wonum: 'LN21310756',
        multiid: 107824442,
        assetnum: '',
        location: '813600',
        pelworkcomp: 'false',
        pelcompdate: '',
        pelcompnotes: '',
        pelworkoutcome: '',
        pelnoncompreason: '',
        groupId: 'SUBACCEPT',
        edited: [],
        unhiddenColumn: ''
      }
    ]
  }
}

describe('afpbulk', () => {
  describe('diffChange and populateKeyValues', () => {
    it('should only return the keys with the different values (excluding 3rd default parameter - "edited")', () => {
      const result = diffChange(
        { edited: ['whatever'], x: 1, y: 2, z: 3 },
        { edited: ['changed'], x: 2, y: 2, z: 3 }
      )
      expect(result).toEqual(['x'])
    })
    it('should only populateKeyValues properties from the keys array', () => {
      const result = populateKeyValues({ row: { x: 2, y: 2, z: 3 }, keys: ['x'] })
      expect(result).toEqual({ x: 2 })
    })
  })
  describe('getAssignmentEdits', () => {
    it('should only return pelstatusdate', () => {
      const pelstatusdate = '2001-01-26'
      expect(getAssignmentEdits({ pelstatusdate })).toMatchObject({ pelstatusdate })
    })
    it('should only return:  pelstatusdate, pelassignfinish, state', () => {
      const pelassignstart = '2001-01-26'
      const pelassignfinish = '2001-01-27'
      const status = 'SUBSOMETHINGELSE'
      expect(getAssignmentEdits({ pelassignstart, pelassignfinish, status })).toMatchObject({
        pelassignstart,
        pelassignfinish,
        status
      })
    })
    it('should not return with unspecific items', () => {
      const shouldnotexist = '2001-01-26'
      expect(getAssignmentEdits({ shouldnotexist })).toEqual({})
    })
  })

  describe('getFailureReport', () => {
    it('should only return failureReport array', () => {
      const failurereportProblem = 1
      const failurereportCause = 2
      const failurereportRemedy = 3
      const failurereportProblemHref = '1'
      const failurereportCauseHref = '2'
      const failurereportRemedyHref = '3'

      expect(
        getFailureReport({
          failurereportProblem,
          failurereportCause,
          failurereportRemedy,
          failurereportProblemHref,
          failurereportCauseHref,
          failurereportRemedyHref
        })
      ).toMatchObject([
        {
          href: failurereportProblemHref,
          failurecode: failurereportProblem
        },
        {
          href: failurereportCauseHref,
          failurecode: failurereportCause
        },
        {
          href: failurereportRemedyHref,
          failurecode: failurereportRemedy
        }
      ])
    })
  })

  describe('getMultiEdits', () => {
    it('should return multi as array', () => {
      const result = getMultiEdits({
        groupedTableData,
        edited: ['multiassetlocci'],
        groupId: 'SUBACCEPT',
        assignmentid: 19549710
      })
      const expected = [
        {
          pelworkcomp: false,
          href: firstMultiAssetHref,
          pelnoncompreason,
          pelworkoutcome,
          pelcompdate: new Date('2021-09-15T12:12:01+01:00').toISOString()
        }
      ]
      expect(result).toMatchObject(expected)
    })
  })
  describe('getEditedRowPropChanges', () => {
    it('should only change - status and multiassetlocci', () => {
      const row = {
        ...tableDataAssignmentRow,
        status: 'SUBINPRG',
        edited: ['status', 'multiassetlocci']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            multiassetlocci: [
              {
                pelworkcomp: false,
                href: firstMultiAssetHref,
                pelnoncompreason,
                pelworkoutcome,
                pelcompdate: new Date('2021-09-15T12:12:01+01:00').toISOString()
              }
            ],
            href: tableDataAssignmentRow.wohref
          }
        ],
        status: 'SUBINPRG'
      })
    })
    it('should only change - pelstatusdate', () => {
      const row = {
        ...tableDataAssignmentRow,
        otherStuffNotToBePosted,
        pelstatusdate: 'new',
        edited: ['pelstatusdate']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        pelstatusdate: 'new'
      })
    })
    it('should only change - pelassignstart', () => {
      const row = {
        ...tableDataAssignmentRow,
        otherStuffNotToBePosted,
        pelassignstart: 'new',
        edited: ['pelassignstart']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        pelassignstart: 'new'
      })
    })
    it('should only change - pelassignfinish', () => {
      const row = {
        ...tableDataAssignmentRow,
        otherStuffNotToBePosted,
        pelassignfinish: 'new',
        edited: ['pelassignfinish']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        pelassignfinish: 'new'
      })
    })
    it('should only change - failurecode', () => {
      const row = {
        ...tableDataAssignmentRow,
        otherStuffNotToBePosted,
        failurecode: 'new',
        edited: ['failurecode']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [{ failurecode: 'new', href: tableDataAssignmentRow.wohref }]
      })
    })
    it('should only change - failurereport - problem', () => {
      const row = {
        ...tableDataAssignmentRow,
        otherStuffNotToBePosted,
        failurereportProblem: 'new',
        edited: ['failurereportProblem']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            failurereport: [
              {
                href: tableDataAssignmentRow.failurereportProblemHref,
                failurecode: 'new'
              }
            ],

            href: tableDataAssignmentRow.wohref
          }
        ]
      })
    })
  })

  describe('getEditedRowPropChanges', () => {
    it('should provide all listed in edited', () => {
      const row = {
        ...tableDataAssignmentRow,
        edited: [
          'status',
          'pelstatusdate',
          'pelassignstart',
          'pelassignfinish',
          'failurecode',
          'failurereportProblem',
          'failurereportCause',
          'failurereportRemedy'
        ]
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            failurecode: tableDataAssignmentRow.failurecode,
            failurereport: [
              {
                href: tableDataAssignmentRow.failurereportProblemHref,
                failurecode: tableDataAssignmentRow.failurereportProblem
              },
              {
                href: tableDataAssignmentRow.failurereportCauseHref,
                failurecode: tableDataAssignmentRow.failurereportCause
              },
              {
                href: tableDataAssignmentRow.failurereportRemedyHref,
                failurecode: tableDataAssignmentRow.failurereportRemedy
              }
            ],
            href: tableDataAssignmentRow.wohref
          }
        ],
        status: tableDataAssignmentRow.status,
        pelstatusdate: tableDataAssignmentRow.pelstatusdate,
        pelassignstart: tableDataAssignmentRow.pelassignstart,
        pelassignfinish: tableDataAssignmentRow.pelassignfinish
      })
    })
  })

  describe('getEditedRowPropChanges', () => {
    it('should populate failure report - without href', () => {
      const row = {
        ...tableDataAssignmentRow,
        failurereportProblemHref: '',
        failurereportCauseHref: '',
        failurereportRemedyHref: '',
        edited: ['failurereportProblem', 'failurereportCause', 'failurereportRemedy']
      }
      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            failurereport: [
              {
                failurecode: tableDataAssignmentRow.failurereportProblem
              },
              {
                failurecode: tableDataAssignmentRow.failurereportCause
              },
              {
                failurecode: tableDataAssignmentRow.failurereportRemedy
              }
            ],
            href: tableDataAssignmentRow.wohref
          }
        ]
      })
    })
  })

  describe('troubleshoot BMXAA4534E ', () => {
    it('should provide post without - failurereportProblemHref', () => {
      const row = {
        ...tableDataAssignmentRow,
        pelassignstart: '2021-10-15T12:21:00.000+01:00',
        failurereportProblem: 't2', 
        failurereportProblemHref: '', // overwriting as an empty value, so should not send...
        pelworkcomp: false, // should this be string ?
        edited: ['pelassignstart', 'failurereportProblem', 'multiassetlocci', 'pelworkcomp']
      }

      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            failurereport: [
              {
                failurecode: 't2'
                
              }
            ],
            multiassetlocci: [
              {
                pelworkcomp: false,
                href: firstMultiAssetHref
              }
            ],
            href: 'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvVUsvTE4yMTMxMDczMA--'
          }
        ],
        pelassignstart: '2021-10-15T12:21:00.000+01:00'
      })
    })
  })
  describe('troubleshoot should post values if set explicitly as empty ', () => {
    it('should provide post without - empty values for all set', () => {
      const row = {
        ...tableDataAssignmentRow,
        edited: [
          'status',
          'pelstatusdate',
          'pelassignstart',
          'pelassignfinish',
          'failurecode',
          'failurereportProblem',
          'failurereportCause',
          'failurereportRemedy'
        ],
        status: '',
        pelstatusdate: '',
        pelassignstart: '',
        pelassignfinish: '',
        failurecode: '',
        failurereportProblem: '',
        failurereportCause: '',
        failurereportRemedy: '',

        // empty to simplify post
        failurereportProblemHref: '',
        failurereportCauseHref: '',
        failurereportRemedyHref: ''
      }

      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            failurereport: [
              {
                failurecode: ''
              },
              {
                failurecode: ''
              },
              {
                failurecode: ''
              }
            ],
            href: tableDataAssignmentRow.wohref
          }
        ],
        status: '',
        pelstatusdate: '',
        pelassignstart: '',
        pelassignfinish: ''
      })
    })
  })
  describe('troubleshoot should ADD additional property of: pelaction:999 if STATUS set to SUBFINISH ', () => {
    it('should provide post with extra property', () => {
      const row = {
        ...tableDataAssignmentRow,
        edited: ['status', 'multiassetlocci', 'pelworkcomp'],
        status: 'SUBFINISH',
        pelworkcomp: true
      }

      expect(getEditedRowPropChanges({ row, groupedTableData })).toMatchObject({
        workorder: [
          {
            multiassetlocci: [
              {
                pelworkcomp: true,
                href: firstMultiAssetHref
              }
            ],
            href: tableDataAssignmentRow.wohref
          }
        ],
        status: 'SUBFINISH',
        pelaction: 999
      })
    })
  })
})
