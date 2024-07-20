import PropTypes from 'prop-types'

export const workOrder = PropTypes.shape({
  wonum: PropTypes.string,
  actstart: PropTypes.string,
  classstructure: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string
    })
  ),
  location: PropTypes.oneOfType([
    PropTypes.shape({
      description: PropTypes.string
    }),
    PropTypes.string
  ]),
  description: PropTypes.string,
  pelreportascrit: PropTypes.bool,
  pelreportashs: PropTypes.bool,
  pluspcustomer: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string
      })
    ),
    PropTypes.string
  ]),
  schedstart: PropTypes.string,
  status: PropTypes.string,
  status_description: PropTypes.string,
  targcompdate: PropTypes.string,
  targstartdate: PropTypes.string,
  worktype: PropTypes.string
})
