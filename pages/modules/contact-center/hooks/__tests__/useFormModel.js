import { renderHook } from '@testing-library/react-hooks'
import { act, reactTestRender } from 'react-test-renderer'
import { useFormModel, defaultValues } from '../useFormModel'


jest.mock('../../search/SearchProvider')

describe('pluspcustomer', () => {
  test('setting pluspcustomer should reset: reportedby, building, location, asset, affectedby', () => {
    const { result } = renderHook(() =>
      useFormModel({
        reportedby: 'test person',
        pellocbuilding: 'test building',
        location: 'test location',
        assetnum: 'test asset',
        assetDesc: 'asset description',
        affectedperson: 'test person',
        affectedemail: 'hello@non-existent-email',
        affectedphone: '010201',
        origrecordid: '1234566',
        origrecordclass: 'SR'
      })
    )

    act(() => {
      result.current.setCustomer({
        customer: 'customer',
        name: 'customer name'
      })
    })

    const { form } = result.current

    expect(form.pluspcustomer).toEqual([
      {
        customer: 'customer',
        name: 'customer name'
      }
    ])
    expect(form.reportedby).toEqual('')
    expect(form.pellocbuilding).toEqual('')
    expect(form.buildingDesc).toEqual('')
    expect(form.location).toEqual('')
    expect(form.assetnum).toEqual('')
    expect(form.assetDesc).toEqual('')
    expect(form.affectedperson).toEqual('')
    expect(form.affectedphone).toEqual('')
    expect(form.affectedemail).toEqual('')
    expect(form.origrecordid).toEqual('')
    expect(form.origrecordclass).toEqual('')
  })

  test('setting pluspcustomer with an empty string should not set an empty customer value', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setCustomer('')
    })

    expect(result.current.form.pluspcustomer).toEqual('')
  })
})

describe('reportedBy', () => {
  test('setting reportedby without a customer does not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setReportedBy({
        personid: 'TERESA GREEN'
      })
    })

    const { form } = result.current

    expect(form.reportedby).toEqual('TERESA GREEN')
  })

  test('setting reportedby with a customer should set pluspcustomer', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setReportedBy({
        personid: 'TERESA GREEN',
        pluspcustcontact: [
          {
            pluspcustcontact: [
              {
                name: 'CUSTOMER NAME'
              }
            ],
            customer: 'CUSTOMER'
          }
        ]
      })
    })

    expect(result.current.form.pluspcustomer).toEqual([
      { customer: 'CUSTOMER', name: 'CUSTOMER NAME' }
    ])
  })

  test('setting reportedby should set email, phone', () => {
    const { result } = renderHook(() =>
      useFormModel({
        primaryemail: 'dont-use-this@non-existent-email',
        primaryphone: '98765 123 123'
      })
    )

    act(() => {
      result.current.setReportedBy({
        personid: 'TERESA GREEN',
        primaryemail: 'theresa.green@non-existent-email',
        primaryphone: '01234 567 891'
      })
    })

    const { form } = result.current

    expect(form.reportedemail).toEqual('theresa.green@non-existent-email')
    expect(form.reportedphone).toEqual('01234 567 891')
  })

  test('setting reported by with pelocpclookup sets the building', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setReportedBy({
        personid: 'TERESA GREEN',
        primaryemail: 'theresa.green@non-existent-email',
        primaryphone: '01234 567 891',
        pellocpclookup: {
          builddesc: '30 QUEENSFERRY ROAD',
          building: '1000421'
        }
      })
    })

    const { form } = result.current

    expect(form.pellocbuilding).toEqual('1000421')
    expect(form.buildingDesc).toEqual('30 QUEENSFERRY ROAD')
    expect(form.location).toEqual('')
  })
})

