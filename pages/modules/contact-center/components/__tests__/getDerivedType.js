import moment from 'moment'
import { getDerivedType } from '../ExistingRefInput'

describe('getDerivedType', () => {
  test('if the Existing SR is an "Open" SR, then the derived type will be "CH" (Chase)', () => {
    const statuses = [
      {
        maxvalue: 'NEW',
        description: 'Waiting for Approval',
        value: 'WAPPR'
      },
      {
        maxvalue: 'INPRG',
        description: 'Waiting for client Approval',
        value: 'WCLIENTAPPR'
      },
      {
        maxvalue: 'INPRG',
        description: 'Waiting to be Scheduled',
        value: 'WSCHEDULE'
      },
      {
        maxvalue: 'NEW',
        description: 'New',
        value: 'NEW'
      }
    ]

    expect(getDerivedType({ status: 'WAPPR' }, statuses)).toEqual('CH')
    expect(getDerivedType({ status: 'WSCHEDULE' }, statuses)).toEqual('CH')
  })

  test('if recently completed within the recall period then the derived type will be "RC"', () => {
    const actualfinish = moment().subtract(24, 'hours')

    const sr = {
      actualfinish: actualfinish.toISOString(),
      pluspagreement: [
        {
          pelrecallperiod: 48.0
        }
      ]
    }

    expect(getDerivedType(sr)).toEqual('RC')
  })

  test('if completed beyond the recall period then the derived type will be "RW"', () => {
    const actualfinish = moment().subtract(36, 'hours')

    const sr = {
      actualfinish: actualfinish.toISOString(),
      pluspagreement: [
        {
          pelrecallperiod: 24.0
        }
      ]
    }

    expect(getDerivedType(sr)).toEqual('RW')
  })

  test('if given a falsey value it should default to "RW"', () => {
    expect(getDerivedType()).toEqual('RW')
  })
})
