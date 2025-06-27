"use client"

import React from "react"

import { useState, useRef } from "react"

interface ReadingProgressBarProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function ReadingProgressBar({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: ReadingProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  const progress = (currentPage / totalPages) * 100

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleMouseMove(e)
  }

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const newPage = Math.max(1, Math.min(totalPages, Math.round((percentage / 100) * totalPages)))

    onPageChange(newPage)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
      const handleGlobalMouseUp = () => setIsDragging(false)

      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove)
        document.removeEventListener("mouseup", handleGlobalMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono tabular-nums min-w-0">{currentPage}</span>

      <div
        ref={progressRef}
        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative"
        onMouseDown={handleMouseDown}
      >
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />

        {/* Draggable handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transition-all duration-150 ${
            isDragging ? "scale-125" : "scale-100"
          }`}
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>

      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono tabular-nums min-w-0">{totalPages}</span>
    </div>
  )
}
