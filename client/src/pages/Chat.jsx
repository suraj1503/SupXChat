import { useInfiniteScrollTop } from '6pp';
import { AttachFile as AttachFileIcon, Mic as MicIcon, Send as SendIcon } from '@mui/icons-material';
import { IconButton, Skeleton, Stack } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDispatch } from 'react-redux';
import FileMenu from '../components/dialog/FileMenu';
import AppLayout from '../components/layout/AppLayout';
import MessageComp from '../components/shared/MessageComp';
import { InputBox } from '../components/styles/StyledComponents';
import { grayColor } from '../constants/color';
import { ALERT, CHAT_JOIN, CHAT_LEAVE, NEW_MESSAGE, START_TYPING, STOP_TYPING } from '../constants/events';
import { useErrors, useSocketEvents } from '../hooks/hook';
import { useChatDetailsQuery, useGetMessagesQuery } from '../redux/api/api';
import { setIsFileMenu } from '../redux/reducers/misc';
import { getSocket } from '../socket';
import { removeNewMessagesAlert } from '../redux/reducers/chat';
import { TypingLoader } from '../components/layout/Loaders';
import { useNavigate } from 'react-router-dom';
// import { skip } from 'node:test';

const Chat = ({ chatId, user }) => {
  // console.log(user,"Chat")
  const containerRef = useRef(null);
  const dispatch = useDispatch()

  const socket = getSocket();
  const navigate=useNavigate()

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)
  const [anchor, setAnchor] = useState(null)

  const [IamTyping, setIamTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)

  const typingTimeout = useRef(null);
  const bottomRef = useRef(null)

  const chatDetails = useChatDetailsQuery({ chatId })
  // console.log(chatDetails?.data?.chat.members)

  const oldMessageChunk = useGetMessagesQuery({ chatId, page })
  // console.log("oldMessageCHunk", oldMessageChunk?.data)

  // in this hook page number will increase and next data messages will get loaded
  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessageChunk.data?.totalPages,
    page,
    setPage,
    oldMessageChunk.data?.messages
  )

  const members = chatDetails?.data?.chat.members

  // console.log(userTyping)
  
  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessageChunk.isError, error: oldMessageChunk.error }
  ]

  const fileOpenHandler = (e) => {
    dispatch(setIsFileMenu(true))
    setAnchor(e.currentTarget)
  }

  const messageChangeHandler = (e) => {
    setMessage(e.target.value)
    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId })
      setIamTyping(true)
    }

    //when we hit this Handler the setTimeout is not fully completed so we should clear the unfinished
    // Timeout
    if (typingTimeout.current)
      clearTimeout(typingTimeout.current)

    //setTimout returns an ID so we are storing that in current
    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId })
      setIamTyping(false)
    }, [2000])
  }

  const submitMessageHandler = (e) => {
    e.preventDefault();

    if (!message.trim()) return

    //emitting message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("")
  };

  //we are setting value again when the chatId is changed and using it inside return clean up function
  // to avoid re-render
  useEffect(() => {
    // if(user || user._id){
    //   console.log("No user found!")
    //   socket.emit(CHAT_JOIN, { userId: user._id, members });
    // }
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      // socket.emit(CHAT_LEAVE, { userId: user._id, members });
    };
  }, [chatId,user]);


  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth"
      })
    }
  }, [messages])

  useEffect(()=>{
    if(!chatDetails?.data?.chat) return navigate("/")
  },[chatDetails.data])

  const newMessageListner = useCallback((data) => {
    // console.log(data,"new message")
    if (data?.chatId != chatId) return
    setMessages((prev) => [...prev, data.message])
  }, [chatId])

  const startTypingListner = useCallback((data) => {
    if (data?.chatId != chatId) return
    setUserTyping(true)
  }, [chatId])

  const stopTypingListner = useCallback((data) => {
    // console.log(data,"data")
    if (data?.chatId != chatId) return
    setUserTyping(false)
  }, [chatId])

  // console.log(messages)
  // console.log(oldMessages,"old")

  const alertListner = useCallback((data) => {
    if(data.chatId!==chatId) return
    const messageForAlert = {
      content: data.message,
      sender: { 
        _id: Math.random() * 100,
        name: "ADMIN"
      },
      chat: chatId,
      createdAt: new Date().toISOString()
    };

    setMessages((prev)=>[...prev,messageForAlert])

  }, [chatId])

  const eventHandlers = {
    [ALERT]: alertListner,
    [NEW_MESSAGE]: newMessageListner,
    [START_TYPING]: startTypingListner,
    [STOP_TYPING]: stopTypingListner,
  }
  useSocketEvents(socket, eventHandlers)
  useErrors(errors)

  const allMessages = [...oldMessages, ...messages]

  // console.log(allMessages,"all")

  return chatDetails.isLoading ? <Skeleton /> : (
    <>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto"
        }}
      >

        {
          allMessages.map((message) => (
            <MessageComp
              message={message}
              user={user}
              key={message._id}
              chatId={chatId}
            />
          ))
        }
        {
          userTyping && <TypingLoader />
        }
        <div ref={bottomRef} />
      </Stack>

      <form
        style={{
          height: "10%"
        }}
        onSubmit={submitMessageHandler}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: "1rem",
              rotate: "30deg",
              color: "#4CAF50"
            }}
            onClick={fileOpenHandler}
          >
            <AttachFileIcon />
          </IconButton>

          <InputBox
            placeholder='Type message here...'
            value={message} // Bind input value to state
            sx={{
              fontSize: ".9rem",
              backgroundColor:"#EEEEEE"
            }}
            onChange={messageChangeHandler}
          />

          <IconButton
            type='submit'
            size='small'
            sx={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              marginLeft: "1rem",
              padding: "0.5rem",
              ":hover": {
                bgcolor: "primary.main"
              }
            }}
          >
            {message.trim().length < 1 ? <MicIcon /> : <SendIcon sx={{ rotate: "-30deg"}} />}
          </IconButton>
        </Stack>
      </form>

      <FileMenu anchorE1={anchor} chatId={chatId} />
    </>
  );
};

export default AppLayout()(Chat);
