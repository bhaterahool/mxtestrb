import React from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from 'react-spring'

import { Toast } from './Toast'

export const ToastContainer = ({ toasts }) => {
  const transitions = useTransition(toasts, toast => toast.id, {
    from: { transform: 'translateX(100%)' },
    enter: { transform: 'translateX(0%)' },
    leave: { transform: 'translateX(100%)' }
  })

  return createPortal(
    <div className="pel--toast-wrapper">
      {transitions.map(({ item, key, props }) => (
        <Toast key={key} id={item.id} style={props} {...item} />
      ))}
    </div>,
    document.body
  )
}
