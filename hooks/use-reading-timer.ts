"use client"

import { useState, useCallback, useRef } from "react"

export function useReadingTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)

  const startTimer = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now()
      setIsRunning(true)
    }
  }, [isRunning])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
    startTimeRef.current = null
  }, [])

  const getSessionTime = useCallback(() => {
    if (startTimeRef.current) {
      return Math.floor((Date.now() - startTimeRef.current) / 1000 / 60) // Return minutes
    }
    return 0
  }, [])

  return {
    isRunning,
    startTimer,
    stopTimer,
    getSessionTime,
  }
}
