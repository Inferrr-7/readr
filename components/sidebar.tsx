"use client"

import { BookOpen, User, HelpCircle, Moon, Sun } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import { useTheme } from "@/contexts/theme-context"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
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
    <div className="fixed left-0 top-0 h-full w-16 bg-white dark:bg-blue-900 border-r border-gray-200 dark:border-blue-800 flex flex-col z-50">
      {/* App Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-blue-800">
        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">R</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="space-y-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors group relative ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-blue-800/50 hover:text-gray-800 dark:hover:text-blue-200"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {item.label}
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Stats */}
      {stats.todayMinutes > 0 && (
        <div className="px-2 py-2 border-t border-gray-200 dark:border-blue-800">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-blue-400 mb-1">today</div>
            <div className="text-xs font-medium text-gray-800 dark:text-blue-200">{formatTime(stats.todayMinutes)}</div>
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="p-2 border-t border-gray-200 dark:border-blue-800">
        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-600 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-blue-800/50 hover:text-gray-800 dark:hover:text-blue-200 transition-colors group relative"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}

          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-blue-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {isDark ? "light mode" : "dark mode"}
          </div>
        </button>
      </div>
    </div>
  )
}
