import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { ClickableTile } from 'carbon-components-react'
import Moment from 'react-moment'
import { useSession } from '../../../auth/SessionProvider'
import { currencyFormatter } from '../../utilities/formatters'

export const SearchResultItem = ({
  afpnum,
  startdate,
  enddate,
  description,
  pelbusunit,
  status,
  totalappvalue,
  type,
  onClick
}) => {
  const [session] = useSession()
  const { busUnits = [] } = session
  const { description: busUnit = '' } = useMemo(
    () => busUnits.find(({ value }) => pelbusunit === value) ?? {},
    []
  )
  return (
    <ClickableTile
      handleClick={onClick}
      className="pel--search-result card card-1"
      href="#"
      key={afpnum}
    >
      <div className="search-result-item">
        <ul>
          <li className="pel--search-meta">
            <strong>AFP number:</strong> {afpnum}
          </li>
          <li className="pel--search-meta">
            <strong>Start date: </strong>
            {startdate && <Moment format="DD-MMM-YYYY HH:mm">{startdate}</Moment>}
          </li>
          <li className="pel--search-meta">
            <strong>End date: </strong>
            {enddate && <Moment format="DD-MMM-YYYY HH:mm">{enddate}</Moment>}
          </li>
        </ul>
        <p className="bx--tile-text pel--text-wrap">
          {status} {description ? `- ${description}` : null}
        </p>
        <div className="pel--search-meta">
          <p className="bx--tile-text__small">
            Type: <span>{type}</span>
          </p>
        </div>
        <div className="pel--search-meta">
          <p className="bx--tile-text__small">
            Total Value: <span>{currencyFormatter({ value: totalappvalue })}</span>
          </p>
        </div>
        <div className="pel--search-meta">
          <p className="bx--tile-text__small">
            Business Unit: <span>{busUnit}</span>
          </p>
        </div>
      </div>
    </ClickableTile>
  )
}

SearchResultItem.defaultProps = {
  afpnum: '',
  startdate: '',
  enddate: '',
  description: '',
  pelbusunit: '',
  status: '',
  type: ''
}

SearchResultItem.propTypes = {
  afpnum: PropTypes.string,
  startdate: PropTypes.string,
  enddate: PropTypes.string,
  description: PropTypes.string,
  pelbusunit: PropTypes.string,
  status: PropTypes.string,
  type: PropTypes.string,
  totalappvalue: PropTypes.number,
  onClick: PropTypes.func.isRequired
}
