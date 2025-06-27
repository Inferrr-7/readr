"use client"

import { Clock, Target, TrendingUp, Award } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import MetricsBar from "@/components/metrics-bar"

export default function ProfileView() {
  const { stats } = useReadingStats()

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h${mins > 0 ? `${mins}m` : ""}`
  }

  const dailyGoal = stats.dailyGoal
  const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

  return (
    <div className="h-screen flex flex-col">
      <MetricsBar />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto font-mono">
          <h1 className="text-2xl text-gray-800 dark:text-blue-100 mb-8">profile</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-blue-300">today</span>
              </div>
              <div className="text-xl text-gray-800 dark:text-blue-100">{formatTime(stats.todayMinutes)}</div>
            </div>

            <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-blue-300">total</span>
              </div>
              <div className="text-xl text-gray-800 dark:text-blue-100">{formatTime(stats.totalMinutes)}</div>
            </div>

            <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <span className="text-sm text-gray-600 dark:text-blue-300">streak</span>
              </div>
              <div className="text-xl text-gray-800 dark:text-blue-100">{stats.streak} days</div>
            </div>

            <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="text-sm text-gray-600 dark:text-blue-300">goal</span>
              </div>
              <div className="text-xl text-gray-800 dark:text-blue-100">{Math.floor(goalProgress)}%</div>
            </div>
          </div>

          {/* Daily Goal Progress */}
          <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-6 mb-8">
            <h2 className="text-lg text-gray-800 dark:text-blue-100 mb-4">daily goal progress</h2>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600 dark:text-blue-300">
                {Math.floor(stats.todayMinutes)} / {dailyGoal} minutes
              </span>
              <span className="text-gray-800 dark:text-blue-100">{Math.floor(goalProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-6">
            <h2 className="text-lg text-gray-800 dark:text-blue-100 mb-6">weekly activity</h2>
            <div className="grid grid-cols-7 gap-3">
              {stats.weeklyData.map((minutes, index) => {
                const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
                const maxHeight = Math.max(...stats.weeklyData, 30)
                const height = Math.max((minutes / maxHeight) * 80, minutes > 0 ? 8 : 0)

                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-blue-400 mb-2">{dayNames[index]}</div>
                    <div className="h-20 flex items-end justify-center bg-gray-50 dark:bg-blue-800/50 rounded-lg">
                      {minutes > 0 && (
                        <div
                          className="w-4 bg-blue-500 dark:bg-blue-400 rounded-t transition-all duration-300"
                          style={{ height: `${height}px` }}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-blue-300 mt-2">{Math.floor(minutes)}m</div>
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
