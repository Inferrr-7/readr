"use client"

import { Sun, Moon, Coffee, Terminal, Circle, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useReadingTheme } from "@/contexts/reading-theme-context"

export default function ReadingThemeSwitcher() {
  const { theme, setTheme, getThemeConfig } = useReadingTheme()
  const [showDropdown, setShowDropdown] = useState(false)

  const themes = [
    { id: "day", icon: Sun, label: "Day", shortcut: "1" },
    { id: "night", icon: Moon, label: "Night", shortcut: "2" },
    { id: "sepia", icon: Coffee, label: "Sepia", shortcut: "3" },
    { id: "console", icon: Terminal, label: "Console", shortcut: "4" },
    { id: "grey", icon: Circle, label: "Grey", shortcut: "5" },
  ]

  const currentTheme = themes.find((t) => t.id === theme)
  const CurrentIcon = currentTheme?.icon || Sun
  const themeConfig = getThemeConfig()

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-1 px-2 py-1.5 rounded transition-colors text-xs ${
          theme === "day"
            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
            : theme === "night"
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
              : theme === "sepia"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : theme === "console"
                  ? "bg-black text-green-400 hover:bg-gray-900 border border-green-400"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        title={`${currentTheme?.label} mode (T to cycle)`}
      >
        <CurrentIcon className="w-3 h-3" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <div
          className={`absolute top-full right-0 mt-1 rounded-lg shadow-lg border z-50 min-w-32 ${
            theme === "day"
              ? "bg-white border-gray-200"
              : theme === "night"
                ? "bg-gray-800 border-gray-600"
                : theme === "sepia"
                  ? "bg-amber-50 border-amber-200"
                  : theme === "console"
                    ? "bg-black border-green-400"
                    : "bg-gray-200 border-gray-400"
          }`}
        >
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            const isActive = theme === themeOption.id

            return (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id as any)
                  setShowDropdown(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  isActive
                    ? theme === "day"
                      ? "bg-blue-100 text-blue-700"
                      : theme === "night"
                        ? "bg-blue-900 text-blue-300"
                        : theme === "sepia"
                          ? "bg-amber-200 text-amber-800"
                          : theme === "console"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-300 text-gray-800"
                    : theme === "day"
                      ? "text-gray-700 hover:bg-gray-100"
                      : theme === "night"
                        ? "text-gray-200 hover:bg-gray-700"
                        : theme === "sepia"
                          ? "text-amber-800 hover:bg-amber-100"
                          : theme === "console"
                            ? "text-green-400 hover:bg-gray-900"
                            : "text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-3 h-3" />
                  <span>{themeOption.label}</span>
                </div>
                <kbd
                  className={`px-1 py-0.5 rounded text-xs ${
                    theme === "day"
                      ? "bg-gray-200 text-gray-600"
                      : theme === "night"
                        ? "bg-gray-700 text-gray-300"
                        : theme === "sepia"
                          ? "bg-amber-200 text-amber-700"
                          : theme === "console"
                            ? "bg-green-900 text-green-300 border border-green-400"
                            : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {themeOption.shortcut}
                </kbd>
              </button>
            )
          })}

          <div
            className={`px-3 py-2 text-xs border-t ${
              theme === "day"
                ? "text-gray-500 border-gray-200"
                : theme === "night"
                  ? "text-gray-400 border-gray-600"
                  : theme === "sepia"
                    ? "text-amber-600 border-amber-200"
                    : theme === "console"
                      ? "text-green-500 border-green-400"
                      : "text-gray-600 border-gray-400"
            }`}
          >
            Press <kbd className="px-1 py-0.5 bg-opacity-50 bg-gray-500 text-white rounded text-xs">T</kbd> to cycle
          </div>
        </div>
      )}
    </div>
  )
}
