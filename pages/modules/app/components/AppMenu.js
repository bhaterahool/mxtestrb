import React, { useState } from 'react'
import { OverflowMenu, OverflowMenuItem } from 'carbon-components-react'
import { useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import grid32 from '@carbon/icons-react/lib/grid/32'
import { useSession } from '../../auth/SessionProvider'

export const AppMenu = () => {
  const [list, setAppList] = useState('contact-center')
  const history = useHistory()
  const [session] = useSession()

  const onChange = item => () => {
    setAppList(item)
    history.push(item)
    localStorage.removeItem('searchFilterConfig')
  }
  if (session.sessionId && session.applications.length > 1) {
    return (
      <>
        <OverflowMenu renderIcon={grid32} flipped className="bx--header__action">
          {session.applications.map(value => {
            return (
              <OverflowMenuItem
                key={value.appname}
                itemText={value.appname}
                selectorPrimaryFocus={list === value.path}
                onClick={onChange(value.path)}
              />
            )
          })}
        </OverflowMenu>
        <Helmet>
          <html className={list} lang="en" />
        </Helmet>
      </>
    )
  }

  return null
}
