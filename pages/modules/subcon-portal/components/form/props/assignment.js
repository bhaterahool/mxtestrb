import PropTypes from 'prop-types'
import { workOrder } from './workOrder'

export const assignment = PropTypes.shape({
  assignmentid: PropTypes.number,
  href: PropTypes.string,
  status: PropTypes.string,
  status_description: PropTypes.string,
  workorder: workOrder
})
