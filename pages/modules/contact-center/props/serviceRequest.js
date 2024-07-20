import PropTypes from 'prop-types'
import { pluspcustomer } from './pluspcustomer'

export const serviceRequest = PropTypes.shape({
  ticketid: PropTypes.string,
  description: PropTypes.string,
  pluspcustomer,
  pelclientref: PropTypes.string,
  pluspcustponum: PropTypes.string,
  reportedbyname: PropTypes.string,
  affectedperson: PropTypes.string,
  buildingnotes: PropTypes.string,
  location: PropTypes.string,
  mtfmworktype: PropTypes.string,
  status: PropTypes.string,
  targetstart: PropTypes.string,
  targetfinish: PropTypes.string,
  reportedphone: PropTypes.string,
  reportedemail: PropTypes.string,
  affectedphone: PropTypes.string,
  affectedemail: PropTypes.string,
  href: PropTypes.string
})
