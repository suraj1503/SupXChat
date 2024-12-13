import { Add as AddIcon, Group as GroupIcon, Logout as LogoutIcon, Menu as MenuIcon, Notifications as NotificationsIcon, Search as SearchIcon } from '@mui/icons-material'
import { AppBar, Backdrop, Badge, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

import axios from 'axios'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { amber, deepBlue } from '../../constants/color'
import { server } from '../../constants/config'
import { userNotExists } from '../../redux/reducers/auth'
import { resetNotification } from '../../redux/reducers/chat'
import { setIsMobile, setIsNewGroup, setIsNotification, setIsSearch } from '../../redux/reducers/misc'

const SearchDialog = lazy(() => import('../specific/Search'));
const NotificationDialog = lazy(() => import('../specific/Notification'));
const NewGroupDialog = lazy(() => import('../specific/NewGroup'))

const Header = () => {

  // const [isNewGroup, setIsNewGroup] = useState(false);


  const {isSearch, isNotification, isNewGroup} =useSelector((state)=>state.misc)
  const {notificationCount} = useSelector((state)=>state.chat)

  const dispatch = useDispatch()
  const navigate = useNavigate();


  const handlerMobile = () => {
    dispatch(setIsMobile(true))
  }

  const openSearch = () => {
    dispatch(setIsSearch(true))
  }

  const openNewGroup = () => {
    dispatch(setIsNewGroup(true))
  }

  const navigateToGroup = () => {
    navigate("/groups")
  }

  const notificationHandler = () => {
    dispatch(setIsNotification(true))
    dispatch(resetNotification())
  }

  const logoutHandler = async() => {
    try {
      const {data}=await axios.get(`${server}/api/v1/user/logout`,{withCredentials:true})
      // console.log(data)
      dispatch(userNotExists())
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!")
    }
    console.log("logged out")
  }

  return (
    <>
      <Box sx={{
        flexGrow: 1
      }} Search
        height={"4rem"}
      >
        <AppBar position="static" sx={{
          backgroundColor: `${deepBlue}`

        }}>

          <Toolbar>
            <Typography variant='h6' sx={{
              display: { xs: "none", sm: "block" },
              color: `#fff`
            }}

            >
              SupX
            </Typography>

            <Box
              sx={{
                display: { xs: "block", sm: "none" }
              }}
            >
              <IconBtn icon={<MenuIcon />} onClick={handlerMobile} />
            </Box>
            <Box sx={{
              flexGrow: 1
            }} />

            <Box>
              <IconBtn title='Search' icon={<SearchIcon/>} onClick={openSearch} />
              <IconBtn title='New Group' icon={<AddIcon />} onClick={openNewGroup} />
              <IconBtn title='Manage Groups' icon={<GroupIcon />} onClick={navigateToGroup} />
              <IconBtn title='Notification' icon={<NotificationsIcon />} onClick={notificationHandler} value={notificationCount}/>
              <IconBtn icon={<LogoutIcon />} onClick={logoutHandler} />
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      {
        isSearch && (
          <Suspense fallback={<Backdrop open/>}>
            <SearchDialog />
          </Suspense>
        )
      }

      {
        isNotification && (
          <Suspense fallback={<Backdrop open/>}>
            <NotificationDialog/>
          </Suspense>
        )
      }
      {
        isNewGroup && (
          <Suspense fallback={<Backdrop open/>}>
            <NewGroupDialog/>
          </Suspense>
        )
      }
    </>
  )
}

const IconBtn = ({ title = "", icon, onClick,value }) => {
  // console.log(value,"Header")  
  return (
    <Tooltip title={title}>
      <IconButton sx={{color:`${amber}`}} size='large' onClick={onClick}>
        {
          value?<Badge badgeContent={value} color='error'>{icon}</Badge>:icon
        }
      </IconButton>
    </Tooltip>
  )
}

export default Header