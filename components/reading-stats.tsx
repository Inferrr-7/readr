"use client"

import { Clock, Flame, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ReadingStatsProps {
  stats: {
    todayMinutes: number
    totalMinutes: number
    streak: number
    weeklyData: number[]
  }
}

export default function ReadingStats({ stats }: ReadingStatsProps) {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <div className="p-10">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-light text-neutral-800 mb-2 tracking-tight">Your Progress</h3>
          <p className="text-neutral-500 font-light">Building consistent reading habits</p>
        </div>

        <div className="space-y-8">
          {/* Today's Reading */}
          <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-neutral-800 font-light">Today's reading</div>
                <div className="text-xs text-neutral-500 font-light">Current session progress</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-neutral-800 tabular-nums">{Math.floor(stats.todayMinutes)}</div>
              <div className="text-xs text-neutral-500 font-light">minutes</div>
            </div>
          </div>

          {/* Total Reading */}
          <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-neutral-800 font-light">Total reading time</div>
                <div className="text-xs text-neutral-500 font-light">All-time progress</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-neutral-800 tabular-nums">{Math.floor(stats.totalMinutes)}</div>
              <div className="text-xs text-neutral-500 font-light">minutes</div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-neutral-800 font-light">Reading streak</div>
                <div className="text-xs text-neutral-500 font-light">Consecutive days</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-neutral-800 tabular-nums">{stats.streak}</div>
              <div className="text-xs text-neutral-500 font-light">days</div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {stats.todayMinutes > 0 && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="text-xl">{stats.todayMinutes >= 30 ? "🌟" : "📖"}</div>
              <p className="text-blue-800 font-light">
                {stats.todayMinutes >= 30
                  ? "Wonderful! You've achieved your daily reading goal."
                  : "You're building a beautiful reading habit. Keep going!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
