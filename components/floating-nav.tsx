"use client"

import { BookOpen, User, HelpCircle, Moon, Sun } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import { useTheme } from "@/contexts/theme-context"

interface FloatingNavProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function FloatingNav({ currentView, onViewChange }: FloatingNavProps) {
  const { stats } = useReadingStats()
  const { isDark, toggleTheme } = useTheme()

  const menuItems = [
    { id: "practice", icon: BookOpen, label: "practice" },
    { id: "profile", icon: User, label: "profile" },
    { id: "help", icon: HelpCircle, label: "help" },
  ]

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h${mins > 0 ? `${mins}m` : ""}`
  }

  return (
    <>
      {/* Top floating bar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        {/* Left: App name and today's progress */}
        <div className="flex items-center space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
          <span className="text-sm font-mono text-gray-800 dark:text-gray-200">readr</span>
          {stats.todayMinutes > 0 && (
            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
              today: <span className="text-gray-800 dark:text-gray-200">{formatTime(stats.todayMinutes)}</span>
            </span>
          )}
        </div>

        {/* Right: Theme toggle */}
        <button
          onClick={toggleTheme}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Left floating navigation */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col space-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`p-2 rounded transition-colors ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
