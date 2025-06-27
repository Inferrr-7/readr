"use client"

import { useState, useEffect } from "react"

interface ReadingStats {
  todayMinutes: number
  totalMinutes: number
  streak: number
  weeklyData: number[]
  lastSessionDate: string
  sessionsToday: number
  averageSessionLength: number
}

export function useReadingStats() {
  const [stats, setStats] = useState<ReadingStats>({
    todayMinutes: 0,
    totalMinutes: 0,
    streak: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    lastSessionDate: "",
    sessionsToday: 0,
    averageSessionLength: 0,
  })
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    try {
      const saved = localStorage.getItem("reading-stats")
      if (saved) {
        const parsedStats = JSON.parse(saved)
        const today = new Date().toDateString()

        if (parsedStats.lastSessionDate !== today) {
          parsedStats.todayMinutes = 0
          parsedStats.sessionsToday = 0
          parsedStats.lastSessionDate = today
        }

        // Calculate average session length
        if (parsedStats.totalMinutes > 0 && parsedStats.sessionsToday > 0) {
          parsedStats.averageSessionLength = parsedStats.totalMinutes / (parsedStats.sessionsToday || 1)
        }

        setStats(parsedStats)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const saveStats = (newStats: ReadingStats) => {
    try {
      localStorage.setItem("reading-stats", JSON.stringify(newStats))
      setStats(newStats)
    } catch (error) {
      console.error("Error saving stats:", error)
    }
  }

  const startSession = () => {
    setSessionStartTime(Date.now())
  }

  const endSession = () => {
    if (sessionStartTime) {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60
      const today = new Date().toDateString()
      const dayOfWeek = new Date().getDay()

      const newWeeklyData = [...stats.weeklyData]
      newWeeklyData[dayOfWeek] += sessionDuration

      const newSessionsToday = stats.sessionsToday + 1
      const newTotalMinutes = stats.totalMinutes + sessionDuration
      const newTodayMinutes = stats.todayMinutes + sessionDuration

      const newStats: ReadingStats = {
        todayMinutes: newTodayMinutes,
        totalMinutes: newTotalMinutes,
        streak: calculateStreak(stats.streak, stats.lastSessionDate, today),
        weeklyData: newWeeklyData,
        lastSessionDate: today,
        sessionsToday: newSessionsToday,
        averageSessionLength: newTotalMinutes / newSessionsToday,
      }

      saveStats(newStats)
      setSessionStartTime(null)
    }
  }

  const calculateStreak = (currentStreak: number, lastDate: string, today: string): number => {
    if (!lastDate) return 1

    const last = new Date(lastDate)
    const current = new Date(today)
    const diffTime = Math.abs(current.getTime() - last.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return currentStreak + 1
    } else if (diffDays === 0) {
      return currentStreak
    } else {
      return 1
    }
  }

  return {
    stats,
    startSession,
    endSession,
  }
}
