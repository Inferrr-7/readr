"use client"

import { useState, useEffect } from "react"
import LibraryView from "@/components/library-view"
import PDFReader from "@/components/pdf-reader"
import StatsView from "@/components/stats-view"
import HelpView from "@/components/help-view"
import { ReadingStatsProvider } from "@/contexts/reading-stats-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { PDFLibraryProvider } from "@/contexts/pdf-library-context"
import { ReadingThemeProvider } from "@/contexts/reading-theme-context"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"library" | "reader" | "stats" | "help">("library")
  const [currentPDF, setCurrentPDF] = useState<string | null>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "h" || event.key === "H") {
        if (event.ctrlKey || event.metaKey) return
        setCurrentView("library")
        setCurrentPDF(null)
      } else if (event.key === "Escape") {
        if (currentView === "reader") {
          setCurrentView("library")
          setCurrentPDF(null)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentView])

  const handleOpenPDF = (pdfId: string) => {
    setCurrentPDF(pdfId)
    setCurrentView("reader")
  }

  const renderView = () => {
    switch (currentView) {
      case "library":
        return <LibraryView onOpenPDF={handleOpenPDF} onViewChange={setCurrentView} />
      case "reader":
        return currentPDF ? <PDFReader pdfId={currentPDF} onBack={() => setCurrentView("library")} /> : null
      case "stats":
        return <StatsView onBack={() => setCurrentView("library")} />
      case "help":
        return <HelpView onBack={() => setCurrentView("library")} />
      default:
        return <LibraryView onOpenPDF={handleOpenPDF} onViewChange={setCurrentView} />
    }
  }

  return (
    <ThemeProvider>
      <ReadingStatsProvider>
        <PDFLibraryProvider>
          <ReadingThemeProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-blue-950 font-mono transition-colors">{renderView()}</div>
          </ReadingThemeProvider>
        </PDFLibraryProvider>
      </ReadingStatsProvider>
    </ThemeProvider>
  )
}
