import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ArrowRight16 from '@carbon/icons-react/lib/arrow--right/16'

export const BreadCrumb = ({ node, handleSelection }) => {
  const onClick = e => {
    e.preventDefault()
    handleSelection(e.target.value)
  }

  let path = [{ classstructureid: '', classificationid: 'All' }]

  if (node) {
    path = [
      ...path,
      ..._.reverse(node.ancestors),
      {
        classificationid: node.classificationid,
        classstructureid: node.classstructureid
      }
    ]
  }

  return (
    <div className="classification-breadcrumb">
      {_.map(
        _.orderBy(path, ['classstructureid'], ['asc']),
        ({ classificationid, classstructureid }, idx) => (
          <React.Fragment key={classificationid}>
            <button type="button" onClick={onClick} value={classstructureid}>
              {classificationid}
            </button>
            {idx < path.length - 1 && <ArrowRight16 />}
          </React.Fragment>
        )
      )}
    </div>
  )
}

BreadCrumb.propTypes = {
  handleSelection: PropTypes.func.isRequired,
  node: PropTypes.shape({
    classstructureid: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
    hierarchypath: PropTypes.string.isRequired,
    classificationid: PropTypes.string.isRequired,
    ancestors: PropTypes.arrayOf(
      PropTypes.shape({
        classificationid: PropTypes.string,
        classstructureid: PropTypes.string
      })
    )
  })
}
