import { initState, reducer, createWorkGroup, updateRowAssignments } from './grid-reducer'
import { mockAssignments } from '../services/mockAssignments'

let result
let groupId
const strDate = '2021-12-30T00:00:00+00:00'

describe('grid-reducer ', () => {
  describe('onload', () => {
    it('groupedTableData contains', () => {
      expect(initState).toMatchObject({
        groupedTableData: {},
        gridOverwrite: null, 
        gridAddWorkGroup: null, 
        postRowUpdatesAssignments: [], 
        postRowUpdatesAssets: [], 
        gridRowRemove: null, 
        isResetStatusesSelection: false,
        dropdowns: {
          statuses: [],
          workoutcomes: [],
          noncompreason: []
        }
      })
    })
  })
  describe('Create status item', () => {
    beforeAll(() => {
      groupId = 'SUBACCEPT'
      const mockMembers = mockAssignments(groupId)
      result = reducer(
        initState,
        createWorkGroup({
          groupId,
          groupName: 'SUBACCEPT',
          member: mockMembers
        })
      )
    })
    it('should create status item with tableDataAssignments ', () => {
      const rowData = {
        href: 'https://ukd-mitmx76-05.peluk.org/maximo/oslc/os/pelassignment/_MTk1NTM1NzI-',
        assignmentid: 19553572,
        ticketid: 'llll',
        wonum: 'LN21314619',
        wohref: 'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvVUsvTE4yMTMxNDYxOQ--',
        pluspcustomer: 'ADIDAS0001',
        pellocbuilding: 'ADIDAS - BRIDGEND - 8603 - MBFO',
        status: 'SUBACCEPT',
        pelstatusdate: '2021-09-10T10:42:20.585Z',
        pelassignstart: '2021-09-11T11:42:20.585Z',
        pelassignfinish: '2021-09-12T12:42:20.585Z',
        failurecode: 'HINTRCOM',
        failurereportProblem: 'PWIREEXP',
        failurereportCause: 'CCNTFAUL',
        failurereportRemedy: 'RREPLACD',
        failurereportProblemHref:
          'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvRkFJTFVSRVJFUE9SVC8yOTQ-',
        failurereportCauseHref:
          'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvRkFJTFVSRVJFUE9SVC8yOTU-',
        failurereportRemedyHref:
          'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvRkFJTFVSRVJFUE9SVC8yOTY-',
        groupId: 'SUBACCEPT',
        edited: [],
        committed: '',
        error: '',
        unhiddenColumn: ''
      }
      expect(result.groupedTableData[groupId].tableDataAssignments).toMatchObject([rowData])
    })
    it('should create status item with tableDataAssets', () => {
      expect(result.groupedTableData[groupId].tableDataAssets).toMatchObject([
        {
          href: 'http://childkey#QVNTSUdOTUVOVC9XT1JLT1JERVIvTVVMVElBU1NFVExPQ0NJLzEwNzgzMjU2NA--',
          assignmentid: 19553572,
          wonum: 'LN21314619',
          multiid: 107832564,
          assetnum: '4568161',
          location: '813596',
          pelworkcomp: true,
          pelcompdate: '2021-08-12T10:14:44+01:00',
          pelworkoutcome: 'WAITRESULTS',
          pelcompnotes: undefined,
          pelnoncompreason: 'NOTFOUND',
          groupId: 'SUBACCEPT',
          edited: [],
          unhiddenColumn: ''
        }
      ])
    })
    describe('Update row', () => {
      it('should update row with - status - and populated edited array', () => {
        const rowData = result.groupedTableData[groupId]?.tableDataAssignments[0]
        result = reducer(
          result,
          updateRowAssignments({ rowData: { ...rowData, status: 'NEWSTATUS' } })
        )
        expect(result.groupedTableData[groupId].tableDataAssignments).toMatchObject([
          { ...rowData, status: 'NEWSTATUS', edited: ['status'] }
        ])
      })
      it('should update row with - and append to edited array (keeping previous edited items', () => {
        const rowData = result.groupedTableData[groupId]?.tableDataAssignments[0]
        result = reducer(
          result,
          updateRowAssignments({
            rowData: {
              ...rowData,
              pelstatusdate: strDate,
              pelassignstart: strDate,
              pelassignfinish: strDate
            }
          })
        )
        expect(result.groupedTableData[groupId].tableDataAssignments).toMatchObject([
          {
            ...rowData,
            pelstatusdate: strDate,
            pelassignstart: strDate,
            pelassignfinish: strDate,
            edited: ['status', 'pelstatusdate', 'pelassignstart', 'pelassignfinish']
          }
        ])
      })
    })
  })
})
