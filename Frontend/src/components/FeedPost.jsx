import Editor from '@monaco-editor/react'
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiCode } from 'react-icons/fi'

const getInitials = (name) =>
  name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

const estimateEditorHeight = (code, min = 140, max = 360) => {
  const lines = code.split('\n').length
  return Math.min(Math.max(lines * 20 + 32, min), max)
}

const FeedPost = ({ post }) => {

  

  const difficultyStyles = {
    Easy: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
    Medium: 'text-blue-300 bg-blue-500/10 border-blue-400/30',
    Hard: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-black/20">
     
        <div className="flex min-w-0 items-center gap-3 px-4 pt-4">
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-slate-100 bg-slate-700"
            
          >
            {getInitials(post.username)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100 ">{post.username}</p>
            <p className="truncate text-xs text-slate-400">
               {post.createdAt ? post.createdAt.slice(0, 10) : ""}
          
            </p>
          </div>
        </div>

      <div className="space-y-3 px-4 py-3 sm:px-5">
        <p className="text-sm leading-relaxed text-slate-200">{post.sharedData[0].description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-200">
            {post.sharedData[0].title}
          </span>
          <span
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${difficultyStyles[post.sharedData[0].difficulty] ?? difficultyStyles.Medium}`}
          >
            {post.sharedData[0].difficulty}
          </span>
        </div>
      </div>

      <div className="mx-4 overflow-hidden rounded-xl border border-slate-700/80 sm:mx-5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 bg-slate-950/80 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FiCode size={14} className="text-emerald-400" />
            <span className="font-medium uppercase tracking-wide text-slate-300">{post.sharedData[0].answer?.language}</span>
          </div>
          <span className="text-[11px] text-slate-500">Read only</span>
        </div>
        <div className="overflow-hidden bg-[#1e1e1e]">
          <Editor
            height={estimateEditorHeight(post.sharedData[0].answer.code)}
            language={post.sharedData[0].answer.language}
            theme="vs-dark"
            value={post.sharedData[0].answer.code}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 15,
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
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-2.5 sm:px-5">
        {/* <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{likes} likes</span>
          <div className="flex gap-3">
            <span>{comments} comments</span>
            <span>{shares} shares</span>
          </div>
        </div> */}

        {/* <div className="mt-2 grid grid-cols-3 gap-1 border-t border-slate-800 pt-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-rose-300"
          >
            <FiHeart size={18} />
            <span className="hidden sm:inline">Like</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-emerald-300"
          >
            <FiMessageCircle size={18} />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-blue-300"
          >
            <FiShare2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div> */}
      </div>
    </article>
  )
}

export default FeedPost
