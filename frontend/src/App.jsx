import { Navigate, Route,Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'


import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LogInPage from './pages/auth/login/LogInPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import LoadingSpinner from './components/common/LoadingSpinner'





function App() {
    const {data:authUser,isLoading}=useQuery({
      //query key to give unique name to query and refer them later:
        queryKey:['authUser'],
        queryFn:async()=>{
           try {
            //make a get request on backend: to find the current user:
            const res=await fetch("api/auth/me")
            //retrive the data:
            const data =await res.json();
            if(data.error) return null;
            //invalid response:
            if(!res.ok) throw new Error(data.error || "something went wrong:");
            //return data:
            console.log("auth user is here" , data);
            return data;
           } catch (error) {
              throw new Error(error);
           }
        },
        retry:false
    })
 
    //handle the loading component:
    if (isLoading) {
      return (
        <div className='h-screen flex justify-center items-center'>
          <LoadingSpinner size='lg' />
        </div>
      );
    }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/>}
			<Routes>
				<Route path='/' element={ authUser ? <HomePage/> : <Navigate to='/login'/>} />
				<Route path='/signup' element={!authUser ? <SignUpPage/> : <Navigate to='/'/>} />
				<Route path='/login' element={!authUser ?<LogInPage/>: <Navigate to='/'/>} />
        <Route path='/notifications' element={authUser ?<NotificationPage/> : <Navigate to='/login'/>} />
        <Route path='/profile/:username' element={authUser ?<ProfilePage/>:<Navigate to='/login'/>} />
			</Routes>
      { authUser && <RightPanel/> }
      <Toaster/>
		</div>
  )
}

export default App