describe('building', () => {
  test('setting building without a customer should not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setBuilding({
        pellocpclookup: {
          builddesc: 'CIRRUS BUILDING',
          building: '1000277'
        }
      })
    })

    expect(result.current.form.pellocbuilding).toEqual('1000277')
    expect(result.current.form.buildingDesc).toEqual('CIRRUS BUILDING')
  })

  test('setting building to falsey should not throw an error', () => {
    const { result } = renderHook(() =>
      useFormModel({
        pellocbuilding: 'Test Building'
      })
    )

    act(() => {
      result.current.setBuilding('')
    })

    expect(result.current.form.pellocbuilding).toEqual('')
  })

  test('setting building with a customer should set pluspcustomer', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setBuilding({
        pellocpclookup: {
          builddesc: 'CIRRUS BUILDING',
          building: '1000277'
        },
        pluspprimarycust: {
          name: 'LOGANAIR',
          customer: 'LOGANAIR00'
        }
      })
    })

    const { form } = result.current

    expect(form.pluspcustomer).toEqual([
      {
        name: 'LOGANAIR',
        customer: 'LOGANAIR00'
      }
    ])
  })

  test('setting building with a location already set, should reset location', () => {
    const { result } = renderHook(() =>
      useFormModel({
        location: '1000000',
        locationDesc: 'Test Location'
      })
    )

    act(() => {
      result.current.setBuilding({
        pellocpclookup: {
          builddesc: 'CIRRUS BUILDING',
          building: '1000277'
        }
      })
    })

    expect(result.current.form.location).toEqual('')
    expect(result.current.form.locationDesc).toEqual('')
  })
})

describe('location', () => {
  test('setting location should not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setLocation({
        location: '1000000',
        description: 'Test Location'
      })
    })

    expect(result.current.form.location).toEqual('1000000')
    expect(result.current.form.locationDesc).toEqual('Test Location')
  })

  test('setting location with a pellocpclookup should set the building', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setLocation({
        location: '1000000',
        description: 'Test Location',
        pellocpclookup: {
          builddesc: 'CIRRUS BUILDING',
          building: '1000277'
        }
      })
    })

    const { form } = result.current

    expect(form.location).toEqual('1000000')
    expect(form.locationDesc).toEqual('Test Location')
    expect(form.pellocbuilding).toEqual('1000277')
    expect(form.buildingDesc).toEqual('CIRRUS BUILDING')
  })

  test('setting location with a pellocfull should set siteid', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setLocation({
        pellocpclookup: {
          builddesc: '1 THE LEAS',
          building: '1246147'
        },
        description: 'TANK ROOM',
        siteid: 'UK',
        location: '302273',
        pluspprimarycust: {
          name: 'BBC Worldwide',
          customer: 'BBCW'
        }
      })
    })

    expect(result.current.form.siteid).toEqual('UK')
  })

  test('setting location with a pellocchild should set siteid', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setLocation({
        _rowstamp: '7565758010',
        systemid: 'OPSERV',
        ancestor: '1246147',
        location: '302273',
        pelchildloc: {
          description: 'TANK ROOM',
          siteid: 'UK',
          type: 'ROOM',
          type_description: 'Room'
        }
      })
    })

    expect(result.current.form.siteid).toEqual('UK')
  })

  test('setting location with a customer should set pluspcustomer', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setLocation({
        location: '1000000',
        description: 'Test Location',
        pellocpclookup: {
          builddesc: 'CIRRUS BUILDING',
          building: '1000277'
        },
        pluspprimarycust: {
          name: 'LOGANAIR',
          customer: 'LOGANAIR00'
        }
      })
    })

    const { form } = result.current

    expect(form.pluspcustomer).toEqual([
      {
        name: 'LOGANAIR',
        customer: 'LOGANAIR00'
      }
    ])
  })

  test('setting location to falsey should not throw an error', () => {
    const { result } = renderHook(() =>
      useFormModel({
        location: 'Test location'
      })
    )

    act(() => {
      result.current.setLocation('')
    })

    expect(result.current.form.location).toEqual('')
  })
})

describe('asset', () => {
  test('setting asset should not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setAsset({
        assetnum: '4320462',
        description: 'A/C-Heat Pump Split System-All System'
      })
    })

    expect(result.current.form.assetnum).toEqual('4320462')
    expect(result.current.form.assetDesc).toEqual('A/C-Heat Pump Split System-All System')
  })
})

