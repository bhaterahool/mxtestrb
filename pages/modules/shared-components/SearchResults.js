import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import _ from 'lodash'
import { CodeSnippetSkeleton, Tile } from 'carbon-components-react'

export const SearchResults = ({
  results,
  onResultSelected,
  renderItem,
  isPaginated,
  loading,
  error
}) => {
  const className = classnames({
    'pel--search-results': true,
    'pel--search-results__paginated': isPaginated
  })

  
  const onClick = result => e => {
    e.preventDefault()

    onResultSelected(result)
  }

  if (loading) {
    return (
      <div className="pel--search-results--loading">
        {_.times(10, idx => (
          <CodeSnippetSkeleton key={`skel-${idx}`} type="multi" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className={className}>
        {results.map((result, index) => {
          return renderItem({
            ...result,
            key: `result-${index}`,
            onClick: onClick(result)
          })
        })}
      </div>
      {results.length === 0 && (
        <>
          <div className="pel--search-no-result">
            <Tile>No results found</Tile>
            {error && <Tile>{error}</Tile>}
          </div>
        </>
      )}
    </>
  )
}

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object),
  renderItem: PropTypes.func.isRequired,
  isPaginated: PropTypes.bool.isRequired,
  onResultSelected: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType(null, PropTypes.string)
}
