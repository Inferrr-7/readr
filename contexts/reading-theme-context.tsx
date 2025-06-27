"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ReadingTheme = "day" | "night" | "sepia" | "console" | "grey"

interface ReadingThemeContextType {
  theme: ReadingTheme
  setTheme: (theme: ReadingTheme) => void
  cycleTheme: () => void
  getThemeClasses: () => string
  getTextClasses: () => string
  getPDFCanvasFilter: () => string
  getThemeConfig: () => {
    background: string
    text: string
    border: string
    accent: string
  }
}

const ReadingThemeContext = createContext<ReadingThemeContextType | undefined>(undefined)

const themes: ReadingTheme[] = ["day", "night", "sepia", "console", "grey"]

const themeConfigs = {
  day: {
    background: "#ffffff",
    text: "#000000",
    border: "#e5e7eb",
    accent: "#3b82f6",
    uiClasses: "bg-white text-gray-900",
    textClasses: "text-gray-900",
    canvasFilter: "none",
  },
  night: {
    background: "#121212",
    text: "#dddddd",
    border: "#374151",
    accent: "#60a5fa",
    uiClasses: "bg-gray-900 text-gray-100",
    textClasses: "text-gray-100",
    canvasFilter: "invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)",
  },
  sepia: {
    background: "#f4e6d0", // Warmer, more cream-like sepia background matching the image
    text: "#2d1810", // Much darker brown text for excellent contrast like in the image
    border: "#d4b896",
    accent: "#8b5a2b",
    uiClasses: "bg-amber-50 text-amber-900",
    textClasses: "text-amber-900",
    canvasFilter: "sepia(1) saturate(0.9) brightness(1.05) contrast(1.3)", // Higher contrast and slight brightness adjustment
  },
  console: {
    background: "#000000",
    text: "#00ff00",
    border: "#00ff00",
    accent: "#00ff00",
    uiClasses: "bg-black text-green-400",
    textClasses: "text-green-400 font-mono",
    canvasFilter: "invert(1) hue-rotate(90deg) saturate(2) brightness(0.8) contrast(1.3)",
  },
  grey: {
    background: "#c0c0c0",
    text: "#2c2c2c",
    border: "#808080",
    accent: "#4a5568",
    uiClasses: "bg-gray-300 text-gray-800",
    textClasses: "text-gray-800",
    canvasFilter: "grayscale(1) brightness(1.1) contrast(1.1)",
  },
}

export function ReadingThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ReadingTheme>("day")

  useEffect(() => {
    const saved = localStorage.getItem("reading-theme")
    if (saved && themes.includes(saved as ReadingTheme)) {
      setThemeState(saved as ReadingTheme)
    }
  }, [])

  const setTheme = (newTheme: ReadingTheme) => {
    setThemeState(newTheme)
    localStorage.setItem("reading-theme", newTheme)
  }

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeClasses = () => {
    return themeConfigs[theme].uiClasses
  }

  const getTextClasses = () => {
    return themeConfigs[theme].textClasses
  }

  const getPDFCanvasFilter = () => {
    return themeConfigs[theme].canvasFilter
  }

  const getThemeConfig = () => {
    const config = themeConfigs[theme]
    return {
      background: config.background,
      text: config.text,
      border: config.border,
      accent: config.accent,
    }
  }

  return (
    <ReadingThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        getThemeClasses,
        getTextClasses,
        getPDFCanvasFilter,
        getThemeConfig,
      }}
    >
      {children}
    </ReadingThemeContext.Provider>
  )
}

export function useReadingTheme() {
  const context = useContext(ReadingThemeContext)
  if (context === undefined) {
    throw new Error("useReadingTheme must be used within a ReadingThemeProvider")
  }
  return context
}
