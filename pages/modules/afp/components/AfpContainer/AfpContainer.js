import React from 'react'
import { Tab, Tabs } from 'carbon-components-react'
import classNames from 'classnames'
import { AfpForm } from '../AfpForm/AfpForm'
import { AfpLinesGrid } from '../AfpLinesGrid/AfpLinesGrid'
import { useUI } from '../../context/ui-context/ui-context'
import './AfpContainer.scss'
import { useAfpCtx } from '../../context/afp-context'

export const AfpContainer = ({ id, onClose, searchRef, setShowEditedByElseModal }) => {
  const { searchOpen } = useUI()

  const { afps } = useAfpCtx()
  const {
    data: { afpnum }
  } = afps.get(id)

  const wrapperClasses = classNames('afp--container--wrapper', {
    'afp--container--wrapper--open': searchOpen
  })

  const renderAfpLinesGrid = ({ selected, className, ...rest }) =>
    afpnum && selected ? (
      <div className={`${className} afp--grid-container`} selected={selected} {...rest}>
        <AfpLinesGrid
          id={id}
          onClose={onClose}
          searchRef={searchRef}
          setShowEditedByElseModal={setShowEditedByElseModal}
        />
      </div>
    ) : null

  return (
    <div className={wrapperClasses}>
      <Tabs>
        <Tab id="tab-form" label="AFP">
          <AfpForm
            id={id}
            onClose={onClose}
            searchRef={searchRef}
            setShowEditedByElseModal={setShowEditedByElseModal}
          />
        </Tab>
        <Tab
          id="tab-grid"
          disabled={!afpnum}
          label="AFP Lines"
          renderContent={renderAfpLinesGrid}
        />
      </Tabs>
    </div>
  )
}
