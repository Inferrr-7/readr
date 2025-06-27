"use client"

import { ArrowLeft, Clock, Target, TrendingUp, Award } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import { usePDFLibrary } from "@/contexts/pdf-library-context"

interface StatsViewProps {
  onBack: () => void
}

export default function StatsView({ onBack }: StatsViewProps) {
  const { stats, updateDailyGoal } = useReadingStats()
  const { getTotalTime } = usePDFLibrary()

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h${mins > 0 ? `${mins}m` : ""}`
  }

  const dailyGoal = stats.dailyGoal
  const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-blue-950">
      {/* Minimal Top Bar */}
      <div className="border-b border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-900">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Back to library"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gray-600 dark:text-blue-300" />
            </button>
            <span className="text-xs text-gray-800 dark:text-blue-100">statistics</span>
          </div>
        </div>

        {/* Goal Progress Bar */}
        <div className="h-1 bg-gray-100 dark:bg-blue-800">
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Content */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                <span className="text-xs text-gray-600 dark:text-blue-300">today</span>
              </div>
              <div className="text-lg text-gray-800 dark:text-blue-100">{formatTime(stats.todayMinutes)}</div>
            </div>

            <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-3 h-3 text-green-500 dark:text-green-400" />
                <span className="text-xs text-gray-600 dark:text-blue-300">total sessions</span>
              </div>
              <div className="text-lg text-gray-800 dark:text-blue-100">{formatTime(stats.totalMinutes)}</div>
            </div>

            <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                <span className="text-xs text-gray-600 dark:text-blue-300">streak</span>
              </div>
              <div className="text-lg text-gray-800 dark:text-blue-100">{stats.streak} days</div>
            </div>

            <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                <span className="text-xs text-gray-600 dark:text-blue-300">library total</span>
              </div>
              <div className="text-lg text-gray-800 dark:text-blue-100">{formatTime(getTotalTime())}</div>
            </div>
          </div>

          {/* Goal Settings */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4 mb-6">
            <h2 className="text-sm text-gray-800 dark:text-blue-100 mb-3">daily goal settings</h2>
            <div className="flex items-center space-x-3">
              <label className="text-xs text-gray-600 dark:text-blue-300">target minutes per day:</label>
              <input
                type="number"
                min="5"
                max="300"
                value={dailyGoal}
                onChange={(e) => updateDailyGoal(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-blue-600 bg-white dark:bg-blue-800 text-gray-800 dark:text-blue-100 rounded"
              />
              <span className="text-xs text-gray-500 dark:text-blue-400">minutes</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-blue-400 mt-2">
              adjust your daily reading goal to match your schedule and habits
            </p>
          </div>

          {/* Enhanced Daily Goal Progress */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-gray-800 dark:text-blue-100">daily reading goal</h2>
              {goalProgress >= 100 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ completed</span>
              )}
            </div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-gray-600 dark:text-blue-300">
                {Math.floor(stats.todayMinutes)} / {dailyGoal} minutes
              </span>
              <span
                className={`font-medium ${
                  goalProgress >= 100 ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-blue-100"
                }`}
              >
                {Math.floor(goalProgress)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-blue-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  goalProgress >= 100 ? "bg-green-500 dark:bg-green-400" : "bg-blue-500 dark:bg-blue-400"
                }`}
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            {goalProgress >= 100 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                Great job! You've built a strong reading habit today.
              </p>
            )}
          </div>

          {/* Weekly Activity */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4">
            <h2 className="text-sm text-gray-800 dark:text-blue-100 mb-4">weekly activity</h2>
            <div className="grid grid-cols-7 gap-2">
              {stats.weeklyData.map((minutes, index) => {
                const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
                const maxHeight = Math.max(...stats.weeklyData, 30)
                const height = Math.max((minutes / maxHeight) * 60, minutes > 0 ? 6 : 0)

                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-blue-400 mb-1">{dayNames[index]}</div>
                    <div className="h-16 flex items-end justify-center bg-gray-50 dark:bg-blue-800/50">
                      {minutes > 0 && (
                        <div
                          className="w-3 bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                          style={{ height: `${height}px` }}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-blue-300 mt-1">{Math.floor(minutes)}m</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
