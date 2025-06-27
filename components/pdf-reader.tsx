"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Highlighter, X, Menu, Bookmark, BookmarkCheck } from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import { usePDFLibrary } from "@/contexts/pdf-library-context"
import { useReadingTimer } from "@/hooks/use-reading-timer"
import { useReadingTheme } from "@/contexts/reading-theme-context"
import ReadingProgressBar from "@/components/reading-progress-bar"
import ReadingThemeSwitcher from "@/components/reading-theme-switcher"
import ReadingNavDrawer from "@/components/reading-nav-drawer"

interface PDFReaderProps {
  pdfId: string
  onBack: () => void
}

interface Highlight {
  id: string
  pageNumber: number
  text: string
  startOffset: number
  endOffset: number
  color: string
  createdAt: string
}

export default function PDFReader({ pdfId, onBack }: PDFReaderProps) {
  const { stats } = useReadingStats()
  const {
    getPDF,
    updatePDF,
    addHighlight,
    removeHighlight,
    addBookmark,
    removeBookmark,
    addToHistory,
    updateScrollPosition,
  } = usePDFLibrary()
  const { startSession, endSession } = useReadingStats()
  const { startTimer, stopTimer } = useReadingTimer()
  const { theme, setTheme, cycleTheme, getThemeClasses, getPDFCanvasFilter, getThemeConfig } = useReadingTheme()

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showGoalComplete, setShowGoalComplete] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [showHighlightTooltip, setShowHighlightTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [highlightColor, setHighlightColor] = useState("#fbbf24")
  const [showNavDrawer, setShowNavDrawer] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const textLayerRefs = useRef<(HTMLDivElement | null)[]>([])
  const sessionStartTimeRef = useRef<number | null>(null)
  const scrollSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const lastHistoryPageRef = useRef<number>(0)

  const pdf = getPDF(pdfId)
  const themeConfig = getThemeConfig()
  const canvasFilter = getPDFCanvasFilter()

  // Initialize session only once
  useEffect(() => {
    if (!pdf || isInitializedRef.current) return

    isInitializedRef.current = true
    sessionStartTimeRef.current = Date.now()
    startSession()
    startTimer()

    // Update last opened without causing re-renders
    setTimeout(() => {
      updatePDF(pdfId, { lastOpened: new Date().toISOString() })
    }, 100)

    // Simulate PDF loading
    const pages = Math.floor(Math.random() * 50) + 10
    setTotalPages(pages)
    canvasRefs.current = new Array(pages).fill(null)
    textLayerRefs.current = new Array(pages).fill(null)

    // Set initial page from saved data
    const initialPage = pdf.currentPage || 1
    setCurrentPage(initialPage)
    lastHistoryPageRef.current = initialPage

    // Render first few pages
    setTimeout(() => {
      for (let i = 0; i < Math.min(pages, 3); i++) {
        renderPage(i + 1)
      }

      // Restore scroll position after pages are rendered
      if (pdf.lastScrollPosition > 0) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = pdf.lastScrollPosition
          }
        }, 200)
      }
    }, 200)
  }, [pdf])

  // Re-render pages when theme changes
  useEffect(() => {
    if (totalPages > 0) {
      // Re-render visible pages when theme changes
      setTimeout(() => {
        for (let i = 0; i < Math.min(totalPages, 5); i++) {
          renderPage(i + 1)
        }
      }, 100)
    }
  }, [theme, totalPages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionStartTimeRef.current && pdf) {
        const sessionMinutes = (Date.now() - sessionStartTimeRef.current) / 1000 / 60
        if (sessionMinutes > 0) {
          updatePDF(pdfId, {
            totalTime: pdf.totalTime + sessionMinutes,
          })
          endSession()
        }
      }
      stopTimer()

      // Clear timeouts
      if (scrollSaveTimeoutRef.current) {
        clearTimeout(scrollSaveTimeoutRef.current)
      }
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current)
      }
    }
  }, [])

  // Check for goal completion
  useEffect(() => {
    const dailyGoal = stats.dailyGoal
    const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

    if (goalProgress >= 100 && !showGoalComplete && stats.todayMinutes > 0) {
      setShowGoalComplete(true)
      setTimeout(() => setShowGoalComplete(false), 3000)
    }
  }, [stats.todayMinutes, stats.dailyGoal, showGoalComplete])

  // Debounced history update - only when page actually changes
  useEffect(() => {
    if (currentPage > 0 && isInitializedRef.current && currentPage !== lastHistoryPageRef.current) {
      lastHistoryPageRef.current = currentPage

      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current)
      }

      historyTimeoutRef.current = setTimeout(() => {
        addToHistory(pdfId, currentPage)
      }, 5000)
    }
  }, [currentPage])

  const renderPage = useCallback(
    (pageNum: number) => {
      const canvas = canvasRefs.current[pageNum - 1]
      const textLayer = textLayerRefs.current[pageNum - 1]
      if (!canvas || !textLayer) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size for better readability
      canvas.width = 700
      canvas.height = 900

      // Use theme colors for rendering
      const bgColor = themeConfig.background
      const textColor = themeConfig.text
      const borderColor = themeConfig.border

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Page border
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

      // Content
      ctx.fillStyle = textColor
      const fontFamily = theme === "console" ? "ui-monospace, monospace" : "ui-monospace, monospace"
      ctx.font = `20px ${fontFamily}`
      ctx.fillText(`Page ${pageNum}`, 60, 60)

      ctx.font = `14px ${fontFamily}`

      const sampleText = [
        `This is page ${pageNum} of the PDF document.`,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
        "",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse",
        "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat",
        "cupidatat non proident, sunt in culpa qui officia deserunt.",
        "",
        "Mollit anim id est laborum. Sed ut perspiciatis unde omnis iste",
        "natus error sit voluptatem accusantium doloremque laudantium.",
      ]

      sampleText.forEach((line, index) => {
        if (line) {
          ctx.fillText(line, 60, 120 + index * 24)
        }
      })

      // Add more content for variety
      const paragraphs = [
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui",
        "blanditiis praesentium voluptatum deleniti atque corrupti quos",
        "dolores et quas molestias excepturi sint occaecati cupiditate",
        "non provident, similique sunt in culpa qui officia deserunt.",
        "",
        "Mollitia animi, id est laborum et dolorum fuga. Et harum quidem",
        "rerum facilis est et expedita distinctio. Nam libero tempore,",
        "cum soluta nobis est eligendi optio cumque nihil impedit quo",
        "minus id quod maxime placeat facere possimus.",
      ]

      paragraphs.forEach((line, index) => {
        if (line) {
          ctx.fillText(line, 60, 400 + index * 20)
        }
      })

      // Render text layer for selection
      renderTextLayer(pageNum, textLayer)

      // Apply highlights for this page
      applyHighlights(pageNum, textLayer)
    },
    [theme, themeConfig],
  )

  const renderTextLayer = useCallback(
    (pageNum: number, textLayer: HTMLDivElement) => {
      // Clear existing content
      textLayer.innerHTML = ""

      // Sample text content that matches the canvas
      const textContent = [
        `Page ${pageNum}`,
        `This is page ${pageNum} of the PDF document.`,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse",
        "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat",
        "cupidatat non proident, sunt in culpa qui officia deserunt.",
        "Mollit anim id est laborum. Sed ut perspiciatis unde omnis iste",
        "natus error sit voluptatem accusantium doloremque laudantium.",
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui",
        "blanditiis praesentium voluptatum deleniti atque corrupti quos",
        "dolores et quas molestias excepturi sint occaecati cupiditate",
        "non provident, similique sunt in culpa qui officia deserunt.",
        "Mollitia animi, id est laborum et dolorum fuga. Et harum quidem",
        "rerum facilis est et expedita distinctio. Nam libero tempore,",
        "cum soluta nobis est eligendi optio cumque nihil impedit quo",
        "minus id quod maxime placeat facere possimus.",
      ]

      textContent.forEach((text, index) => {
        if (text.trim()) {
          const span = document.createElement("span")
          span.textContent = text
          span.className = "text-transparent select-text cursor-text"
          span.style.position = "absolute"
          span.style.left = "60px"
          span.style.top = index === 0 ? "40px" : `${100 + index * 24}px`
          span.style.fontSize = index === 0 ? "20px" : "14px"
          span.style.fontFamily = theme === "console" ? "ui-monospace, monospace" : "ui-monospace, monospace"
          span.style.lineHeight = "1.2"
          span.style.whiteSpace = "nowrap"
          span.setAttribute("data-text-index", index.toString())
          textLayer.appendChild(span)
        }
      })
    },
    [theme],
  )

  const applyHighlights = useCallback(
    (pageNum: number, textLayer: HTMLDivElement) => {
      if (!pdf) return

      const pageHighlights = pdf.highlights.filter((h) => h.pageNumber === pageNum)

      pageHighlights.forEach((highlight) => {
        const spans = textLayer.querySelectorAll("span")
        spans.forEach((span) => {
          if (span.textContent && span.textContent.includes(highlight.text)) {
            const highlightSpan = document.createElement("mark")
            // Ensure highlights remain visible in all themes
            highlightSpan.style.backgroundColor = highlight.color + "80"
            highlightSpan.style.color = "inherit"
            highlightSpan.style.padding = "2px 0"
            highlightSpan.style.mixBlendMode = theme === "night" ? "multiply" : "normal"
            highlightSpan.textContent = highlight.text
            highlightSpan.className = "highlight"
            highlightSpan.setAttribute("data-highlight-id", highlight.id)

            // Add click handler to remove highlight
            highlightSpan.addEventListener("click", (e) => {
              e.stopPropagation()
              if (confirm("Remove this highlight?")) {
                removeHighlight(pdfId, highlight.id)
                setTimeout(() => renderPage(pageNum), 100)
              }
            })

            // Replace text with highlighted version
            const textContent = span.textContent
            const highlightIndex = textContent.indexOf(highlight.text)
            if (highlightIndex !== -1) {
              span.innerHTML = ""

              // Add text before highlight
              if (highlightIndex > 0) {
                const beforeText = document.createTextNode(textContent.substring(0, highlightIndex))
                span.appendChild(beforeText)
              }

              // Add highlight
              span.appendChild(highlightSpan)

              // Add text after highlight
              if (highlightIndex + highlight.text.length < textContent.length) {
                const afterText = document.createTextNode(textContent.substring(highlightIndex + highlight.text.length))
                span.appendChild(afterText)
              }
            }
          }
        })
      })
    },
    [pdf, pdfId, removeHighlight, renderPage, theme],
  )

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight

    // Calculate current page based on scroll position
    const pageHeight = 900 + 40
    const newCurrentPage = Math.floor(scrollTop / pageHeight) + 1
    setCurrentPage(Math.min(newCurrentPage, totalPages))

    // Save scroll position with debouncing
    if (scrollSaveTimeoutRef.current) {
      clearTimeout(scrollSaveTimeoutRef.current)
    }

    scrollSaveTimeoutRef.current = setTimeout(() => {
      updateScrollPosition(pdfId, scrollTop, newCurrentPage)
    }, 2000)

    // Lazy load pages as user scrolls
    const visibleStart = Math.floor(scrollTop / pageHeight)
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / pageHeight)

    for (let i = visibleStart; i <= Math.min(visibleEnd + 2, totalPages - 1); i++) {
      if (canvasRefs.current[i] && !canvasRefs.current[i]?.hasAttribute("data-rendered")) {
        canvasRefs.current[i]?.setAttribute("data-rendered", "true")
        setTimeout(() => renderPage(i + 1), 50)
      }
    }
  }, [totalPages, renderPage, pdfId, updateScrollPosition])

  const handlePageChange = useCallback((page: number) => {
    if (containerRef.current) {
      const pageHeight = 900 + 40
      const scrollTop = (page - 1) * pageHeight
      containerRef.current.scrollTo({ top: scrollTop, behavior: "smooth" })
    }
  }, [])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setShowHighlightTooltip(false)
      return
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length > 0) {
      setSelectedText(selectedText)

      // Get selection position for tooltip
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      })
      setShowHighlightTooltip(true)
    }
  }, [])

  const handleHighlight = useCallback(() => {
    if (!selectedText || !pdf) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    // Find which page the selection is on
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const pageElement =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest("[data-page]")
        : (container as Element).closest("[data-page]")

    const pageNumber = pageElement ? Number.parseInt(pageElement.getAttribute("data-page") || "1") : currentPage

    const highlight: Highlight = {
      id: Date.now().toString(),
      pageNumber,
      text: selectedText,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      color: highlightColor,
      createdAt: new Date().toISOString(),
    }

    addHighlight(pdfId, highlight)

    // Clear selection and hide tooltip
    selection.removeAllRanges()
    setShowHighlightTooltip(false)
    setSelectedText("")

    // Re-render the page to show the new highlight
    setTimeout(() => renderPage(pageNumber), 100)
  }, [selectedText, pdf, currentPage, highlightColor, pdfId, addHighlight, renderPage])

  const handleToggleBookmark = useCallback(() => {
    if (!pdf) return

    const existingBookmark = pdf.bookmarks.find((b) => b.pageNumber === currentPage)

    if (existingBookmark) {
      removeBookmark(pdfId, existingBookmark.id)
    } else {
      const bookmark = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        title: `Page ${currentPage}`,
        createdAt: new Date().toISOString(),
      }
      addBookmark(pdfId, bookmark)
    }
  }, [pdf, currentPage, pdfId, addBookmark, removeBookmark])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onBack()
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        containerRef.current?.scrollBy({ top: -100, behavior: "smooth" })
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        containerRef.current?.scrollBy({ top: 100, behavior: "smooth" })
      } else if (event.key === "m" || event.key === "M") {
        setShowNavDrawer(!showNavDrawer)
      } else if (event.key === "b" || event.key === "B") {
        handleToggleBookmark()
      } else if (event.key === "t" || event.key === "T") {
        event.preventDefault()
        cycleTheme()
      } else if (event.key >= "1" && event.key <= "5") {
        event.preventDefault()
        const themes = ["day", "night", "sepia", "console", "grey"]
        const themeIndex = Number.parseInt(event.key) - 1
        if (themes[themeIndex]) {
          setTheme(themes[themeIndex] as any)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onBack, showNavDrawer, handleToggleBookmark, cycleTheme, setTheme])

  // Handle text selection
  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection)
    return () => document.removeEventListener("mouseup", handleTextSelection)
  }, [handleTextSelection])

  const formatMinutes = (minutes: number) => {
    return `${Math.floor(minutes)}m`
  }

  const dailyGoal = stats.dailyGoal
  const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

  const isBookmarked = pdf?.bookmarks.some((b) => b.pageNumber === currentPage)

  if (!pdf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-blue-400">PDF not found</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`} style={{ backgroundColor: themeConfig.background }}>
      {/* Minimal Top Bar */}
      <div
        className="border-b shadow-sm"
        style={{
          backgroundColor: themeConfig.background,
          borderColor: themeConfig.border,
          color: themeConfig.text,
        }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-opacity-20 hover:bg-gray-500 rounded transition-colors"
              title="Back to library"
              style={{ color: themeConfig.text }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs truncate max-w-xs" style={{ color: themeConfig.text }}>
              {pdf.name}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <ReadingThemeSwitcher />

            <button
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded transition-colors ${
                isBookmarked ? "bg-opacity-20 bg-blue-500" : "hover:bg-opacity-20 hover:bg-gray-500"
              }`}
              title={isBookmarked ? "Remove bookmark (B)" : "Add bookmark (B)"}
              style={{ color: isBookmarked ? themeConfig.accent : themeConfig.text }}
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowNavDrawer(!showNavDrawer)}
              className="p-1.5 hover:bg-opacity-20 hover:bg-gray-500 rounded transition-colors"
              title="Navigation menu (M)"
              style={{ color: themeConfig.text }}
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 py-2 border-t" style={{ borderColor: themeConfig.border }}>
          <ReadingProgressBar currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>

        {/* Minimal Stats Bar */}
        <div className="px-3 py-1.5 border-t text-xs" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center justify-between" style={{ color: themeConfig.text }}>
            <div className="flex items-center space-x-4">
              <span>
                today: <span style={{ color: themeConfig.text }}>{formatMinutes(stats.todayMinutes)}</span>
              </span>
              <span>
                goal:{" "}
                <span style={{ color: goalProgress >= 100 ? "#10b981" : themeConfig.text }}>
                  {Math.floor(goalProgress)}%
                </span>
              </span>
              <span>
                streak: <span style={{ color: themeConfig.text }}>{stats.streak}d</span>
              </span>
            </div>
            <div className="text-xs opacity-70">t theme • m menu • b bookmark • esc exit</div>
          </div>
        </div>
      </div>

      {/* Goal Complete Message */}
      {showGoalComplete && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-300 rounded px-4 py-2 text-sm text-green-800 animate-pulse">
            🎯 Daily goal achieved!
          </div>
        </div>
      )}

      {/* Highlight Tooltip */}
      {showHighlightTooltip && (
        <div
          className="fixed z-50 border rounded-lg shadow-lg p-2"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translate(-50%, -100%)",
            backgroundColor: themeConfig.background,
            borderColor: themeConfig.border,
          }}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={handleHighlight}
              className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200 transition-colors"
            >
              <Highlighter className="w-3 h-3" />
              <span>Highlight</span>
            </button>
            <button
              onClick={() => setShowHighlightTooltip(false)}
              className="p-1 hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
              style={{ color: themeConfig.text }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent"
        style={{
          backgroundColor: themeConfig.background,
          scrollbarColor: `${themeConfig.border} transparent`,
        }}
        onScroll={handleScroll}
      >
        <div className="flex flex-col items-center py-6" style={{ gap: "0px" }}>
          {Array.from({ length: totalPages }, (_, index) => (
            <div key={index} className="w-full max-w-3xl px-4 relative pdf-page-container" data-page={index + 1}>
              <canvas
                ref={(el) => (canvasRefs.current[index] = el)}
                className="w-full h-auto shadow-sm border transition-all duration-300 pdf-page"
                style={{
                  maxWidth: "700px",
                  aspectRatio: "700/900",
                  borderColor: themeConfig.border,
                  filter: canvasFilter,
                  marginBottom: "0px",
                }}
              />
              <div
                ref={(el) => (textLayerRefs.current[index] = el)}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ maxWidth: "700px", aspectRatio: "700/900" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Drawer */}
      {showNavDrawer && (
        <ReadingNavDrawer
          pdfId={pdfId}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onClose={() => setShowNavDrawer(false)}
        />
      )}
    </div>
  )
}
