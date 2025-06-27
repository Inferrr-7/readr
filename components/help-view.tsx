"use client"

import { ArrowLeft, BookOpen, Clock, Keyboard, FolderOpen, FolderPlus } from "lucide-react"

interface HelpViewProps {
  onBack: () => void
}

export default function HelpView({ onBack }: HelpViewProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-blue-950">
      {/* Minimal Top Bar */}
      <div className="border-b border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-900">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-blue-800 rounded transition-colors"
              title="Back to library"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gray-600 dark:text-blue-300" />
            </button>
            <span className="text-xs text-gray-800 dark:text-blue-100">help</span>
          </div>
        </div>
      </div>

      {/* Help Content */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Getting Started */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FolderOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <h2 className="text-sm text-gray-800 dark:text-blue-100">getting started</h2>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-blue-300">
              <p>1. click the folder icon to upload a pdf document</p>
              <p>2. organize pdfs into folders for better management</p>
              <p>3. click [resume] to start reading in scrollable view</p>
              <p>4. reading time is automatically tracked and saved</p>
            </div>
          </div>

          {/* Folder Management */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FolderPlus className="w-4 h-4 text-green-500 dark:text-green-400" />
              <h2 className="text-sm text-gray-800 dark:text-blue-100">folder management</h2>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-blue-300">
              <p>• create folders to organize your pdf library</p>
              <p>• import entire folders of pdfs at once</p>
              <p>• expand/collapse folders to manage space</p>
              <p>• delete folders (pdfs move to unorganized)</p>
            </div>
          </div>

          {/* Reading Interface */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <h2 className="text-sm text-gray-800 dark:text-blue-100">reading interface</h2>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-blue-300">
              <p>• scroll vertically through all pages in one view</p>
              <p>• pages load automatically as you scroll down</p>
              <p>• goal progress bar shows daily reading progress</p>
              <p>• minimal ui maximizes reading space</p>
            </div>
          </div>

          {/* Goal Tracking */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <h2 className="text-sm text-gray-800 dark:text-blue-100">goal tracking</h2>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-blue-300">
              <p>tracks your daily reading habits and progress:</p>
              <ul className="list-disc list-inside ml-3 space-y-0.5">
                <li>30-minute daily reading goal</li>
                <li>visual progress bar fills as you read</li>
                <li>reading streak counter</li>
                <li>total time across all sessions</li>
              </ul>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-white dark:bg-blue-900 border border-gray-200 dark:border-blue-800 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Keyboard className="w-4 h-4 text-red-500 dark:text-red-400" />
              <h2 className="text-sm text-gray-800 dark:text-blue-100">keyboard shortcuts</h2>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-blue-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span>home:</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-blue-800 text-xs">h</kbd>
                </div>
                <div className="flex justify-between">
                  <span>exit reader:</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-blue-800 text-xs">esc</kbd>
                </div>
                <div className="flex justify-between">
                  <span>scroll up:</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-blue-800 text-xs">↑</kbd>
                </div>
                <div className="flex justify-between">
                  <span>scroll down:</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-blue-800 text-xs">↓</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-800/30 border border-blue-200 dark:border-blue-700 p-4">
            <h2 className="text-sm text-blue-800 dark:text-blue-200 mb-3">reading tips</h2>
            <div className="space-y-0.5 text-xs text-blue-700 dark:text-blue-300">
              <p>• organize pdfs into subject folders</p>
              <p>• aim for consistent daily reading sessions</p>
              <p>• use the progress bar to track daily goals</p>
              <p>• build reading streaks for motivation</p>
              <p>• focus on the content with minimal ui distractions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
