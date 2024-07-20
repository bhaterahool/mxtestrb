import React, { createContext, useContext, useState, useRef } from 'react'

const UIContext = createContext()

const UIProvider = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(true)

  const dirtyGrids = useRef({})

  const isGridDirty = id => {
    if (id) return dirtyGrids.current[id]
    return Object.values(dirtyGrids.current).some(isModified => isModified)
  }

  const setDirtyGrid = id => {
    dirtyGrids.current = {
      ...dirtyGrids.current,
      [id]: true
    }
  }

  const setPristineGrid = id => {
    dirtyGrids.current = {
      ...dirtyGrids.current,
      [id]: false
    }
  }

  const gridRef = useRef()

  const toggleSearchPanel = () => setSearchOpen(currentState => !currentState)

  return (
    <UIContext.Provider
      value={{ searchOpen, toggleSearchPanel, gridRef, isGridDirty, setDirtyGrid, setPristineGrid }}
    >
      {children}
    </UIContext.Provider>
  )
}

const useUI = () => useContext(UIContext)

export { UIProvider, useUI }
