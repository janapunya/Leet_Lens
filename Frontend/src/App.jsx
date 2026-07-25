import Sightbar from './components/Sightbar'
import Header from './components/Header'
import AppRoutes from './routs/AppRoutes'
import {User_nameContext, error_context,User_dataContext} from './routs/CreateContext'
import { useState } from 'react'
import { CurrentQuestionContext } from './routs/CreateContext'
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [submittedUsername, setSubmittedUsername] = useState('')
  const [error, setError] = useState('')
  const [UserData, setUserData] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  return (
    <>
    <User_nameContext.Provider value={{submittedUsername, setSubmittedUsername}}>
      <error_context.Provider value={{error, setError}}>
        <User_dataContext.Provider value={{UserData, setUserData}}>
        <CurrentQuestionContext.Provider value={{currentQuestion, setCurrentQuestion}}>

        
      <div className=" max-h-screen max-w-screen  bg-slate-950/99 text-white md:flex scrollbar-hide">
        <Sightbar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Header onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
          <main className="min-h-0 flex-1 overflow-y-scroll scrollbar-hide bg-slate-950/99">
            <AppRoutes />
          </main>
        </div>
      </div>
        </CurrentQuestionContext.Provider>
        </User_dataContext.Provider>

      </error_context.Provider>
    </User_nameContext.Provider>
    </>
  )
}

export default App
