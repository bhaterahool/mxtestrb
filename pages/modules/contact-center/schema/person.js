import * as yup from 'yup'


yup.addMethod(yup.string, 'phone', function() {
  const rx = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

  return this.test('phone', 'Invalid phone number', value => rx.test(value))
})

export const person = yup.object().shape({
  firstname: yup.string().required(),
  lastname: yup.string().required(),
  addressline1: yup.string(),
  city: yup.string(),
  stateprovince: yup.string(),
  postalcode: yup.string(),
  primaryemail: yup
    .string()
    .email()
    .required(),
  primaryphone: yup
    .string()
    .phone()
    .required()
})
