"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ReadingStats {
  todayMinutes: number
  totalMinutes: number
  streak: number
  weeklyData: number[]
  lastSessionDate: string
  sessionsToday: number
  dailyGoal: number
}

interface ReadingStatsContextType {
  stats: ReadingStats
  startSession: () => void
  endSession: () => void
  updateDailyGoal: (goal: number) => void
}

const ReadingStatsContext = createContext<ReadingStatsContextType | undefined>(undefined)

export function ReadingStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ReadingStats>({
    todayMinutes: 0,
    totalMinutes: 0,
    streak: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    lastSessionDate: "",
    sessionsToday: 0,
    dailyGoal: 30,
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

      const newStats: ReadingStats = {
        todayMinutes: stats.todayMinutes + sessionDuration,
        totalMinutes: stats.totalMinutes + sessionDuration,
        streak: calculateStreak(stats.streak, stats.lastSessionDate, today),
        weeklyData: newWeeklyData,
        lastSessionDate: today,
        sessionsToday: stats.sessionsToday + 1,
        dailyGoal: stats.dailyGoal,
      }

      saveStats(newStats)
      setSessionStartTime(null)

      // Check for goal completion
      const goalProgress = Math.min((newStats.todayMinutes / newStats.dailyGoal) * 100, 100)

      if (goalProgress >= 100 && stats.todayMinutes < stats.dailyGoal) {
        showGoalCompleteMessage()
      } else {
        showSessionCompleteMessage(sessionDuration)
      }
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

  const showSessionCompleteMessage = (sessionMinutes: number) => {
    const messages = [
      `Great! You just read for ${Math.floor(sessionMinutes)} minutes. Keep it up!`,
      `Excellent session! ${Math.floor(sessionMinutes)} minutes of focused reading.`,
      `Well done! You're building a great reading habit.`,
      `Amazing! Another ${Math.floor(sessionMinutes)} minutes towards your goal.`,
    ]

    const message = messages[Math.floor(Math.random() * messages.length)]

    // Simple alert for now - could be replaced with a toast notification
    setTimeout(() => {
      alert(message)
    }, 500)
  }

  const showGoalCompleteMessage = () => {
    setTimeout(() => {
      alert("🎯 Congratulations! You've reached your daily reading goal!")
    }, 500)
  }

  const updateDailyGoal = (goal: number) => {
    const newStats = { ...stats, dailyGoal: goal }
    saveStats(newStats)
  }

  return (
    <ReadingStatsContext.Provider value={{ stats, startSession, endSession, updateDailyGoal }}>
      {children}
    </ReadingStatsContext.Provider>
  )
}

export function useReadingStats() {
  const context = useContext(ReadingStatsContext)
  if (context === undefined) {
    throw new Error("useReadingStats must be used within a ReadingStatsProvider")
  }
  return context
}
