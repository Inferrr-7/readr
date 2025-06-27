"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Square, Highlighter, Palette } from "lucide-react"
import { useReadingTimer } from "@/hooks/use-reading-timer"

interface PDFViewerProps {
  file: File
  onEndSession: (sessionMinutes: number) => void
}

interface Highlight {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  page: number
}

export default function PDFViewer({ file, onEndSession }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [highlightColor, setHighlightColor] = useState("#fbbf24")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { elapsedTime, startTimer, stopTimer } = useReadingTimer()

  const highlightColors = [
    { name: "yellow", color: "#fbbf24" },
    { name: "green", color: "#10b981" },
    { name: "blue", color: "#3b82f6" },
    { name: "pink", color: "#ec4899" },
    { name: "purple", color: "#8b5cf6" },
  ]

  useEffect(() => {
    startTimer()
    return () => stopTimer()
  }, [startTimer, stopTimer])

  useEffect(() => {
    const loadPDF = async () => {
      try {
        await file.arrayBuffer()
        const pages = Math.floor(Math.random() * 50) + 10
        setTotalPages(pages)
        renderPage(1)
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    }

    loadPDF()
  }, [file])

  const renderPage = (pageNum: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Make canvas larger for better reading experience
    canvas.width = 900
    canvas.height = 1200

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Page border
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Sample content with better spacing
    ctx.fillStyle = "#374151"
    ctx.font = "24px ui-monospace, monospace"
    ctx.fillText(`Page ${pageNum}`, 80, 80)

    ctx.font = "16px ui-monospace, monospace"
    ctx.fillStyle = "#6b7280"

    const sampleText = [
      "This is a demonstration of the PDF reading interface with highlighting.",
      "Click the highlighter tool and drag to select text for highlighting.",
      "You can choose different colors for your highlights.",
      "",
      "The reading tracker automatically measures your time spent",
      "reading and helps you build consistent daily habits.",
      "",
      "Use the navigation controls below to move between pages,",
      "or use your keyboard arrow keys for quick navigation.",
      "",
      "Press 'H' to toggle highlighting mode quickly.",
    ]

    sampleText.forEach((line, index) => {
      if (line) {
        ctx.fillText(line, 80, 140 + index * 28)
      }
    })

    // Sample paragraphs with better spacing
    const paragraphs = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod",
      "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim",
      "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea",
      "commodo consequat. Duis aute irure dolor in reprehenderit in voluptate",
      "velit esse cillum dolore eu fugiat nulla pariatur.",
      "",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui",
      "officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde",
      "omnis iste natus error sit voluptatem accusantium doloremque laudantium,",
      "totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi",
      "architecto beatae vitae dicta sunt explicabo.",
      "",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut",
      "fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem",
      "sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor",
      "sit amet, consectetur, adipisci velit, sed quia non numquam eius modi",
      "tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
    ]

    paragraphs.forEach((line, index) => {
      if (line) {
        ctx.fillText(line, 80, 450 + index * 24)
      }
    })

    // Render highlights for current page
    highlights
      .filter((h) => h.page === pageNum)
      .forEach((highlight) => {
        ctx.fillStyle = highlight.color + "40" // Add transparency
        ctx.fillRect(highlight.x, highlight.y, highlight.width, highlight.height)
      })
  }

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHighlighting) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) * canvas.width) / rect.width
    const y = ((event.clientY - rect.top) * canvas.height) / rect.height

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const moveX = ((moveEvent.clientX - rect.left) * canvas.width) / rect.width
      const moveY = ((moveEvent.clientY - rect.top) * canvas.height) / rect.height

      // Clear and redraw
      renderPage(currentPage)

      // Draw current selection
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = highlightColor + "40"
        ctx.fillRect(x, y, moveX - x, moveY - y)
      }
    }

    const handleMouseUp = (upEvent: MouseEvent) => {
      const endX = ((upEvent.clientX - rect.left) * canvas.width) / rect.width
      const endY = ((upEvent.clientY - rect.top) * canvas.height) / rect.height

      if (Math.abs(endX - x) > 10 && Math.abs(endY - y) > 10) {
        const newHighlight: Highlight = {
          id: Date.now().toString(),
          x: Math.min(x, endX),
          y: Math.min(y, endY),
          width: Math.abs(endX - x),
          height: Math.abs(endY - y),
          color: highlightColor,
          page: currentPage,
        }

        setHighlights((prev) => [...prev, newHighlight])
      }

      renderPage(currentPage)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
      renderPage(pageNum)
    }
  }

  const handleEndSession = () => {
    const sessionMinutes = elapsedTime / 60
    stopTimer()
    onEndSession(sessionMinutes)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPage(currentPage - 1)
      } else if (event.key === "ArrowRight") {
        goToPage(currentPage + 1)
      } else if (event.key === "h" || event.key === "H") {
        setIsHighlighting(!isHighlighting)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentPage, totalPages, isHighlighting])

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-blue-950">
      {/* PDF Content - Maximized */}
      <div className="flex-1 flex items-center justify-center p-2" ref={containerRef}>
        <div className="bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-800 shadow-sm overflow-hidden relative max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full block ${isHighlighting ? "cursor-crosshair" : "cursor-default"}`}
            onMouseDown={handleCanvasMouseDown}
          />

          {/* Highlight Controls - Floating */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 bg-white/90 dark:bg-blue-800/90 backdrop-blur-sm border border-gray-200 dark:border-blue-600 rounded-lg hover:bg-white dark:hover:bg-blue-800 transition-colors shadow-sm"
                title="Choose highlight color"
              >
                <Palette className="w-4 h-4 text-gray-600 dark:text-blue-300" />
              </button>

              {showColorPicker && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-blue-800 border border-gray-200 dark:border-blue-600 rounded-lg p-3 shadow-lg z-10">
                  <div className="grid grid-cols-5 gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setHighlightColor(color.color)
                          setShowColorPicker(false)
                        }}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${
                          highlightColor === color.color
                            ? "border-gray-800 dark:border-blue-200 scale-110"
                            : "border-gray-300 dark:border-blue-600 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsHighlighting(!isHighlighting)}
              className={`p-2 backdrop-blur-sm border rounded-lg transition-colors shadow-sm ${
                isHighlighting
                  ? "bg-blue-100 dark:bg-blue-700 border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-200"
                  : "bg-white/90 dark:bg-blue-800/90 border-gray-200 dark:border-blue-600 text-gray-600 dark:text-blue-300 hover:bg-white dark:hover:bg-blue-800"
              }`}
              title={isHighlighting ? "Exit highlighting mode (H)" : "Start highlighting (H)"}
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Compact */}
      <div className="bg-white dark:bg-blue-900 border-t border-gray-200 dark:border-blue-800 px-4 py-3">
        <div className="flex items-center justify-between font-mono">
          <button
            onClick={handleEndSession}
            className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg transition-colors text-sm"
          >
            <Square className="w-3 h-3" />
            <span>end session</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 hover:bg-gray-100 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-blue-300" />
            </button>

            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 dark:bg-blue-800 rounded-lg text-sm">
              <span className="tabular-nums text-gray-800 dark:text-blue-100">{currentPage}</span>
              <span className="text-gray-400 dark:text-blue-400">/</span>
              <span className="tabular-nums text-gray-500 dark:text-blue-300">{totalPages}</span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 hover:bg-gray-100 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-blue-300" />
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-blue-400">← → nav • h highlight</div>
        </div>
      </div>
    </div>
  )
}
