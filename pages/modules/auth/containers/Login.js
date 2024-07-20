import React, { useEffect, useState } from 'react'

import _ from 'lodash'
import { useHistory, useLocation } from 'react-router-dom'
import hash from 'object-hash'
import { LoginForm } from '../components'
import { useSession } from '../SessionProvider'
import { api } from '../../app/api'
import config from '../../app/config'
import * as util from '../../app/util'
import { MaximoLoginForm } from '../components/MaximoLoginForm'

const login = ({ username, password }) =>
  api.post('/login?lean=1', undefined, {
    headers: {
      maxauth: btoa(`${username}:${password}`)
    }
  })

const whoAmI = () => api.get('/whoami?addapps=1')

const getUserInfo = personid =>
  api.get(`/pelos/PELPERSON?oslc.where=personid="${personid}"&oslc.select=*`)

const getBusinessUnits = personid =>
  api.get(
    `/pelos/PELPERSONGROUP?querytemplate=BU_SEARCH&oslc.where=allpersongroupteam.respparty="${personid}"`
  )

const informMaximo = () =>
  api.get(`/maximo/ping.jsp?maximoxurl=${encodeURIComponent(window.location)}`, {
    baseURL: `/`,
    removeparams: true
  })

const confirmMaximoLogin = () => api.get(`/login`)

export const Login = () => {
  const [formError, setFormError] = useState()
  const [session, setSession] = useSession()
  const location = useLocation()
  const history = useHistory()

  const [form, setForm] = useState({
    username: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)

  const setUserSession = async loginRes => {
    // Branch off and retrieve user's personId. No useful data in login response.
    const whoAmIRes = await whoAmI()

    
    const applications = Object.entries(whoAmIRes.data.applications)
      .filter(app => app[1].apptype === 'MXPLUS')
      .map(application => {
        return {
          ...config.applications.find(a => a.code === application[0]),
          appname: application[1].description
        }
      })

    
    
    
    
    
    
    
    
    

    const isContactCenter = applications.some(({ code }) => ['CONC', 'PELSUBAFP'].includes(code))
    
    const application = util.getApplicationFromPath(location.pathname, config)

    
    if (
      applications.length === 0 ||
      (application && !util.isApplicationAccessible(application, applications))
    ) {
      setLoading(false)
      setFormError(() => 'Access Denied')
      await api.post('/logout')
      throw new Error('Access Denied')
    }

    
    const userInfoRes = await getUserInfo(whoAmIRes.data.personId)

    const data = {
      sessionId: hash(loginRes.data),
      applications,
      defaultSite: whoAmIRes.data.defaultSite,
      ...loginRes.data.member,
      ...userInfoRes.data.member[0],
      orgid: userInfoRes.data.member[0]?.orgid || whoAmIRes.data.defaultOrg
    }

    if (isContactCenter) {
      const busUnitsRes = await getBusinessUnits(whoAmIRes.data.personId)
      data.busUnits = _.map(busUnitsRes.data.member, 'pelmetadata')
      setSession(data)
    } else {
      setSession(data)
    }

    if (application && application.path !== location.pathname) {
      
      history.push(application.path)
    }

    if (!application) {
      const allowedApp = applications.filter(app => app.path !== undefined)
      
      history.push(allowedApp[0].path)
    }
  }

    const checkLogin = async e => {
    setLoading(true)

    
    const isUserLoggedin = await confirmMaximoLogin().catch(() => {})

    if (isUserLoggedin?.status === 200) {
      await setUserSession(isUserLoggedin)
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  useEffect(() => {
    checkLogin()
  }, [])

    const openMaximo = async e => {
    const loggedIn = await checkLogin()
    if (!loggedIn) {
      setLoading(true)
      setFormError(() => '')
      const response = await informMaximo().catch(e => {
        setFormError(() => e.message)
        setLoading(false)
      })
      if (response && response.status === 200) {
        const maximoUrl = `${window.location.origin}/maximo/ui/login`
        window.location.href = maximoUrl
      }
    }
  }

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const loginRes = await login(form)
      setUserSession(loginRes)
    } catch (err) {
      setFormError(() => err.message)
    }
    setLoading(false)
  }

  const onChange = e => {
    const { name, value } = e.target

    setForm(f => ({
      ...f,
      [name]: value
    }))
  }

  const enableMaximoLogin = true 

  return (
    <>
      {enableMaximoLogin ? (
        <MaximoLoginForm openMaximo={openMaximo} loading={loading} formError={formError} />
      ) : (
        <LoginForm
          formError={formError}
          onSubmit={onSubmit}
          onChange={onChange}
          username={form.username}
          password={form.password}
          loading={loading}
          errors={{}}
          enableMaximoLogin="true"
        />
      )}
    </>
  )
}
