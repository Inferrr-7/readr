"use client"

import { Clock, Target, Flame } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import { useReadingTimer } from "@/hooks/use-reading-timer"

export default function MetricsPanel() {
  const { stats } = useReadingStats()
  const { elapsedTime, isRunning } = useReadingTimer()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
  }

  const dailyGoal = 30
  const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Current Session */}
        <div className="flex items-center space-x-6">
          {isRunning && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Session:</span>
              <span className="font-mono text-lg text-gray-800">{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>

        {/* Center: Key Metrics */}
        <div className="flex items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Today:</span>
            <span className="font-medium text-gray-800">{formatMinutes(stats.todayMinutes)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Goal:</span>
            <span className="font-medium text-gray-800">{Math.floor(goalProgress)}%</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">Streak:</span>
            <span className="font-medium text-gray-800">{stats.streak} days</span>
          </div>
        </div>

        {/* Right: Total Stats */}
        <div className="text-sm text-gray-600">
          <span>Total: </span>
          <span className="font-medium text-gray-800">{formatMinutes(stats.totalMinutes)}</span>
        </div>
      </div>
    </div>
  )
}
