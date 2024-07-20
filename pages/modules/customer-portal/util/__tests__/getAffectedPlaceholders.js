import { getAffectedPlaceHolders } from '../getAffectedPlaceHolders'

describe('getAffectedPlaceHolders', () => {
  test('Returns reportedby as placeholders when no affected by data', () => {
    const form = {
      reportedby: 'reported person',
      reportedbyname: 'reported name',
      reportedphone: 'reported phone',
      reportedemail: 'reported email',
      affectedperson: '',
      affectedusername: '',
      affectedphone: '',
      affectedemail: ''
    }

    expect(getAffectedPlaceHolders(form)).toEqual({
      affectedperson: form.reportedby,
      affectedusername: form.reportedbyname,
      affectedphone: form.reportedphone,
      affectedemail: form.reportedemail
    })
  })

  test('No placeholders when any of the affected by fields has data', () => {
    const form = {
      reportedby: 'reportedby person',
      reportedbyname: 'reportedby name',
      reportedphone: 'reportedby phone',
      reportedemail: 'reportedby email',
      affectedphone: 'affectedby phone'
    }

    expect(getAffectedPlaceHolders(form)).toEqual({
      affectedperson: '',
      affectedusername: '',
      affectedphone: '',
      affectedemail: ''
    })
  })
})
