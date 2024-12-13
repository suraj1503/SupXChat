import React, { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'


import Header from './Header'
import Title from '../shared/Title'
import { Drawer, Grid, Skeleton } from '@mui/material'
import ChatList from '../specific/ChatList'
import { samepleChats } from '../../constants/sampleData'
import Profile from '../specific/Profile'
import { useMyChatsQuery } from '../../redux/api/api'
import { useDispatch, useSelector } from 'react-redux'
import { setIsDeleteMenu, setIsMobile, setSelectedDeleteChat } from '../../redux/reducers/misc'
import toast from 'react-hot-toast'
import { useErrors, useSocketEvents } from '../../hooks/hook'
import { getSocket } from '../../socket'
import { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../../constants/events'
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat'
import { getOrSaveFromLocalStorage } from '../../lib/features'
import DeleteChatMenu from '../dialog/DeleteChatMenu'

// const Profile = lazy(() => import('../specific/Profile'));

const AppLayout = () => WrappedComponent => {
    return (props) => {
        const params = useParams();
        const chatId = params.chatId;

        const [onlineUsers,setOnlineUsers] = useState([])
        const dispatch = useDispatch()
        const navigate = useNavigate()
        const deleteAnchor = useRef(null)

        const { isLoading, data, isError, error, refetch } = useMyChatsQuery("")
        // console.log(refetch)
        const { isMobile } = useSelector((state) => state.misc)
        const { user } = useSelector((state) => state.auth)
        const {newMessagesAlert} = useSelector((state)=>state.chat)
        // console.log(user,"app")
        // console.log(data, "data")

        const socket = getSocket()
        // console.log(socket.id)

        useErrors([{ isError, error }])

        // console.log(data)

        useEffect(()=>{
            getOrSaveFromLocalStorage({key:NEW_MESSAGE_ALERT,value:newMessagesAlert})
        },[newMessagesAlert])

        const handleDeleteChat = (e, chatId, groupChat) => {
            dispatch(setIsDeleteMenu(true))
            dispatch(setSelectedDeleteChat({chatId,groupChat}))
            deleteAnchor.current=e.currentTarget
            // console.log("Delete Chat", chatId, groupChat);
        }

        const handleMobileClose = () => {
            dispatch(setIsMobile(false))
        }

        const newMessageAlertListner = useCallback((data)=>{
            // console.log(data,"app layout")
            if(data.chatId===chatId) return;
            dispatch(setNewMessagesAlert(data))
        },[chatId])

        const newRequestListner = useCallback(()=>{
            dispatch(incrementNotification())
        },[dispatch])

        // const onlineUsersListner = useCallback((data)=>{
        //     // console.log(data,"applayout")
        //     setOnlineUsers(data);
        // },[])

        // console.log(onlineUsers);

        const refetchListner = useCallback(()=>{
            refetch()
            navigate("/")
        },[refetch])

        const eventHandlers = { 
            [NEW_MESSAGE_ALERT]: newMessageAlertListner,
            [NEW_REQUEST]: newRequestListner,
            [REFETCH_CHATS]:refetchListner,
            // [ONLINE_USERS]:onlineUsersListner
        }
        useSocketEvents(socket, eventHandlers)

        return (
            <>
                <Title />
                <Header />
                <DeleteChatMenu dispatch={dispatch} deleteAnchor={deleteAnchor}/>
                {
                    isLoading ? (<Skeleton />) : (
                        <Drawer open={isMobile} onClose={handleMobileClose}>
                            <ChatList
                                w='70vw'
                                chats={data?.chats}
                                chatId={chatId}
                                handleDeleteChat={handleDeleteChat}
                                newMessagesAlert={newMessagesAlert}
                                onlineUsers={onlineUsers}
                            />
                        </Drawer>
                    )
                }
                <Grid container height={"calc(100vh - 4rem)"}>
                    <Grid
                        item
                        sm={4}
                        md={3}
                        sx={{
                            display: { xs: "none", sm: "block" },
                        }}
                        height={"100%"}

                    >
                        {
                            isLoading ? (<Skeleton />) : (
                                <ChatList 
                                    chats={data?.chats} 
                                    chatId={chatId}
                                    newMessagesAlert={newMessagesAlert}
                                    handleDeleteChat={handleDeleteChat}
                                    onlineUsers={onlineUsers}
                                />
                            )
                        }
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={8}
                        md={5}
                        lg={6}
                        sx={{
                            display: { xs: "none", sm: "block" }
                        }}
                        height={"100%"}
                    >
                        <WrappedComponent {...props} chatId={chatId} user={user} />
                    </Grid>
                    <Grid
                        item
                        md={4}
                        lg={3}
                        height={"100%"}
                        sx={{
                            display: { xs: "none", md: "block" },
                            padding: "1rem",
                            overflow: "hidden"
                        }}
                    >
                        {
                            user && <Profile
                                user={user}
                            />
                        }

                    </Grid>
                </Grid>
            </>
        )
    }
}

export default AppLayout