import React from 'react'
import { Stack } from '@mui/material'

import ChatItem from '../shared/ChatItem'
import { lightGray } from '../../constants/color'

const ChatList = ({
    w = "100%",
    chats = [],
    chatId,
    onlineUsers = [],
    newMessagesAlert = [
        {
            chatId: "",
            count: 0
        },
    ],
    handleDeleteChat
}) => {
    // console.log(newMessagesAlert)
    // console.log(chats,"chatlist")
    // console.log(onlineUsers,"chatlist")
    return (
        <Stack width={w} direction={"column"} overflow={"auto"} height={"100%"} bgcolor={lightGray}>
            {
                chats?.map((chat) => {
                    const { _id, avatar, name, members, groupChat } = chat;

                    const newMessageAlert = newMessagesAlert.find(({ chatId }) => chatId === _id);

                    const isOnline = members?.some((member) => onlineUsers.includes(member));

                    return (
                        <ChatItem
                            newMessageAlert={newMessageAlert}
                            isOnline={isOnline}
                            avatar={avatar}
                            name={name}
                            _id={_id}
                            key={_id}
                            groupChat={groupChat}
                            sameSender={chatId===_id}
                            handleDeleteChat={handleDeleteChat}
                        />)
                })
            }
        </Stack>
    )
}

export default ChatList