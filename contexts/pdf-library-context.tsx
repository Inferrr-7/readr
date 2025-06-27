"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"

interface Highlight {
  id: string
  pageNumber: number
  text: string
  startOffset: number
  endOffset: number
  color: string
  createdAt: string
}

interface Bookmark {
  id: string
  pageNumber: number
  title: string
  createdAt: string
}

interface Note {
  id: string
  pageNumber: number
  highlightId?: string
  text: string
  tag?: string
  createdAt: string
}

interface HistoryEntry {
  pageNumber: number
  timestamp: string
}

interface PDFData {
  id: string
  name: string
  file: File
  totalTime: number
  lastOpened: string
  progress: number
  currentPage: number
  lastScrollPosition: number
  highlights: Highlight[]
  bookmarks: Bookmark[]
  notes: Note[]
  history: HistoryEntry[]
  folderId?: string
}

interface FolderData {
  id: string
  name: string
  isExpanded: boolean
  createdAt: string
}

interface PDFLibraryContextType {
  pdfs: PDFData[]
  folders: FolderData[]
  addPDF: (file: File, folderId?: string) => string
  updatePDF: (id: string, updates: Partial<PDFData>) => void
  deletePDF: (id: string) => void
  getPDF: (id: string) => PDFData | undefined
  getTotalTime: () => number
  createFolder: (name: string) => string
  updateFolder: (id: string, updates: Partial<FolderData>) => void
  deleteFolder: (id: string) => void
  movePDFToFolder: (pdfId: string, folderId?: string) => void
  importFolder: (files: File[], folderName: string) => void
  addHighlight: (pdfId: string, highlight: Highlight) => void
  removeHighlight: (pdfId: string, highlightId: string) => void
  addBookmark: (pdfId: string, bookmark: Bookmark) => void
  removeBookmark: (pdfId: string, bookmarkId: string) => void
  addNote: (pdfId: string, note: Note) => void
  removeNote: (pdfId: string, noteId: string) => void
  updateScrollPosition: (pdfId: string, scrollPosition: number, currentPage: number) => void
  addToHistory: (pdfId: string, pageNumber: number) => void
}

const PDFLibraryContext = createContext<PDFLibraryContextType | undefined>(undefined)

