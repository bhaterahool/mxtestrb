import React, { useState, useEffect, useRef } from 'react'
import { Modal, Tabs, Tab, Button } from 'carbon-components-react'
import Axios from 'axios'
import './TabBar.scss'
import { Close16 } from '@carbon/icons-react'
import { Prompt } from 'react-router-dom'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useAfpCtx } from '../../context/afp-context'
import { AfpContainer } from '../AfpContainer/AfpContainer'
import { useUI } from '../../context/ui-context/ui-context'
import { isEmpty } from '../../../../util'
import { getAfps } from '../../services/afpApiService'
import { AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM } from '../../utilities'
import { exportAfpData } from '../../utilities/exportAfpData'
import { Loading } from '../../../shared-components/Loading'
import { useMaxProp } from '../../../../shared/hooks/useMaxProp'

const unsavedChangesMsg = 'Unsaved changes will be lost. Are you sure you want to proceed?'

const CloseButton = ({ onClick }) => (
  <span
    role="button"
    tabIndex="0"
    className="close-button"
    onClick={onClick}
    onKeyPress={({ code }) => {
      if (code === 'Enter') onClick()
    }}
  >
    <Close16 aria-label="Close" className="pel--icon pel--icon--white" />
  </span>
)

const TabLabel = ({ label, onClose }) => (
  <div className="afp--tab-button-content">
    <span>{label}</span>
    <CloseButton onClick={onClose} />
  </div>
)


export const TabBar = ({ searchRef }) => {
  const { searchOpen, isGridDirty } = useUI()
  const { afps, addAfp, removeAfp } = useAfpCtx()
  const [selectedTab, setSelectedTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const apiCallInterval = useMaxProp('pel.mxplus.afp.checkAfpUpdatedByAnotherUserFrequency') || 2

  const showEditedByElseModalDefaultValues = {
    afpNum: 0,
    cbFunc: () => {},
    action: false,
    actionTriggeredFrom: ''
  }

  const [pause, setPause] = useState(false)
  const [showEditedByElseModal, setShowEditedByElseModal] = useState(
    showEditedByElseModalDefaultValues
  )

  const tabs = [...afps.values()].filter(({ metadata: { isOpen } }) => isOpen)

  useEffect(() => {
    const afpsArray = [...afps.values()]
    const openAfps = afpsArray.filter(({ metadata: { isOpen } }) => isOpen === true)
    setSelectedTab(openAfps ? openAfps.length - 1 : 0)
  }, [afps])

  const onClose = (id, { isModified }) => {
    if (isModified || isGridDirty(id)) {
      // eslint-disable-next-line no-alert
      const answer = window.confirm(unsavedChangesMsg)
      if (answer) removeAfp(id)
    } else removeAfp(id)
  }

  const classes = classNames('afp--tab-bar', {
    'afp--tab-bar--open': searchOpen
  })

  const fetchAfpsRef = useRef(null)

  const afpNums = []

  afps.forEach(({ id, metadata: { isOpen } }, data) => {
    
    if (id && isOpen) afpNums.push({ id, rowstamp: data._rowstamp })
  })

  const handleAfpChanged = ({ afpnum }) => {
    const afpIdx = tabs.findIndex(tab => +tab.id === +afpnum)

    if (afpIdx !== -1) {
      setSelectedTab(afpIdx)
    }

    setPause(true)
    setShowEditedByElseModal(() => ({
      afpNum: afpnum,
      action: true,
      actionTriggeredFrom: AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM.POOL_CHECK,
      cbFunc: () => {
        const { data: modifiedAfpData, label } = afps.get(afpnum)

        setIsLoading(true)
        exportAfpData(modifiedAfpData, label)
      }
    }))
  }

  const checkAfpsUpdatedByAnotherUser = (updatedAfps = []) => {
    updatedAfps.every(row => {
      const { afpnum = '', _rowstamp = '' } = row
      const afpData = afps.get(afpnum)

      // eslint-disable-next-line no-underscore-dangle
      if (_rowstamp && +afpData.data._rowstamp < +_rowstamp) {
        handleAfpChanged(row)
        return false
      }

      return true
    })
  }

  useEffect(() => {
    let intervalId = null
    if (!isEmpty(afpNums)) {
      if (fetchAfpsRef.current) {
        fetchAfpsRef.current.cancel()
      }

      // eslint-disable-next-line no-param-reassign
      fetchAfpsRef.current = Axios.CancelToken.source()

      const cancelToken = fetchAfpsRef.current.token

      intervalId = setInterval(() => {
        if (!pause) {
          getAfps(
            afpNums.map(row => row.id),
            cancelToken
          ).then(checkAfpsUpdatedByAnotherUser)
        }
      }, 1000 * 60 * apiCallInterval)
    }

    return () => {
      clearInterval(intervalId)
      if (fetchAfpsRef.current) fetchAfpsRef.current.cancel()
    }
  }, [afpNums])

  const onEditedByElseModalClose = () => {
    const { afpNum, cbFunc = () => {}, actionTriggeredFrom } = showEditedByElseModal

    cbFunc()

    if (actionTriggeredFrom === AFP_MODIFIED_BY_ANOTHER_USER_MODAL_TRIGGERED_FROM.AFP_LINE_GRID) {
      const { data: afpData = [], label = '' } = afps.get(afpNum) ?? {}

      if (!isEmpty(afpData) && label) {
        exportAfpData(afpData, label)
      }
    }

    setShowEditedByElseModal(() => showEditedByElseModalDefaultValues)

    setTimeout(() => {
      setIsLoading(false)
      setPause(false)
      onClose(afpNum, { isModified: false })

      searchRef.current.clearInput('')
    }, 0)
  }

  return (
    <>
      <div className={classes}>
        <Prompt
          message={location => {
            const isAfpModified =
              isGridDirty() ||
              [...afps.values()].some(
                ({ metadata: { isOpen, isModified } }) => isOpen && isModified
              )

            return location.pathname === '/subcon-afp' || !isAfpModified || unsavedChangesMsg
          }}
        />

        <Modal
          open={showEditedByElseModal.action}
          modalHeading={`AFP ${showEditedByElseModal.afpNum}`}
          primaryButtonText="Ok"
          secondaryButtonText={null}
          onRequestSubmit={onEditedByElseModalClose}
          onRequestClose={onEditedByElseModalClose}
          preventCloseOnClickOutside
          className="afp-updated--by-another-user-modal"
        >
          <p>
            Cannot save changes as this AFP has been edited by someone else, your version will be
            exported to your downloads. Reload the AFP, Check for changes, and Import any
            modifications you need before saving again.
          </p>
        </Modal>

        <div className="afp--tabs">
          <Tabs type="container" selected={selectedTab} tabContentClassName="afp--tabs-content">
            {tabs.map(({ id, label, metadata }) => (
              <Tab
                key={id}
                id={id}
                title={label}
                className="afp--tab-item"
                label={<TabLabel label={label} onClose={() => onClose(id, metadata)} />}
              >
                <AfpContainer
                  id={id}
                  tabs={tabs}
                  onClose={onClose}
                  searchRef={searchRef}
                  showEditedByElseModal={showEditedByElseModal}
                  setShowEditedByElseModal={setShowEditedByElseModal}
                />
              </Tab>
            ))}
          </Tabs>
        </div>
        <Button onClick={() => addAfp()}>New AFP</Button>
      </div>
      {isLoading && <Loading modal />}
    </>
  )
}

TabLabel.propTypes = {
  label: PropTypes.string,
  onClose: PropTypes.func
}

CloseButton.propTypes = {
  onClick: PropTypes.func
}
