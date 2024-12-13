import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux';
import {Toaster} from 'react-hot-toast'

import ProtectRoute from './components/auth/ProtectRoute';
import { LayoutLoader } from './components/layout/Loaders';
import {server} from './constants/config'
import { userExists, userNotExists } from './redux/reducers/auth';
import { SocketProvider } from './socket';


const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Chat = lazy(() => import('./pages/Chat'));
const Groups = lazy(() => import('./pages/Groups'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(()=>import('./pages/admin/AdminLogin'))
const Dashboard = lazy(()=>import('./pages/admin/Dashboard'))
const UserManagement = lazy(()=>import('./pages/admin/UserManagement'))
const ChatManagement = lazy(()=>import('./pages/admin/ChatManagement'))
const MessageManagement = lazy(()=>import('./pages/admin/MessageManagement'))


const App = () => {

  const dispatch =useDispatch();
  const {isAuthenticated,loader} = useSelector((state)=>state.auth)
  // console.log(user)
  useEffect(()=>{
    // console.log(server)
    axios.get(`${server}/api/v1/user/my-profile`,{withCredentials:true})
      .then((res)=>{
        // console.log(res.data.data);
        dispatch(userExists(res.data.data))
      })
      .catch((err)=>dispatch(userNotExists()))
  },[dispatch])

  return loader ?<LayoutLoader/>:(
    <Router>
      <Suspense fallback={<LayoutLoader/>}>
        <Routes>
          <Route element={<SocketProvider>
            <ProtectRoute user={isAuthenticated} />
          </SocketProvider>}>
            <Route path='/' element={<Home />} />
            <Route path='/chat/:chatId' element={<Chat />} />
            <Route path='/groups' element={<Groups />} />
          </Route>
          <Route path='/login' element={<ProtectRoute user={!isAuthenticated} redirect='/'><Login /></ProtectRoute>} />
          <Route path='/admin' element={<AdminLogin/>}/>
          <Route path='/admin/dashboard' element={<Dashboard/>}/>
          <Route path='/admin/users' element={<UserManagement/>}/>
          <Route path='/admin/chats' element={<ChatManagement/>}/>
          <Route path='/admin/messages' element={<MessageManagement/>}/>
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster position='bottom-center'/>
    </Router>
  )
}

export default App