"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText } from "lucide-react"
import PDFViewer from "@/components/pdf-viewer"
import MetricsBar from "@/components/metrics-bar"
import SessionCompleteModal from "@/components/session-complete-modal"
import { useReadingStats } from "@/contexts/reading-stats-context"

export default function PracticeView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isReading, setIsReading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSessionComplete, setShowSessionComplete] = useState(false)
  const [lastSessionMinutes, setLastSessionMinutes] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { startSession, endSession } = useReadingStats()

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      setSelectedFile(file)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleStartReading = () => {
    if (selectedFile) {
      setIsReading(true)
      startSession()
    }
  }

  const handleEndReading = (sessionMinutes: number) => {
    setIsReading(false)
    setLastSessionMinutes(sessionMinutes)
    endSession()
    setShowSessionComplete(true)
  }

  if (isReading && selectedFile) {
    return (
      <div className="h-screen flex flex-col">
        <MetricsBar />
        <PDFViewer file={selectedFile} onEndSession={handleEndReading} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <MetricsBar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors font-mono ${
              isDragOver
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : selectedFile
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-blue-700 bg-gray-50 dark:bg-blue-900/10 hover:border-gray-400 dark:hover:border-blue-600"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 dark:text-blue-100 mb-2">ready to read</h3>
                  <p className="text-gray-600 dark:text-blue-300 mb-4 text-sm truncate">{selectedFile.name}</p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handleStartReading}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      start reading
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="border border-gray-300 dark:border-blue-600 hover:border-gray-400 dark:hover:border-blue-500 text-gray-700 dark:text-blue-300 px-6 py-2 rounded-lg transition-colors text-sm"
                    >
                      choose different file
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-blue-800 rounded-lg flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-gray-500 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 dark:text-blue-100 mb-2">upload pdf</h3>
                  <p className="text-gray-600 dark:text-blue-300 mb-6 text-sm">
                    drag and drop a pdf file here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-gray-300 dark:border-blue-600 hover:border-gray-400 dark:hover:border-blue-500 text-gray-700 dark:text-blue-300 px-6 py-2 rounded-lg transition-colors text-sm"
                  >
                    choose file
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center text-xs font-mono text-gray-500 dark:text-blue-400">
            <p>upload a pdf document to start tracking your reading progress.</p>
            <p className="mt-1">your reading time and streaks will be saved automatically.</p>
          </div>
        </div>
      </div>

      {showSessionComplete && (
        <SessionCompleteModal sessionMinutes={lastSessionMinutes} onClose={() => setShowSessionComplete(false)} />
      )}
    </div>
  )
}
