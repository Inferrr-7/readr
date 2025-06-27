"use client"

import { useReadingStats } from "@/contexts/reading-stats-context"
import { useReadingTimer } from "@/hooks/use-reading-timer"

export default function MetricsBar() {
  const { stats } = useReadingStats()
  const { elapsedTime, isRunning } = useReadingTimer()

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const formatMinutes = (minutes: number) => {
    return `${Math.floor(minutes)}m`
  }

  const dailyGoal = stats.dailyGoal
  const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

  return (
    <div className="bg-white dark:bg-blue-900 border-b border-gray-200 dark:border-blue-800 px-4 py-3">
      <div className="flex items-center justify-between font-mono text-sm">
        {/* Left: Current Session */}
        <div className="flex items-center space-x-4">
          {isRunning && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-blue-300">session:</span>
              <span className="text-gray-800 dark:text-blue-100 font-medium tabular-nums">
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}
        </div>

        {/* Center: Key Metrics */}
        <div className="flex items-center space-x-6 text-gray-600 dark:text-blue-300">
          <span>
            today: <span className="text-gray-800 dark:text-blue-100">{formatMinutes(stats.todayMinutes)}</span>
          </span>
          <span>
            goal:{" "}
            <span
              className={
                goalProgress >= 100 ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-blue-100"
              }
            >
              {Math.floor(goalProgress)}%
            </span>
          </span>
          <span>
            streak: <span className="text-gray-800 dark:text-blue-100">{stats.streak}</span>
          </span>
          <span>
            total: <span className="text-gray-800 dark:text-blue-100">{formatMinutes(stats.totalMinutes)}</span>
          </span>
        </div>

        {/* Right: Goal Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-blue-400">
            {Math.floor(stats.todayMinutes)}/{stats.dailyGoal}m
          </span>
          <div className="w-16 h-1 bg-gray-200 dark:bg-blue-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
