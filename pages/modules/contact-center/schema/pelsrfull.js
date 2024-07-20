import * as yup from 'yup'

export const pelsrfull = yup.object().shape({
  pelclientref: yup.string().matches(/^.[a-zA-Z0-9 ]+$/, {
    message: 'Alphanumeric characters only',
    excludeEmptyString: true
  }),
  pluspcustponum: yup.string().matches(/^.[a-zA-Z0-9 ]+$/, {
    message: 'Alphanumeric characters only',
    excludeEmptyString: true
  }),
  description: yup.string().required(),
  reportedbyname: yup.string().required(),
  reportedbyphone: yup.string().required(),
  classstructureid: yup.string().required(),
  pluspcustomer: yup.string().required()
})