describe('affectedby', () => {
  test('setting affectedby does not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setAffectedBy({
        personid: 'TERESA GREEN'
      })
    })

    expect(result.current.form.affectedperson).toEqual('TERESA GREEN')
  })

  test('setting affectedby should set email, phone', () => {
    const { result } = renderHook(() =>
      useFormModel({
        affectedemail: 'dont-use-this@non-existent-email',
        affectedphone: '98765 123 123'
      })
    )

    act(() => {
      result.current.setAffectedBy({
        personid: 'TERESA GREEN',
        primaryemail: 'theresa.green@non-existent-email',
        primaryphone: '01234 567 891'
      })
    })

    const { form } = result.current

    expect(form.affectedemail).toEqual('theresa.green@non-existent-email')
    expect(form.affectedphone).toEqual('01234 567 891')
  })

  test('setting affectedby with a customer should set pluspcustomer', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setAffectedBy({
        personid: 'TERESA GREEN',
        pluspcustcontact: [
          {
            pluspcustcontact: [
              {
                name: 'CUSTOMER NAME'
              }
            ],
            customer: 'CUSTOMER'
          }
        ]
      })
    })
    expect(result.current.form.pluspcustomer).toEqual([
      { name: 'CUSTOMER NAME', customer: 'CUSTOMER' }
    ])
  })
})

describe('origrecordid', () => {
  test('setting origrecordid does not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        mtfmworktype: 'RW',
        pelbusunit: '',
        pelsrtype: '',
        pluspcustomer: 'DFLT',
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    expect(result.current.form.origrecordid).toEqual('2677516')
    expect(result.current.form.origrecordclass).toEqual('SR')
  })

  test('setting origrecordid with customer updates pluspcustomer', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        mtfmworktype: 'RW',
        pelbusunit: '',
        pelsrtype: '',
        pluspcustomer: { name: 'TEST', customer: 'TEST CUSTOMER' },
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    expect(result.current.form.pluspcustomer).toEqual([{ customer: 'TEST CUSTOMER', name: 'TEST' }])
  })

  test('setting origrecordid with location updates location', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        locations: {
          description: 'BRIDGE MEADOW RETAIL PARK'
        },
        mtfmworktype: 'RW',
        pelbusunit: '',
        pelsrtype: '',
        pluspcustomer: 'DFLT',
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    
    expect(result.current.form.location).toEqual('1340141')
    expect(result.current.form.locationDesc).toEqual('BRIDGE MEADOW RETAIL PARK')
  })

  test('setting origrecordid with pellocpclookup updates building', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        locations: {
          description: 'BRIDGE MEADOW RETAIL PARK',
          siteid: 'UK'
        },
        pellocpclookup: [{ building: 'TEST', builddesc: 'TEST BUILDING' }],
        mtfmworktype: 'RW',
        pelbusunit: '',
        pelsrtype: '',
        pluspcustomer: 'DFLT',
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    
    expect(result.current.form.pellocbuilding).toEqual('TEST')
    expect(result.current.form.buildingDesc).toEqual('TEST BUILDING')
    expect(result.current.form.siteid).toEqual('UK')
  })

  test('setting origrecordid with pelbusunit updates pelbusunit', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        locations: {
          description: 'BRIDGE MEADOW RETAIL PARK'
        },
        mtfmworktype: 'RW',
        pelbusunit: 'T1',
        pelsrtype: '',
        pluspcustomer: 'DFLT',
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    
    expect(result.current.form.pelbusunit).toEqual('T1')
  })

  test('setting origrecordid with assetnum updates assetnum', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '1234567',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        locations: {
          description: 'BRIDGE MEADOW RETAIL PARK'
        },
        mtfmworktype: 'RW',
        pelbusunit: 'T1',
        pelsrtype: '',
        pluspcustomer: 'DFLT',
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    
    expect(result.current.form.assetnum).toEqual('1234567')
  })

  test('setting origrecordid with a derived pelsrtype updates pelsrtype', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setOrigRecord({
        assetnum: '1234567',
        description: ': P10 T2 TT2225 - sink blocked',
        location: '1340141',
        locations: {
          description: 'BRIDGE MEADOW RETAIL PARK'
        },
        mtfmworktype: 'RW',
        pelbusunit: 'T1',
        pelsrtype: 'CH',
        pluspcustomer: 'DFLT',
        status: 'QUEUED',
        status_description: 'Queued',
        ticketid: '2677516',
        ticketuid: 2688244
      })
    })

    
    expect(result.current.form.pelsrtype).toEqual('CH')
  })
})

describe('setFormValue', () => {
  test('setting a value against an unguarded key does not throw an error', () => {
    const { result } = renderHook(() => useFormModel())

    act(() => {
      result.current.setFormValue('reportedemail', 'hello@non-existent-email')
    })

    expect(result.current.form.reportedemail).toEqual('hello@non-existent-email')
  })
})
