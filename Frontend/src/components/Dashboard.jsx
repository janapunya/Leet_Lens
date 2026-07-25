import { useState, useContext } from 'react'
import Pie from './pai'
import  CustomBar  from './Bar'
import logo1 from '../assets/image_icon/1logo.png'
import logo2 from '../assets/image_icon/2logo.png'
import logo3 from '../assets/image_icon/3logo.png'
import logo4 from '../assets/image_icon/4logo.png'
import  {User_nameContext, error_context,User_dataContext} from '../routs/CreateContext'
import { Link } from 'react-router-dom'
const Dashboard = () => {

 const {submittedUsername, setSubmittedUsername} = useContext(User_nameContext)
  const{error, setError}= useContext(error_context)
  const {UserData, setUserData} = useContext(User_dataContext)
  const submissionStats = UserData?.submitStats?.acSubmissionNum ?? []
  const totalSolved = submissionStats.find((item) => item.difficulty === 'All')?.count ?? 0
  const easySolved = submissionStats.find((item) => item.difficulty === 'Easy')?.count ?? 0
  const mediumSolved = submissionStats.find((item) => item.difficulty === 'Medium')?.count ?? 0
  const hardSolved = submissionStats.find((item) => item.difficulty === 'Hard')?.count ?? 0
  const solvedByDifficulty = [
    { name: 'Easy', value: easySolved },
    { name: 'Medium', value: mediumSolved },
    { name: 'Hard', value: hardSolved },
  ]
  const strongestBucket = solvedByDifficulty.reduce((best, current) =>
    current.value > best.value ? current : best,
  solvedByDifficulty[0])
  const weakestBucket = solvedByDifficulty.reduce((worst, current) =>
    current.value < worst.value ? current : worst,
  solvedByDifficulty[0])
  const hardShare = totalSolved ? (hardSolved / totalSolved) * 100 : 0
  const currentLevel =
    totalSolved >= 500 ? 'Advanced' : totalSolved >= 200 ? 'Intermediate' : 'Beginner'
  const consistency = totalSolved >= 300 || hardShare >= 15 ? 'High' : totalSolved >= 100 ? 'Medium' : 'Low'

  const stats = [
    { title: 'Total Solved', value: totalSolved, note: 'All Problems', logo:logo1 },
    { title: 'Easy', value: easySolved, note: `${totalSolved ? ((easySolved / totalSolved) * 100).toFixed(1) : '0.0'}%`, logo:logo2 },
    { title: 'Medium',value: mediumSolved, note: `${totalSolved ? ((mediumSolved / totalSolved) * 100).toFixed(1) : '0.0'}%`,  logo:logo3 },
    { title: 'Hard',value: hardSolved, note: `${totalSolved ? ((hardSolved / totalSolved) * 100).toFixed(1) : '0.0'}%`,  logo:logo4 },
  ]

  const recommendations = [
    { name: 'Two Sum', level: 'Easy', levelColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' },
    { name: 'Valid Parentheses', level: 'Easy', levelColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' },
    { name: 'Merge Intervals', level: 'Medium', levelColor: 'text-blue-300 bg-blue-500/10 border-blue-400/30' },
    { name: 'Top K Frequent Elements', level: 'Medium', levelColor: 'text-blue-300 bg-blue-500/10 border-blue-400/30' },
    { name: 'Trapping Rain Water', level: 'Hard', levelColor: 'text-rose-300 bg-rose-500/10 border-rose-400/30' },
  ]
  

  return (
    <>
    {submittedUsername ? (
    <section className="mx-auto w-full max-w-425 px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-9">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {stats.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm"
              >
                <div className='flex items-center'>
                  <img src={item.logo} alt="logo" className='h-6 w-6 mr-2 '/>
                  <p className="text-sm text-slate-300">{item.title}</p>
                  </div>
                <p className="mt-2 text-3xl font-semibold ">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">{item.note}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold text-slate-100">Problems Distribution</h2>
              <p className="mt-1 text-sm text-slate-400">Share of solved problems by difficulty</p>
              <div className="mt-5 flex h-32.5  sm:h-42.5 max-w-screen">
                <Pie />
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-lg font-semibold text-slate-100">Solved by Difficulty</h2>
              <p className="mt-1 text-sm text-slate-400">Compare your progress</p>
              <div className="mt-6 h-32.5 sm:mt-8 sm:h-42.5">
                <CustomBar/>
              </div>
            </article>
          </div>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Performance Insights</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                <p className="text-sm text-slate-300">Current Level</p>
                <p className="mt-1 text-2xl font-semibold text-violet-200">{currentLevel}</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-slate-300">Weak Area</p>
                <p className="mt-1 text-2xl font-semibold text-amber-200">{weakestBucket.name} Problems</p>
              </div>
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
                <p className="text-sm text-slate-300">Consistency</p>
                <p className="mt-1 text-2xl font-semibold text-sky-200">{consistency}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-slate-200">
              You are solving mostly {strongestBucket.name} problems ({strongestBucket.value} solved).
              {hardSolved === 0
                ? ' Try solving Hard problems to improve faster.'
                : ` Hard problems are ${hardShare.toFixed(1)}% of your solved set.`}
            </div>
          </article>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Ranking</h2>
            <p className="mt-2 text-4xl font-bold text-slate-100">{UserData?.profile?.ranking ?? 'N/A'}</p>
            <p className="text-sm text-slate-400">Global Rank</p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Profile Overview</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Username</span>
                <span className="text-slate-100">{UserData?.username ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Solved</span>
                <span className="text-slate-100">{totalSolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reputation</span>
                <span className="text-slate-100">{UserData?.profile?.reputation ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hard Solve Share</span>
                <span className="text-slate-100">{hardShare.toFixed(1)}%</span>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">Recommendations</h2>
              <Link to={'/problems'} type="button" className="text-xs text-emerald-300 hover:text-emerald-200">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {recommendations.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-left transition hover:bg-slate-900"
                >
                  <span className="text-sm text-slate-100">{item.name}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${item.levelColor}`}>
                    {item.level}
                  </span>
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
    ) : (
      <section className="mx-auto w-full max-w-425 px-3 py-4 sm:px-4 md:px-6 md:py-6">
        <div className="flex min-h-[55vh] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Username required</h2>
            <p className="mt-2 text-sm text-slate-400">
              Please enter your LeetCode username first to view the dashboard.
            </p>
            {error && 
            <p className="mt-2 text-sm text-red-600">
            LeetCode username is not valid,Entervalid user name.
          </p>}
          </div>
        </div>
      </section>
    )}
    </>
  )
}

export default Dashboard

