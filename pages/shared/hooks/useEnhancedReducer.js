import { useCallback, useRef, useReducer } from 'react'


export const useEnhancedReducer = (reducer, initStateInner, initializer) => {
  const lastState = useRef(initStateInner)
  const getState = useCallback(() => lastState.current, [])
  return [
    ...useReducer(
      (state, action) => {
        lastState.current = reducer(state, action)
        return lastState.current
      },
      initStateInner,
      initializer
    ),
    getState
  ]
}
