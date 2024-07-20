import './index.scss'
import './app.scss'
import React from 'react'
import ReactDom from 'react-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom'
import WebFont from 'webfontloader'
import { Modal } from 'carbon-components-react'
import { useSession, SessionProvider } from './modules/auth/SessionProvider'
import { Login } from './modules/auth/containers'
import config from './modules/app/config'
import { ContactCenter } from './modules/contact-center'
import { SubConPortal } from './modules/subcon-portal'
import { MxPlusData } from './modules/mxplusdata'
import { CustomerPortal } from './modules/customer-portal'
import { Afp } from './modules/afp'
import { Wopricing } from './modules/wopricing'
import { Afpbulk } from './modules/afpbulk'
import { Dashboard } from './modules/dashboard'

WebFont.load({
  google: {
    families: ['Open Sans:300,400,700', 'sans-serif']
  }
})

const LoginModal = () => {
  const [session] = useSession()
  const location = useLocation()

  const showLogin = !_.has(session, 'sessionId') || location.pathname === '/'

  return (
    <Modal open={showLogin} passiveModal className="login--modal">
      <Login />
    </Modal>
  )
}

const AppContainer = () => {
  return (
    <SessionProvider
      options={{
        storageType: config.storageType,
        storageKey: config.storageKey
      }}
    >
      <Router basename={process.env.BASE_PATH}>
        <Helmet>
          <base href={process.env.BASE_PATH} />
          <link rel="shortcut icon" href={`${process.env.BASE_PATH}/favicon.ico`} />
          <title>Login</title>
        </Helmet>
        <Switch>
          <Route path="/contact-centre" component={ContactCenter} />
          <Route path="/subcontractors" component={SubConPortal} />
          <Route path="/mxplusdata" component={MxPlusData} />
          <Route path="/customer-portal" component={CustomerPortal} />
          <Route path="/subcon-afp" component={Afp} />
          <Route path="/wopricing" component={Wopricing} />
          <Route path="/subcon-bulk" component={Afpbulk} />
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
        <LoginModal />
      </Router>
    </SessionProvider>
  )
}

ReactDom.render(<AppContainer />, document.getElementById('root'))
