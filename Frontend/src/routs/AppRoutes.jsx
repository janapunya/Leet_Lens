import { Routes, Route } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import Profile from '../components/Profile'
import AdminPanel from '../components/AdminPanel'
import Problems from '../components/Problems'
import Coding from '../components/Coding'
import Analysis from '../components/Analysis'
import Feed from '../components/Feed'
const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/bar' element={<Profile/>}/>
        <Route path='/admin' element={<AdminPanel/>}/>
        <Route path='/problems/:id/:slug' element={<Coding/>}/>
        <Route path='/problems' element={<Problems/>}/>
        <Route path='/analysis' element={<Analysis/>}/>
        <Route path='/feed' element={<Feed/>}/>
    </Routes>
  )
}

export default AppRoutes