export function PDFLibraryProvider({ children }: { children: ReactNode }) {
  const [pdfs, setPdfs] = useState<PDFData[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pdfsRef = useRef<PDFData[]>([])
  const foldersRef = useRef<FolderData[]>([])

  // Keep refs in sync
  useEffect(() => {
    pdfsRef.current = pdfs
  }, [pdfs])

  useEffect(() => {
    foldersRef.current = folders
  }, [folders])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(() => {
    try {
      const savedPDFs = localStorage.getItem("pdf-library")
      const savedFolders = localStorage.getItem("pdf-folders")

      if (savedPDFs) {
        const parsedPDFs = JSON.parse(savedPDFs)
        setPdfs(parsedPDFs)
      }

      if (savedFolders) {
        const parsedFolders = JSON.parse(savedFolders)
        setFolders(parsedFolders)
      }
    } catch (error) {
      console.error("Error loading library data:", error)
    }
  }, [])

  const saveToStorage = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const pdfMetadata = pdfsRef.current.map(({ file, ...rest }) => rest)
        localStorage.setItem("pdf-library", JSON.stringify(pdfMetadata))
        localStorage.setItem("pdf-folders", JSON.stringify(foldersRef.current))
      } catch (error) {
        console.error("Error saving library data:", error)
      }
    }, 100)
  }, [])

  const addPDF = useCallback(
    (file: File, folderId?: string): string => {
      const id = Date.now().toString()
      const newPDF: PDFData = {
        id,
        name: file.name,
        file,
        totalTime: 0,
        lastOpened: new Date().toISOString(),
        progress: 0,
        currentPage: 1,
        lastScrollPosition: 0,
        highlights: [],
        bookmarks: [],
        notes: [],
        history: [],
        folderId,
      }

      setPdfs((prevPdfs) => {
        const updatedPDFs = [...prevPdfs, newPDF]
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
      return id
    },
    [saveToStorage],
  )

  const updatePDF = useCallback(
    (id: string, updates: Partial<PDFData>) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => (pdf.id === id ? { ...pdf, ...updates } : pdf))
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const deletePDF = useCallback(
    (id: string) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.filter((pdf) => pdf.id !== id)
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const getPDF = useCallback(
    (id: string) => {
      return pdfs.find((pdf) => pdf.id === id)
    },
    [pdfs],
  )

  const getTotalTime = useCallback(() => {
    return pdfs.reduce((total, pdf) => total + pdf.totalTime, 0)
  }, [pdfs])

  const createFolder = useCallback(
    (name: string): string => {
      const id = Date.now().toString()
      const newFolder: FolderData = {
        id,
        name,
        isExpanded: true,
        createdAt: new Date().toISOString(),
      }

      setFolders((prevFolders) => {
        const updatedFolders = [...prevFolders, newFolder]
        setTimeout(saveToStorage, 0)
        return updatedFolders
      })
      return id
    },
    [saveToStorage],
  )

  const updateFolder = useCallback(
    (id: string, updates: Partial<FolderData>) => {
      setFolders((prevFolders) => {
        const updatedFolders = prevFolders.map((folder) => (folder.id === id ? { ...folder, ...updates } : folder))
        setTimeout(saveToStorage, 0)
        return updatedFolders
      })
    },
    [saveToStorage],
  )

  const deleteFolder = useCallback(
    (id: string) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => (pdf.folderId === id ? { ...pdf, folderId: undefined } : pdf))
        return updatedPDFs
      })

      setFolders((prevFolders) => {
        const updatedFolders = prevFolders.filter((folder) => folder.id !== id)
        setTimeout(saveToStorage, 0)
        return updatedFolders
      })
    },
    [saveToStorage],
  )

  const movePDFToFolder = useCallback(
    (pdfId: string, folderId?: string) => {
      updatePDF(pdfId, { folderId })
    },
    [updatePDF],
  )

  const importFolder = useCallback(
    (files: File[], folderName: string) => {
      const folderId = createFolder(folderName)
      files.forEach((file) => {
        if (file.type === "application/pdf") {
          addPDF(file, folderId)
        }
      })
    },
    [createFolder, addPDF],
  )

  const addHighlight = useCallback(
    (pdfId: string, highlight: Highlight) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return { ...pdf, highlights: [...pdf.highlights, highlight] }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const removeHighlight = useCallback(
    (pdfId: string, highlightId: string) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return { ...pdf, highlights: pdf.highlights.filter((h) => h.id !== highlightId) }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const addBookmark = useCallback(
    (pdfId: string, bookmark: Bookmark) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return { ...pdf, bookmarks: [...pdf.bookmarks, bookmark] }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const removeBookmark = useCallback(
    (pdfId: string, bookmarkId: string) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return { ...pdf, bookmarks: pdf.bookmarks.filter((b) => b.id !== bookmarkId) }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const addNote = useCallback(
    (pdfId: string, note: Note) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return { ...pdf, notes: [...pdf.notes, note] }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const removeNote = useCallback(
    (pdfId: string, noteId: string) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return { ...pdf, notes: pdf.notes.filter((n) => n.id !== noteId) }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const updateScrollPosition = useCallback(
    (pdfId: string, scrollPosition: number, currentPage: number) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            return {
              ...pdf,
              lastScrollPosition: scrollPosition,
              currentPage: currentPage,
              progress: (currentPage / 100) * 100,
            }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  const addToHistory = useCallback(
    (pdfId: string, pageNumber: number) => {
      setPdfs((prevPdfs) => {
        const updatedPDFs = prevPdfs.map((pdf) => {
          if (pdf.id === pdfId) {
            const newEntry: HistoryEntry = {
              pageNumber,
              timestamp: new Date().toISOString(),
            }

            // Keep only last 15 entries and avoid duplicates
            const filteredHistory = pdf.history.filter((h) => h.pageNumber !== pageNumber)
            const updatedHistory = [newEntry, ...filteredHistory].slice(0, 15)

            return { ...pdf, history: updatedHistory }
          }
          return pdf
        })
        setTimeout(saveToStorage, 0)
        return updatedPDFs
      })
    },
    [saveToStorage],
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <PDFLibraryContext.Provider
      value={{
        pdfs,
        folders,
        addPDF,
        updatePDF,
        deletePDF,
        getPDF,
        getTotalTime,
        createFolder,
        updateFolder,
        deleteFolder,
        movePDFToFolder,
        importFolder,
        addHighlight,
        removeHighlight,
        addBookmark,
        removeBookmark,
        addNote,
        removeNote,
        updateScrollPosition,
        addToHistory,
      }}
    >
      {children}
    </PDFLibraryContext.Provider>
  )
}

export function usePDFLibrary() {
  const context = useContext(PDFLibraryContext)
  if (context === undefined) {
    throw new Error("usePDFLibrary must be used within a PDFLibraryProvider")
  }
  return context
}
