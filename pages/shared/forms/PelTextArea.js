import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { TextAreaSkeleton, TextArea } from 'carbon-components-react'
import { useFieldRemarks } from './useFieldRemarks'
import { Remarks } from './Remarks'

export const PelTextArea = forwardRef(
  ({ showSkeleton, hidden, buttons, remarks, wrapperClassName, ...props }, ref) => {
    const { showRemarks, handleKeyDown, handleKeyUp } = useFieldRemarks()

    if (hidden) return null

    if (showSkeleton) return <TextAreaSkeleton />
    return (
      <div className={`flex pel--text-input ${wrapperClassName ?? ''}`}>
        <TextArea onKeyDown={handleKeyDown} ref={ref} onKeyUp={handleKeyUp} {...props} />
        {buttons && <div className="button-container">{buttons}</div>}
        {showRemarks && remarks && <Remarks text={remarks} />}
      </div>
    )
  }
)

PelTextArea.propTypes = {
  buttons: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  hidden: PropTypes.bool,
  remarks: PropTypes.string,
  showSkeleton: PropTypes.bool,
  wrapperClassName: PropTypes.string
}
