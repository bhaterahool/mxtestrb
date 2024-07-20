import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import DeleteIcon from '@carbon/icons-react/lib/delete/20'

export const FileList = ({ files, errors, ...props }) => {
  const handleSelect = index => e => {
    e.preventDefault()

    return props.handleSelect(index)
  }

  const handleDelete = index => e => {
    e.preventDefault()

    return props.handleDelete(index)
  }

  if (!files?.length) return null

  return (
    <div>
      <h5 className="title">File</h5>
      <ul>
        {files.map((file, index) => (
          <li
            
            key={`file-${index}`}
            className={cx({
              file: true,
              error: errors[index]
            })}
          >
            <a href="#" onClick={handleSelect(index)}>
              {file.name}
            </a>
            <button
              className="delete-button"
              type="button"
              onClick={handleDelete(index)}
              title="Delete File"
            >
              <DeleteIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

FileList.propTypes = {
  handleSelect: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      title: PropTypes.string,
      notes: PropTypes.string
    })
  ),
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string,
      index: PropTypes.number
    })
  )
}
