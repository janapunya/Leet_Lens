import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { FiCode, FiShare2, FiX } from 'react-icons/fi'
import axios from '../routs/Axios'
const difficultyStyles = {
  easy: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  medium: 'text-blue-300 bg-blue-500/10 border-blue-400/30',
  hard: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
}

const estimateEditorHeight = (code = '', min = 160, max = 320) => {
  const lines = code.split('\n').length
  return Math.min(Math.max(lines * 20 + 32, min), max)
}

const ShareFeed = ({ data, onClose, onShare }) => {
  const [description, setDescription] = useState('')
  const [sharing, setSharing] = useState(false)
  const [success, setSuccess] = useState(false)
  const title = data?.questionTitle || data?.title || 'Untitled problem'
  const difficulty = (data?.difficulty || 'easy').toLowerCase()
  const language = data?.answer?.language || data?.language || 'javascript'
  const code = data?.answer?.code || data?.code || ''

  const handleShare = async () => {
    try {
      setSharing(true)
      const response = await axios.post('/execute/sharefeed', {
        questionId: data.questionId,
        title: data.questionTitle,
        difficulty: data.difficulty,
        description: description,
        language: data.answer.language,
        code: data.answer.code
      })
      if (response.status === 200) {
        setSuccess(true)
      }
    } catch (error) {
      console.log(error)
      setSuccess(false)
    }
    finally {
      setTimeout(() => {
        setSuccess(false)
        onClose()
        setSharing(false)
      }, 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        role="presentation"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-feed-title"
        className="relative z-10 flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-[#0b0e14] shadow-2xl shadow-black/40 sm:max-h-[90vh] sm:rounded-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-emerald-400/80 via-emerald-500/40 to-blue-500/80" />

        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="share-feed-title" className="text-lg font-semibold text-slate-100 sm:text-xl">
              Share to Feed
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Preview your solution and add a short note before sharing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5 scrollbar-hide">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-200 sm:text-sm">
              {title}
            </span>
            <span
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize sm:text-sm ${
                difficultyStyles[difficulty] ?? difficultyStyles.medium
              }`}
            >
              {difficulty}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 bg-slate-950/80 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiCode size={14} className="text-emerald-400" />
                <span className="font-medium uppercase tracking-wide text-slate-300">{language}</span>
              </div>
              <span className="text-[11px] text-slate-500">Preview</span>
            </div>
            <div className="overflow-hidden bg-[#1e1e1e]">
              {code ? (
                <Editor
                  height={estimateEditorHeight(code)}
                  language={language}
                  theme="vs-dark"
                  value={code}
                  options={{
                    readOnly: true,
                    domReadOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                    lineHeight: 18,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 3,
                    wordWrap: 'on',
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'none',
                    contextmenu: false,
                    scrollbar: {
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6,
                    },
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    overviewRulerBorder: false,
                    lineNumbers: 'on',
                    folding: false,
                    glyphMargin: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                  }}
                />
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No code available for this solution.
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="share-description" className="mb-2 block text-sm font-medium text-slate-200">
              Description
            </label>
            <textarea
              id="share-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              
              placeholder="Describe your approach, what you learned, or tips for others..."
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 sm:px-4"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Optional — helps others understand your solution.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-800 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Close
          </button>
          {success ? (
            <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50">
              Shared successfully
            </div>
          ) : (
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing || !code || !description}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiShare2 size={16} />
              {sharing ? 'Sharing...' : 'Share'}
            </button>
          )}
        
        </div>
      </div>
    </div>
  )
}

export default ShareFeed
