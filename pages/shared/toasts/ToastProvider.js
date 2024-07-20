import PropTypes from 'prop-types'
import React, { useState, useContext, useCallback } from 'react'
import { ToastContainer } from './ToastContainer'

const ToastContext = React.createContext(null)

let id = 1

const defaultToastProps = {
  role: 'alert',
  iconDescription: 'Close',
  title: 'Title Missing',
  subtitle: 'Subtitle Missing',
  caption: '',
  statusIconDescription: '',
  autohide: true,
  timeout: 5000
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback(
    toastid => {
      setToasts(allToasts => allToasts.filter(t => t.id !== toastid))
    },
    [setToasts]
  )

  const addToast = useCallback(
    toast => {
      const newToast = {
        // eslint-disable-next-line no-plusplus
        id: id++,
        ...defaultToastProps,
        ...toast
      }
      setToasts(allToasts => [...allToasts, newToast])

      if (toast.autohide) {
        setTimeout(() => {
          removeToast(newToast.id)
        }, toast.timeout)
      }
    },
    [setToasts]
  )

  const addSuccessToast = useCallback(
    toast => {
      addToast({
        ...defaultToastProps,
        kind: 'success',
        title: toast.title || 'Success!',
        statusIconDescription: 'Success',
        ...toast
      })
    },
    [setToasts]
  )

  const addErrorToast = useCallback(
    toast => {
      addToast({
        ...defaultToastProps,
        kind: 'error',
        title: toast.title || 'Error!',
        timeout: 6000,
        statusIconDescription: 'Error',
        ...toast
      })
    },
    [setToasts]
  )

  const addPersistentErrorToast = useCallback(
    toast => {
      addToast({
        ...defaultToastProps,
        kind: 'error',
        title: toast.title || 'Error!',
        autohide: false,
        statusIconDescription: 'Error',
        ...toast
      })
    },
    [setToasts]
  )

  const addInfoToast = useCallback(
    toast => {
      addToast({
        ...defaultToastProps,
        kind: 'info',
        title: toast.title || 'Info:',
        statusIconDescription: 'Info',
        ...toast
      })
    },
    [setToasts]
  )

  const addWarningToast = useCallback(
    toast => {
      addToast({
        ...defaultToastProps,
        kind: 'warning',
        title: toast.title || 'Warning:',
        statusIconDescription: 'Warning',
        ...toast
      })
    },
    [setToasts]
  )

  return (
    <ToastContext.Provider
      value={{
        addSuccessToast,
        addErrorToast,
        addWarningToast,
        addInfoToast,
        addToast,
        removeToast,
        addPersistentErrorToast
      }}
    >
      <ToastContainer toasts={toasts} />
      {children}
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
}

export const useToast = () => {
  const toastHelpers = useContext(ToastContext)

  return toastHelpers
}
