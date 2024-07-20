import React from 'react'
import PropTypes from 'prop-types'
import { CaretRight24, CaretLeft24 } from '@carbon/icons-react'
import { Button } from 'carbon-components-react'

export const SearchPagination = ({ onChange, hasNextPage, page, startingPageIndex }) => {
  const onClick = dir => e => {
    e.preventDefault()

    if (dir === 'prev' && page > startingPageIndex) {
      return onChange(page - 1)
    }

    if (hasNextPage) {
      return onChange(page + 1)
    }
  }

  return (
    <div className="pel--search-paginator">
      <Button kind="secondary" onClick={onClick('prev')} disabled={page === 1}>
        <CaretLeft24 />
      </Button>
      <Button kind="secondary" onClick={onClick('next')} disabled={!hasNextPage}>
        <CaretRight24 />
      </Button>
    </div>
  )
}

SearchPagination.defaultProps = {
  startingPageIndex: 1
}

SearchPagination.propTypes = {
  page: PropTypes.number.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  startingPageIndex: PropTypes.number
}
