import React, { useEffect, useState } from 'react'
import _ from 'lodash'

export const useIdleTimeProvider = idleTimeout => {
  const [timer, setTimer] = useState(idleTimeout)

  
  useEffect(() => {
    const myInterval = setInterval(() => {
      if (timer > 0) {
        setTimer(t => t - 1)
      }
    }, 1000)
    const resetTimeout = _.debounce(
      () => {
        setTimer(idleTimeout)
      },
      1000,
      { leading: true, trailing: true }
    )

    const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress']

    events.forEach(event => {
      window.addEventListener(event, resetTimeout)
    })
    return () => {
      clearInterval(myInterval)
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout)
      })
    }
  },[])
  return timer
}
