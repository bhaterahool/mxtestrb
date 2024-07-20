import PropTypes from 'prop-types'
import { asset } from './asset'

export const multiassetlocci = PropTypes.arrayOf(
  PropTypes.shape({
    href: PropTypes.string,
    multiid: PropTypes.string,
    pelcompdate: PropTypes.string,
    pelcompnotes: PropTypes.string,
    pelnoncompreason: PropTypes.string,
    pelworkcomp: PropTypes.bool,
    pelworkoutcome: PropTypes.string,
    sequence: PropTypes.string,
    assets: PropTypes.arrayOf(asset),
    locations: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string
      })
    )
  })
)
