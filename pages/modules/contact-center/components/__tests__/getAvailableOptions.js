import { getAvailableOptions } from '../ServiceRequestType'
import { UsableRequestTypes } from '../../constants'

describe('getAvailableOptions', () => {
  test('if ORIGRECORDID is empty, then QR/CP/CC is available', () => {
    expect(getAvailableOptions(UsableRequestTypes, {})).toEqual([
      { type: 'RW', label: 'Reactive', enabled: true },
      { type: 'CH', label: 'Chase', enabled: true },
      { type: 'RC', label: 'Recall', enabled: true },
      { type: 'IN', label: 'Information', enabled: true },
      { type: 'QR', label: 'Quote', enabled: true },
      { type: 'CP', label: 'Complaint', enabled: true },
      { type: 'CC', label: 'Compliment', enabled: true }
    ])
  })

  test('if ORIGRECORDID is not empty, then QR/CP/CC is disabled', () => {
    expect(
      getAvailableOptions(UsableRequestTypes, {
        origrecordid: '123456'
      })
    ).toEqual([
      { type: 'RW', label: 'Reactive', enabled: true },
      { type: 'CH', label: 'Chase', enabled: true },
      { type: 'RC', label: 'Recall', enabled: true },
      { type: 'IN', label: 'Information', enabled: true },
      { type: 'QR', label: 'Quote', enabled: false },
      { type: 'CP', label: 'Complaint', enabled: false },
      { type: 'CC', label: 'Compliment', enabled: false }
    ])
  })
})
