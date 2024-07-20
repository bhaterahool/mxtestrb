import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { LogoutButton } from '../components/LogoutButton'
import { api } from '../../app/api'
import { useSession } from '../SessionProvider'
import { useMaxProp } from '../../../shared/hooks/useMaxProp'
import { useIdleTimeProvider } from '../idle-time'

export const Logout = () => {
  const [session, setSession] = useSession()

  const sessionTimeoutMaxProp = useMaxProp('pel.mxplus.data.sessionTimeout')

  const history = useHistory()

    const [isSubmitting, setIsSubmitting] = useState(false)

  const logout = async () => {
    try {
      setIsSubmitting(true)

      await api.post('/logout')

      setSession({})
      history.go(0)
    } catch (err) {
      
    } finally {
      setIsSubmitting(false)
    }
  }

  const timer = useIdleTimeProvider(sessionTimeoutMaxProp?.maxpropvalue?.propvalue)
  if (timer === 0 && session.sessionId) {
    logout()
  }

  return <LogoutButton onClick={logout} />
}
