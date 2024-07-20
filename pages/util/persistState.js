
export const LABEL_WOPRICING = 'wopricing_state'
export const LABEL_AFPBULK = 'afpbulk_state'


const DEFAULT_LABEL = LABEL_AFPBULK


export const PERSIST_STORE = true
export const KILL_STORE = !PERSIST_STORE

export const loadState = (LABEL = DEFAULT_LABEL) => {
  if (KILL_STORE) {
    localStorage.removeItem(LABEL)
  }
  if (!PERSIST_STORE) {
    return undefined
  }
  try {
    const serializedState = localStorage.getItem(LABEL)
    if (serializedState === null) {
      return undefined
    }
    const state = JSON.parse(serializedState)
    return state
  } catch (e) {
    return undefined
  }
}

export const saveState = (state, LABEL = DEFAULT_LABEL) => {
  if (!PERSIST_STORE) {
    return
  }
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(LABEL, serializedState)
  } catch (err) {
    console.warn('Error  - savingState. ', err)
  }
}

export const deleteState = (LABEL = DEFAULT_LABEL) => {
  try {
    localStorage.setItem(LABEL, {})
  } catch (err) {
    console.warn('Error  - Deleting state. ', err)
  }
}

if (!PERSIST_STORE) {
  deleteState()
}
