"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"

interface SessionCompleteModalProps {
  sessionMinutes: number
  onClose: () => void
}

export default function SessionCompleteModal({ sessionMinutes, onClose }: SessionCompleteModalProps) {
  const { stats } = useReadingStats()

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const formatTime = (minutes: number) => {
    return `${Math.floor(minutes)}m`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 p-6 max-w-md w-full mx-4 font-mono shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-800 dark:text-blue-100">session complete</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-blue-400 hover:text-gray-700 dark:hover:text-blue-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-blue-300">session time:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">+{formatTime(sessionMinutes)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-blue-300">today total:</span>
            <span className="text-gray-800 dark:text-blue-100">{formatTime(stats.todayMinutes)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-blue-300">streak:</span>
            <span className="text-blue-600 dark:text-blue-400">{stats.streak} days</span>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-blue-800">
            <p className="text-center text-gray-600 dark:text-blue-300">
              {stats.todayMinutes >= 30
                ? "🎯 daily goal achieved!"
                : sessionMinutes >= 10
                  ? "📚 great progress!"
                  : "📖 keep building your habit!"}
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            continue
          </button>
        </div>
      </div>
    </div>
  )
}
