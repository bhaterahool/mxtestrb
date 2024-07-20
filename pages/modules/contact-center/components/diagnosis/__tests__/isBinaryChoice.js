import { isBinaryChoice } from '../ClassAttributesList'

describe('isBinaryChoice', () => {
  test('resolves PELMETAQUES with yes no values as binary', () => {
    expect(
      isBinaryChoice({
        assetattribute: [{ domainid: 'PELMETAQUES' }],
        pelmetadata: [
          { description: 'YES', value: 'YES' },
          { description: 'NO', value: 'NO' }
        ]
      })
    ).toBe(true)

    expect(
      isBinaryChoice({
        assetattribute: [{ domainid: 'PELMETAQUES' }],
        pelmetadata: [
          { description: 'NO', value: 'NO' },
          { description: 'YES', value: 'YES' }
        ]
      })
    ).toBe(true)
  })
})
