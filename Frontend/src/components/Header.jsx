import { error_context, User_nameContext, User_dataContext } from '../routs/CreateContext'
import { useContext, useEffect, useState } from 'react'
import axios from '../routs/Axios'
const Header = ({ onMenuToggle }) => {
  const [username, setUsername] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { error, setError } = useContext(error_context)
  const { submittedUsername, setSubmittedUsername } = useContext(User_nameContext)
  const { UserData, setUserData } = useContext(User_dataContext)
  const userInitials = submittedUsername
    ? submittedUsername
      .split(/[_-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('')
    : ''


  useEffect(() => {
    jwtcheck()
  }, [])

  const jwtcheck = async () => {
    try {
      const res = await axios.post('/LeetCode/verify_jwt')
      setUserData(res.data || '')
      setError('')
      setSubmittedUsername(res.data.username || '')
    }
    catch {

    }
  }

  const handleAnalyze = async () => {
    try {
      const value = username.trim()

      if (!value) {
        setError('Please enter your username first.')
        return
      }

      // Basic LeetCode username format guard.
      if (!/^[a-zA-Z0-9_-]{3,24}$/.test(value)) {
        setError('Enter a valid username (3-24 chars, letters, numbers, _ or -).')
        return
      }

      setIsAnalyzing(true)
      const res = await axios.get(`/LeetCode/user/${value}`)
      setUserData(res.data)
      setError('')
      setSubmittedUsername(res.data.username)
    }
    catch (err) {
      console.log(err)
      setError(err)
    }
    finally {
      setIsAnalyzing(false)
      setUsername("")
    }

  }
  return (
    <header className="h-17 w-full bg-slate-900 px-4 md:px-6">
      <div className="mx-auto flex h-full max-w-350 items-center justify-between gap-2 md:gap-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={onMenuToggle}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 text-slate-200 transition hover:bg-slate-800 md:hidden"
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>

          <div className=" h-10 sm:w-70 w-42.5 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-slate-300 flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leetcode username"
              className="w-full bg-transparent text-sm text-slate-100 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            aria-busy={isAnalyzing}
            className={`h-10 rounded-xl px-4 text-sm font-medium text-slate-950 transition sm:px-5 ${isAnalyzing
                ? 'cursor-not-allowed bg-emerald-300/70'
                : 'bg-emerald-400 hover:bg-emerald-300'
              }`}
          >
            <span className="inline-flex items-center gap-2">
              {isAnalyzing && (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              <span>{isAnalyzing ? 'Analyzing…' : 'Analyze'}</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">



          {submittedUsername &&
            <>
              <div className="hidden h-9 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-600 text-sm font-semibold text-slate-100">
                  {userInitials || submittedUsername[0]?.toUpperCase()}
                </div>

                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="text-sm font-medium text-slate-100">{submittedUsername}</span>
                  <div className=" text-xs text-slate-400">
                    <span>LeetCode Profile</span>

                  </div>
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </header>
  )
}

export default Header