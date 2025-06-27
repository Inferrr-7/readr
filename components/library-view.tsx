"use client"

import type React from "react"

import { useRef, useState } from "react"
import {
  FolderOpen,
  BarChart3,
  HelpCircle,
  Moon,
  Sun,
  Plus,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
} from "lucide-react"
import { useReadingStats } from "@/contexts/reading-stats-context"
import { usePDFLibrary } from "@/contexts/pdf-library-context"
import { useTheme } from "@/contexts/theme-context"

interface LibraryViewProps {
  onOpenPDF: (pdfId: string) => void
  onViewChange: (view: "library" | "stats" | "help") => void
}

export default function LibraryView({ onOpenPDF, onViewChange }: LibraryViewProps) {
  const { stats } = useReadingStats()
  const {
    pdfs,
    folders,
    addPDF,
    deletePDF,
    getTotalTime,
    createFolder,
    updateFolder,
    deleteFolder,
    movePDFToFolder,
    importFolder,
  } = usePDFLibrary()
  const { isDark, toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h${mins > 0 ? `${mins}m` : ""}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "today"
    if (diffDays === 2) return "yesterday"
    if (diffDays <= 7) return `${diffDays - 1}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getProgressText = (pdf: any) => {
    if (pdf.currentPage > 1) {
      return `page ${pdf.currentPage}`
    }
    if (pdf.highlights.length > 0) {
      return `${pdf.highlights.length} highlight${pdf.highlights.length !== 1 ? "s" : ""}`
    }
    return "start"
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      const pdfId = addPDF(file)
      onOpenPDF(pdfId)
    }
  }

  const handleFolderImport = async () => {
    try {
      // @ts-ignore - File System Access API
      if ("showDirectoryPicker" in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker()
        const files: File[] = []

        for await (const [name, handle] of dirHandle.entries()) {
          if (handle.kind === "file" && name.endsWith(".pdf")) {
            const file = await handle.getFile()
            files.push(file)
          }
        }

        if (files.length > 0) {
          importFolder(files, dirHandle.name)
        }
      } else {
        // Fallback: use folder input
        folderInputRef.current?.click()
      }
    } catch (error) {
      console.error("Error importing folder:", error)
      // Fallback to file input
      folderInputRef.current?.click()
    }
  }

  const handleFolderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter((file) => file.type === "application/pdf")

    if (pdfFiles.length > 0) {
      const folderName = pdfFiles[0].webkitRelativePath?.split("/")[0] || "Imported Folder"
      importFolder(pdfFiles, folderName)
    }
  }

  const handleDeletePDF = (pdfId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm("Delete this PDF from your library?")) {
      deletePDF(pdfId)
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim())
      setNewFolderName("")
      setShowNewFolderInput(false)
    }
  }

  const handleDeleteFolder = (folderId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm("Delete this folder? PDFs will be moved to the main library.")) {
      deleteFolder(folderId)
    }
  }

  const toggleFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    if (folder) {
      updateFolder(folderId, { isExpanded: !folder.isExpanded })
    }
  }

  const dailyGoal = stats.dailyGoal
  const goalProgress = Math.min((stats.todayMinutes / dailyGoal) * 100, 100)

  // Group PDFs by folder
  const unorganizedPDFs = pdfs.filter((pdf) => !pdf.folderId)
  const organizedPDFs = folders.reduce(
    (acc, folder) => {
      acc[folder.id] = pdfs.filter((pdf) => pdf.folderId === folder.id)
      return acc
    },
    {} as Record<string, typeof pdfs>,
  )

  return (
    <div className="min-h-screen">
      {/* Minimal Top Toolbar */}
      <div className="border-b border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-900">
        {/* Icons Row - Reduced Height */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Open PDF"
            >
              <FolderOpen className="w-3.5 h-3.5 text-gray-600 dark:text-blue-300" />
            </button>
            <button
              onClick={handleFolderImport}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Import Folder"
            >
              <FolderPlus className="w-3.5 h-3.5 text-gray-600 dark:text-blue-300" />
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              multiple
              onChange={handleFolderInputChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewChange("stats")}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Statistics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-gray-600 dark:text-blue-300" />
            </button>
            <button
              onClick={() => onViewChange("help")}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Help"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-600 dark:text-blue-300" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Minimal Stats Bar */}
        <div className="px-3 py-1.5 border-t border-gray-100 dark:border-blue-800 text-xs">
          <div className="flex items-center justify-between text-gray-600 dark:text-blue-300">
            <div className="flex items-center space-x-4">
              <span>
                today: <span className="text-gray-800 dark:text-blue-100">{formatTime(stats.todayMinutes)}</span>
                <span className="text-gray-500 dark:text-blue-400">/{stats.dailyGoal}m</span>
              </span>
              <span>
                goal:{" "}
                <span
                  className={
                    goalProgress >= 100 ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-blue-100"
                  }
                >
                  {Math.floor(goalProgress)}%
                </span>
              </span>
              <span>
                streak: <span className="text-gray-800 dark:text-blue-100">{stats.streak}d</span>
              </span>
              <span>
                total: <span className="text-gray-800 dark:text-blue-100">{formatTime(stats.totalMinutes)}</span>
              </span>
            </div>
            <div className="text-xs">
              library: <span className="text-gray-800 dark:text-blue-100">{formatTime(getTotalTime())}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Goal Progress Bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-blue-800 relative overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              goalProgress >= 100 ? "bg-green-500 dark:bg-green-400" : "bg-blue-500 dark:bg-blue-400"
            }`}
            style={{ width: `${goalProgress}%` }}
          />
          {goalProgress >= 100 && (
            <div className="absolute inset-0 bg-green-500 dark:bg-green-400 opacity-20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Library Content */}
      <div className="p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg text-gray-800 dark:text-blue-100 mb-1">readr</h1>
                <p className="text-xs text-gray-600 dark:text-blue-300">
                  {pdfs.length === 0 ? "no pdfs" : `${pdfs.length} pdf${pdfs.length !== 1 ? "s" : ""}`} •{" "}
                  {folders.length} folder{folders.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                title="New folder"
              >
                <Plus className="w-3 h-3" />
                <span>folder</span>
              </button>
            </div>

            {/* New Folder Input */}
            {showNewFolderInput && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="folder name"
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-blue-600 bg-white dark:bg-blue-900 text-gray-800 dark:text-blue-100 rounded"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                  autoFocus
                />
                <button
                  onClick={handleCreateFolder}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  create
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderInput(false)
                    setNewFolderName("")
                  }}
                  className="text-xs text-gray-500 dark:text-blue-400 hover:text-gray-700 dark:hover:text-blue-300"
                >
                  cancel
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {pdfs.length === 0 && folders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-blue-400 mb-3">
                <FolderOpen className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">no pdfs uploaded yet</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors"
              >
                upload your first pdf
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Folders */}
              {folders.map((folder) => (
                <div key={folder.id}>
                  {/* Folder Header */}
                  <div className="flex items-center justify-between py-1 hover:bg-gray-50 dark:hover:bg-blue-900/30 rounded transition-colors group">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex items-center space-x-2 text-sm text-gray-700 dark:text-blue-200"
                    >
                      {folder.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <Folder className="w-3 h-3" />
                      <span>{folder.name}</span>
                      <span className="text-xs text-gray-500 dark:text-blue-400">
                        ({organizedPDFs[folder.id]?.length || 0})
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      delete
                    </button>
                  </div>

                  {/* Folder Contents */}
                  {folder.isExpanded && organizedPDFs[folder.id] && (
                    <div className="ml-5 space-y-1">
                      {organizedPDFs[folder.id].map((pdf) => (
                        <div
                          key={pdf.id}
                          className="flex items-center justify-between py-1 hover:bg-gray-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer group"
                          onClick={() => onOpenPDF(pdf.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="text-gray-400 dark:text-blue-500">•</span>
                              <span className="text-gray-800 dark:text-blue-100 truncate">{pdf.name}</span>
                              <span className="text-gray-500 dark:text-blue-400">—</span>
                              <span className="text-gray-600 dark:text-blue-300">{formatTime(pdf.totalTime)}</span>
                              <span className="text-gray-500 dark:text-blue-400">—</span>
                              <span className="text-gray-600 dark:text-blue-300">{formatDate(pdf.lastOpened)}</span>
                              {pdf.highlights.length > 0 && (
                                <>
                                  <span className="text-gray-500 dark:text-blue-400">—</span>
                                  <span className="text-yellow-600 dark:text-yellow-400">{pdf.highlights.length}h</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onOpenPDF(pdf.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs transition-colors"
                            >
                              [{getProgressText(pdf)}]
                            </button>
                            <button
                              onClick={(e) => handleDeletePDF(pdf.id, e)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors opacity-0 group-hover:opacity-100"
                            >
                              [delete]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Unorganized PDFs */}
              {unorganizedPDFs.length > 0 && (
                <div className="space-y-1">
                  {folders.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-blue-400 py-1 border-t border-gray-200 dark:border-blue-800 mt-2 pt-2">
                      unorganized
                    </div>
                  )}
                  {unorganizedPDFs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="flex items-center justify-between py-1 hover:bg-gray-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer group"
                      onClick={() => onOpenPDF(pdf.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-gray-400 dark:text-blue-500">•</span>
                          <span className="text-gray-800 dark:text-blue-100 truncate">{pdf.name}</span>
                          <span className="text-gray-500 dark:text-blue-400">—</span>
                          <span className="text-gray-600 dark:text-blue-300">{formatTime(pdf.totalTime)}</span>
                          <span className="text-gray-500 dark:text-blue-400">—</span>
                          <span className="text-gray-600 dark:text-blue-300">{formatDate(pdf.lastOpened)}</span>
                          {pdf.highlights.length > 0 && (
                            <>
                              <span className="text-gray-500 dark:text-blue-400">—</span>
                              <span className="text-yellow-600 dark:text-yellow-400">{pdf.highlights.length}h</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onOpenPDF(pdf.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs transition-colors"
                        >
                          [{getProgressText(pdf)}]
                        </button>
                        <button
                          onClick={(e) => handleDeletePDF(pdf.id, e)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors opacity-0 group-hover:opacity-100"
                        >
                          [delete]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-blue-800">
            <div className="text-xs text-gray-500 dark:text-blue-400 space-y-0.5">
              <p>shortcuts: h — home • r — resume recent • esc — exit reader</p>
              <p>features: auto-resume from last page • text highlighting • progress tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
