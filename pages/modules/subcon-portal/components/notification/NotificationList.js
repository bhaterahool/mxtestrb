import React, { useState, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import { CodeSnippetSkeleton, Tile, Checkbox } from 'carbon-components-react'
import _ from 'lodash'
import { NotificationDetailModal } from './NotificationDetailModal'
import { NotificationListItem } from './NotificationListItem'
import { api } from '../../../app/api'
import getRelativePath from '../../../../util/getRelativePath'
import { useMaxProp } from '../../../../shared/hooks/useMaxProp'
import { DEV, EXCLUDE_SUBCON_BULLETIN_INTERVAL } from '../../../../dev.config'

const SkeletonLoading = memo(() => (
  <div className="pel--search-results--loading">
    <CodeSnippetSkeleton type="multi" />
    <CodeSnippetSkeleton type="multi" />
    <CodeSnippetSkeleton type="multi" />
    <CodeSnippetSkeleton type="multi" />
    <CodeSnippetSkeleton type="multi" />
    <CodeSnippetSkeleton type="multi" />
    <CodeSnippetSkeleton type="multi" />
  </div>
))

export const NotificationList = ({ notificationData, loading, error, updateNotification }) => {
  
  if (loading) {
    return <SkeletonLoading />
  }

  
  const notificationRefeshInterval = useMaxProp('pel.mxplus.notificationinterval')
  const notificationRefreshInterval = notificationRefeshInterval
    ? notificationRefeshInterval?.maxpropvalue?.propvalue
    : 3 

  const [showdetail, setShowdetail] = useState({
    active: false,
    data: []
  })

  const [filter, setFilter] = useState([])

  const filteredData = data => {
    return data
      ?.filter(notification =>
        filter.length > 0 ? filter.includes(notification.status) : notification
      )
      ?.map(notification => ({
        id: notification.bulletinboardid,
        ...notification
      }))
      .sort((a, b) => {
        if (a.postdate > b.postdate) return -1
        if (a.postdate < b.postdate) return 1
        return 0
      })
  }

  const [notifydata, setNotifydata] = useState(notificationData)
  const [notifications, setNotifications] = useState(filteredData(notifydata))

  const getNotificationData = async () => {
    try {
      const { data } = await api.get(`/pelos/PELBULLETINBOARD?oslc.select=*`)
      setNotifydata(data?.member || [])
      setNotifications(filteredData(data?.member))
      updateNotification(data?.member?.filter(item => !['READ', 'ARCHIVED'].includes(item.status)))
    } catch (err) {
      
    }
  }

  const changeNotificationStatus = async (newStatus, data) => {
    try {
      await api.post(
        getRelativePath(data.href),
        { status: newStatus, bulletinboardid: data.bulletinboardid },
        {
          headers: {
            patchtype: 'MERGE',
            'x-method-override': 'PATCH',
            'Content-Type': 'application/json'
          }
        }
      )
      getNotificationData()
    } catch (error) {
      
    }
  }
  useEffect(() => {
    if (!DEV || !EXCLUDE_SUBCON_BULLETIN_INTERVAL) {
      const interval = setInterval(() => {
        getNotificationData()
      }, notificationRefreshInterval * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [])

  const onClick = result => e => {
    setShowdetail({
      active: true,
      data: result
    })
    changeNotificationStatus('READ', result)
  }

  const handleCheckBoxChange = (value, name) => {
    if (value) {
      filter.push(name)
    } else {
      filter.splice(filter?.indexOf(name), 1)
    }
    setFilter(filter)
    setNotifications(filteredData(notifydata))
  }

  const onFlagClick = (result, status) => e => {
    
    const newItems = notifications
    const index = newItems.findIndex(obj => obj.id === result.id)
    newItems[index].status = status
    setNotifications(filteredData(newItems))
    changeNotificationStatus(status, result)
  }

  return (
    <>
      <span className="notification-panel-header">
        <Checkbox labelText="Read" id="READ" name="READ" onChange={handleCheckBoxChange} />
        <Checkbox labelText="Unread" id="UNREAD" name="UNREAD" onChange={handleCheckBoxChange} />
        <Checkbox
          labelText="Archive"
          id="ARCHIVED"
          name="ARCHIVED"
          onChange={handleCheckBoxChange}
        />
      </span>
      {notifications?.map(notification => {
        return NotificationListItem({
          ...notification,
          key: notification.bulletinboardid,
          onClick: onClick(notification),
          onReadClick: onFlagClick(notification, 'READ'),
          onUnReadClick: onFlagClick(notification, 'UNREAD'),
          onArchiveClick: onFlagClick(notification, 'ARCHIVED'),
          onUndoClick: onFlagClick(notification, 'READ')
        })
      })}
      {notifications?.length === 0 && (
        <div className="pel--search-no-result">
          <Tile>No notification available</Tile>
          {error && <Tile>{error}</Tile>}
        </div>
      )}
      <NotificationDetailModal
        modalProps={{
          open: showdetail.active,
          onRequestClose: () =>
            setShowdetail({
              active: false,
              data: []
            })
        }}
        details={showdetail.data || []}
      />
    </>
  )
}

NotificationList.propTypes = {
  notificationData: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.string,
  updateNotification: PropTypes.func
}
