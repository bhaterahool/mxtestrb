import React, { useState } from 'react'
import { Header, HeaderGlobalBar, HeaderPanel, HeaderGlobalAction } from 'carbon-components-react'
import Notification32 from '@carbon/icons-react/lib/notification/32'
import { Logout } from '../../auth/containers/Logout'
import { useSession } from '../../auth/SessionProvider'
import { ThemePicker } from './ThemePicker'
import { AppMenu } from './AppMenu'
import { NotificationList } from '../../subcon-portal/components/notification/NotificationList'
import { useObject } from '../../../shared/hooks/useObject'
import { api } from '../api'
import './DefaultHeader.scss'
import logo from '../../../img/mitie-logo.svg'


export const DefaultHeader = () => {
  const [session] = useSession()

  const version = process.env.BuildNumber ?? 'Dev'

  const [shownotification, setShownotification] = useState(false)

  const [updatedcount, setUpdatedcount] = useState()
  const hasSubConAccess = session.sessionId && session.applications.some(app => app.code === 'SUBC')

  const { loading, data, error } = useObject(
    api,
    'PELBULLETINBOARD',
    hasSubConAccess ? `oslc.select=*` : ''
  )

  const notificationData = data?.member || []
  const notificationCount = notificationData.filter(
    item => !['READ', 'ARCHIVED'].includes(item.status)
  )
  const notificationCountLength = notificationCount.length

  const updateNotification = update => {
    setUpdatedcount(update.length)
  }

  return (
    <Header aria-label="Mitie Contact Centre">
      <img src={logo} alt="logo" className="logo" title={`v${version}`} />
      <HeaderGlobalBar>
        {hasSubConAccess && (
          <HeaderGlobalAction
            aria-label="Notification"
            onClick={() => {
              setShownotification(!shownotification)
            }}
          >
            {notificationCountLength > 0 && !updatedcount && (
              <span className="notification-count">{notificationCountLength}</span>
            )}

            {updatedcount > 0 && updatedcount && (
              <span className="notification-count">{updatedcount}</span>
            )}

            <Notification32 />
          </HeaderGlobalAction>
        )}
        <AppMenu />
        <ThemePicker />
        {session.sessionId && <Logout />}
      </HeaderGlobalBar>

      {hasSubConAccess && (
        <HeaderPanel
          className="pel--notification-panel"
          aria-label="pel--notification-panel"
          expanded={shownotification}
        >
          <NotificationList
            notificationData={notificationData}
            loading={loading}
            error={error}
            updateNotification={updateNotification}
          />
        </HeaderPanel>
      )}
    </Header>
  )
}
