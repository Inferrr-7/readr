"use client"

import { Card } from "@/components/ui/card"

interface ReadingStatsProps {
  stats: {
    todayMinutes: number
    totalMinutes: number
    streak: number
    weeklyData: number[]
    sessionsToday: number
    averageSessionLength: number
  }
  compact?: boolean
}

export default function ReadingMetrics({ stats, compact = false }: ReadingStatsProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
  }

  const todayGoal = 30
  const goalProgress = Math.min((stats.todayMinutes / todayGoal) * 100, 100)

  if (compact) {
    return (
      <div className="text-sm text-neutral-500 font-light">
        {stats.todayMinutes > 0 && (
          <span>
            Today: <span className="text-neutral-700">{formatTime(stats.todayMinutes)}</span>
            {stats.streak > 1 && (
              <>
                {" • "}
                Streak: <span className="text-neutral-700">{stats.streak} days</span>
              </>
            )}
          </span>
        )}
      </div>
    )
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <div className="p-8">
        {/* Metrics Row */}
        <div className="text-sm text-neutral-600 mb-6 font-light">
          <span className="text-neutral-500">Metrics:</span>{" "}
          <span>
            Today: <span className="text-neutral-800 font-normal">{formatTime(stats.todayMinutes)}</span>
            {stats.todayMinutes > 0 && (
              <span className="text-neutral-500">
                {" "}
                ({stats.sessionsToday} session{stats.sessionsToday !== 1 ? "s" : ""})
              </span>
            )}
          </span>{" "}
          <span>
            Total: <span className="text-neutral-800 font-normal">{formatTime(stats.totalMinutes)}</span>
          </span>{" "}
          {stats.streak > 0 && (
            <span>
              Streak: <span className="text-neutral-800 font-normal">{stats.streak}</span>
              <span className="text-neutral-500"> days</span>
            </span>
          )}
        </div>

        {/* Current Session Info */}
        {stats.averageSessionLength > 0 && (
          <div className="text-sm text-neutral-600 mb-6 font-light">
            <span className="text-neutral-500">Average session:</span>{" "}
            <span className="text-neutral-800 font-normal">{formatTime(stats.averageSessionLength)}</span>
          </div>
        )}

        {/* Daily Goal Progress */}
        <div className="text-sm text-neutral-600 mb-4 font-light">
          <span className="text-neutral-500">Daily goal:</span>{" "}
          <span className="text-neutral-800 font-normal">{Math.floor(stats.todayMinutes)}</span>
          <span className="text-neutral-500">/{todayGoal} minutes</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-neutral-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        {/* Weekly Activity */}
        {stats.weeklyData.some((day) => day > 0) && (
          <div className="border-t border-neutral-100 pt-6">
            <div className="text-sm text-neutral-500 mb-4 font-light">This week:</div>
            <div className="grid grid-cols-7 gap-2">
              {stats.weeklyData.map((minutes, index) => {
                const dayNames = ["S", "M", "T", "W", "T", "F", "S"]
                const maxHeight = Math.max(...stats.weeklyData, 30)
                const height = Math.max((minutes / maxHeight) * 32, minutes > 0 ? 4 : 0)

                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-neutral-400 mb-2 font-light">{dayNames[index]}</div>
                    <div className="h-8 flex items-end justify-center">
                      <div
                        className={`w-3 rounded-sm transition-all duration-300 ${
                          minutes > 0 ? "bg-neutral-400" : "bg-neutral-100"
                        }`}
                        style={{ height: `${height}px` }}
                      />
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 font-light">
                      {minutes > 0 ? Math.floor(minutes) : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {stats.todayMinutes > 0 && (
          <div className="mt-6 text-center">
            <div className="text-sm text-neutral-600 font-light">
              {goalProgress >= 100
                ? "🎯 Daily goal completed!"
                : goalProgress >= 50
                  ? "📚 Great progress today"
                  : "📖 Keep building your reading habit"}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
