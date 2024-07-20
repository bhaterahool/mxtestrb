import * as yup from 'yup'

const requiredForSrTypes = (srTypes, requiredMessage) => {
  return yup.string().when('pelsrtype', {
    is: value => srTypes.includes(value),
    then: yup.string().required(requiredMessage)
  })
}

export const create = yup
  .object()
  .shape({
    pluspcustomer: requiredForSrTypes(['RW', 'CH', 'RC', 'QR'], 'Please select a customer'),
    reportedby: yup.string(),
    reportedbyname: yup.string(),
    pellocbuilding: requiredForSrTypes(['RW', 'CH', 'RC', 'QR'], 'Please select a building'),
    pelpomand: yup.boolean(),
    classstructureid: requiredForSrTypes(['RW'], 'Please select a classification'),
    description: requiredForSrTypes(['RW', 'CH', 'RC', 'QR'], 'Please enter a description'),
    description_longdescription: requiredForSrTypes(
      ['RW', 'CH', 'RC', 'QR'],
      'Please enter a long description'
    ),
    pluspcustponum: yup.string().when('pelpomand', {
      is: true,
      then: yup.string().required('Please enter a customer po number')
    }),
    reportedphone: yup.string().when(['reportedemail', 'pelsrtype'], {
      is: (reportedemail, pelsrtype) =>
        reportedemail === '' && !['CP', 'CC', 'IN'].includes(pelsrtype),
      then: yup.string().required('Please enter the missing details')
    }),
    pelsrsubtype: requiredForSrTypes(['CH', 'IN'], 'Please select an SR Reason')
  })
  .test({
    name: 'reported-by',

    
    test: function(value) {
      return !value.reportedby &&
        !value.reportedbyname &&
        !['CP', 'CC', 'IN'].includes(value.pelsrtype)
        ? this.createError({
            message: `Please enter a reported person`,
            path: 'reportedbyname'
          })
        : true
    }
  })
