'use client'

import {useState, useCallback, useEffect} from 'react'

interface IframeItem {
  _key: string
  title: string | null
  description?: string | null
  url: string | null
}

interface IframeModalProps {
  iframes: IframeItem[]
}

export default function IframeModal({iframes}: IframeModalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleClose = useCallback(() => {
    setOpenIndex(null)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (openIndex !== null) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [openIndex, handleClose])

  if (!iframes || iframes.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {iframes.map((iframe, index) => (
        <div key={iframe._key}>
          <button
            onClick={() => setOpenIndex(index)}
            className="cursor-pointer inline-flex items-center gap-3 px-6 py-4 text-lg text-mvmnt-darkbrown bg-mvmnt-pink rounded-full hover:bg-mvmnt-darkbrown hover:text-mvmnt-pink transition-colors font-medium"
          >
            {iframe.title || 'View Content'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>

          {openIndex === index && iframe.url && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              style={{height: '100dvh'}}
              onClick={handleClose}
            >
              <div
                className="relative w-full max-w-5xl bg-white rounded-xl overflow-hidden flex flex-col"
                style={{maxHeight: 'calc(100dvh - 2rem)'}}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                  <h3 className="text-lg font-medium text-mvmnt-darkbrown">
                    {iframe.title}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="cursor-pointer p-2 text-mvmnt-darkbrown hover:text-mvmnt-pink transition-colors"
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                {iframe.description && (
                  <p className="px-4 py-2 text-sm text-gray-600 border-b shrink-0">
                    {iframe.description}
                  </p>
                )}
                <div className="flex-1 min-h-0">
                  <iframe
                    src={iframe.url}
                    title={iframe.title || 'Embedded content'}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
