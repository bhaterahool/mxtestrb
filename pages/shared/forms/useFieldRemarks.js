import React, { useState, useCallback } from 'react'

export const useFieldRemarks = () => {
  const [showRemarks, setShowRemarks] = useState()

  const handleKeyDown = useCallback(e => {
    setShowRemarks(e.altKey)
  }, [])

  const handleKeyUp = useCallback(e => {
    setShowRemarks(false)
  }, [])

  return { showRemarks, handleKeyDown, handleKeyUp }
}
