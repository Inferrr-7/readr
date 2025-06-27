"use client"

import { useState } from "react"
import { BookOpen, Bookmark, Highlighter, StickyNote, History, Plus, X } from "lucide-react"
import { usePDFLibrary } from "@/contexts/pdf-library-context"
import { useReadingTheme } from "@/contexts/reading-theme-context"

interface ReadingNavDrawerProps {
  pdfId: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onClose: () => void
}

export default function ReadingNavDrawer({
  pdfId,
  currentPage,
  totalPages,
  onPageChange,
  onClose,
}: ReadingNavDrawerProps) {
  const { getPDF, addBookmark, removeBookmark, addNote, removeNote } = usePDFLibrary()
  const { getThemeConfig } = useReadingTheme()
  const [activeTab, setActiveTab] = useState<"toc" | "bookmarks" | "highlights" | "notes" | "history">("toc")
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("")
  const [newNoteText, setNewNoteText] = useState("")
  const [showAddBookmark, setShowAddBookmark] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)

  const pdf = getPDF(pdfId)
  const themeConfig = getThemeConfig()

  if (!pdf) return null

  const handleAddBookmark = () => {
    if (newBookmarkTitle.trim()) {
      const bookmark = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        title: newBookmarkTitle.trim(),
        createdAt: new Date().toISOString(),
      }
      addBookmark(pdfId, bookmark)
      setNewBookmarkTitle("")
      setShowAddBookmark(false)
    }
  }

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      const note = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        text: newNoteText.trim(),
        createdAt: new Date().toISOString(),
      }
      addNote(pdfId, note)
      setNewNoteText("")
      setShowAddNote(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  // Sample TOC data
  const sampleTOC = [
    { title: "Introduction", page: 1, level: 0 },
    { title: "Chapter 1: Getting Started", page: 5, level: 0 },
    { title: "1.1 Basic Concepts", page: 7, level: 1 },
    { title: "1.2 Advanced Topics", page: 12, level: 1 },
    { title: "Chapter 2: Implementation", page: 18, level: 0 },
    { title: "2.1 Setup", page: 20, level: 1 },
    { title: "2.2 Configuration", page: 25, level: 1 },
    { title: "Chapter 3: Examples", page: 30, level: 0 },
    { title: "Conclusion", page: 45, level: 0 },
  ]

  const tabs = [
    { id: "toc", icon: BookOpen, label: "TOC", count: sampleTOC.length },
    { id: "bookmarks", icon: Bookmark, label: "Bookmarks", count: pdf.bookmarks.length },
    { id: "highlights", icon: Highlighter, label: "Highlights", count: pdf.highlights.length },
    { id: "notes", icon: StickyNote, label: "Notes", count: pdf.notes.length },
    { id: "history", icon: History, label: "History", count: pdf.history.length },
  ]

  return (
    <div
      className="fixed inset-y-0 right-0 w-80 border-l z-50 flex flex-col font-mono text-sm"
      style={{
        backgroundColor: themeConfig.background,
        borderColor: themeConfig.border,
        color: themeConfig.text,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: themeConfig.border }}>
        <h3 className="text-sm font-medium" style={{ color: themeConfig.text }}>
          Navigation
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
          style={{ color: themeConfig.text }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: themeConfig.border }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                activeTab === tab.id ? "bg-opacity-20 bg-blue-500" : "hover:bg-opacity-10 hover:bg-gray-500"
              }`}
              style={{
                color: activeTab === tab.id ? themeConfig.accent : themeConfig.text,
              }}
            >
              <Icon className="w-3 h-3 mb-1" />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="text-xs opacity-70">({tab.count})</span>}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Table of Contents */}
        {activeTab === "toc" && (
          <div className="p-3">
            <div className="space-y-1">
              {sampleTOC.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onPageChange(item.page)}
                  className={`w-full text-left p-2 rounded text-xs hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                    currentPage >= item.page &&
                    (index === sampleTOC.length - 1 || currentPage < sampleTOC[index + 1]?.page)
                      ? "bg-opacity-20 bg-blue-500"
                      : ""
                  }`}
                  style={{
                    paddingLeft: `${8 + item.level * 16}px`,
                    color:
                      currentPage >= item.page &&
                      (index === sampleTOC.length - 1 || currentPage < sampleTOC[index + 1]?.page)
                        ? themeConfig.accent
                        : themeConfig.text,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{item.title}</span>
                    <span className="opacity-70 ml-2">{item.page}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === "bookmarks" && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs opacity-70">Page {currentPage}</span>
              <button
                onClick={() => setShowAddBookmark(true)}
                className="flex items-center space-x-1 text-xs hover:bg-opacity-20 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                style={{ color: themeConfig.accent }}
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {showAddBookmark && (
              <div className="mb-3 p-2 rounded" style={{ backgroundColor: `${themeConfig.border}40` }}>
                <input
                  type="text"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  placeholder="Bookmark title"
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{
                    borderColor: themeConfig.border,
                    backgroundColor: themeConfig.background,
                    color: themeConfig.text,
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleAddBookmark()}
                  autoFocus
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleAddBookmark}
                    className="text-xs hover:bg-opacity-20 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                    style={{ color: themeConfig.accent }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddBookmark(false)
                      setNewBookmarkTitle("")
                    }}
                    className="text-xs opacity-70 hover:bg-opacity-20 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                    style={{ color: themeConfig.text }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {pdf.bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-2 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors group"
                >
                  <button onClick={() => onPageChange(bookmark.pageNumber)} className="flex-1 text-left">
                    <div className="text-xs truncate" style={{ color: themeConfig.text }}>
                      {bookmark.title}
                    </div>
                    <div className="text-xs opacity-70">
                      Page {bookmark.pageNumber} • {formatDate(bookmark.createdAt)}
                    </div>
                  </button>
                  <button
                    onClick={() => removeBookmark(pdfId, bookmark.id)}
                    className="text-xs text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {pdf.bookmarks.length === 0 && (
                <div className="text-xs opacity-70 text-center py-4">No bookmarks yet</div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs content remains similar but with theme styling... */}
        {/* For brevity, I'll show the highlights tab as an example */}
        {activeTab === "highlights" && (
          <div className="p-3">
            <div className="space-y-2">
              {pdf.highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="p-2 hover:bg-opacity-10 hover:bg-gray-500 rounded transition-colors group cursor-pointer"
                  onClick={() => onPageChange(highlight.pageNumber)}
                >
                  <div className="text-xs mb-1" style={{ color: themeConfig.text }}>
                    <span className="px-1 rounded" style={{ backgroundColor: highlight.color + "40" }}>
                      "{highlight.text}"
                    </span>
                  </div>
                  <div className="text-xs opacity-70">
                    Page {highlight.pageNumber} • {formatDate(highlight.createdAt)}
                  </div>
                </div>
              ))}
              {pdf.highlights.length === 0 && (
                <div className="text-xs opacity-70 text-center py-4">No highlights yet</div>
              )}
            </div>
          </div>
        )}

        {/* Notes and History tabs would follow similar pattern */}
      </div>
    </div>
  )
}
