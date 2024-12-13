import { Menu, Stack, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { setIsDeleteMenu } from '../../redux/reducers/misc'
import { Delete as DeleteIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material'
import { useAsyncMutation } from '../../hooks/hook'
import { useDeleteChatMutation, useLeaveChatMutation } from '../../redux/api/api'
import { useNavigate } from 'react-router-dom'

const DeleteChatMenu = ({ dispatch, deleteAnchor }) => {

    const navigate=useNavigate()

    const { isDeleteMenu, selectedDeleteChat } = useSelector((state) => state.misc)
    // console.log(selectedDeleteChat.chatId);

    const[deleteChat,_,deleteChatData]=useAsyncMutation(useDeleteChatMutation)
    const[leaveChat,__,leaveGroupData]=useAsyncMutation(useLeaveChatMutation)

    const closeHandler = () => {
        dispatch(setIsDeleteMenu(false))
        deleteAnchor.current=null
    }

    const leaveGroupHandler=()=>{
        leaveChat("Leaving chat...",selectedDeleteChat.chatId)
    }
    const deleteChatHandler=()=>{
        deleteChat("Deleting chat...",selectedDeleteChat.chatId)
    }

    useEffect(()=>{
        if(deleteChatData || leaveGroupData) 
            navigate("/") 
    },[deleteChatData,leaveGroupData])

    return (
        <Menu
            open={isDeleteMenu}
            onClose={closeHandler}
            anchorEl={deleteAnchor.current}
            anchorOrigin={{
                vertical:"bottom",
                horizontal:"right"
            }}
            transformOrigin={{
                vertical:"center",
                horizontal:"center"
            }}
        >
            <Stack
                sx={{
                    width: "10rem",
                    padding: "0.5rem",
                    cursor: "pointer"
                }}
                direction={"row"}
                alignItems={"center"}
                spacing={"0.5rem"}
                onClick={selectedDeleteChat.groupChat?leaveGroupHandler:deleteChatHandler}
            >
                {
                    selectedDeleteChat.groupChat ? (
                        <>
                            <ExitToAppIcon/>
                            <Typography>Leave Group</Typography>
                        </>
                    ):( 
                        <>
                            <DeleteIcon/>
                            <Typography>Delete Chat</Typography>
                        </>
                    )
                }
            </Stack>
        </Menu>
    )
}

export default DeleteChatMenu