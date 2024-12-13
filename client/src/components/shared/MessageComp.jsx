import React, { memo, useRef, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { motion } from 'framer-motion';
import { ligthblue } from '../../constants/color';
import { fileFormat } from '../../lib/features';
import RenderAttachment from './RenderAttachment';
import SenderProfileDialog from '../dialog/SenderProfileDialog';
import { useChatDetailsQuery } from '../../redux/api/api';

const MessageComp = ({ message, user, chatId }) => {
    const [sendProfile, setSenderProfile] = useState(false);
    const { sender, content, attachments, createdAt } = message;
    const sameSender = sender._id === user._id;
    const timeAgo = moment(createdAt).fromNow();

    const { data, error } = useChatDetailsQuery({ chatId });
    const profileRef = useRef(null);

    // Determine if the chat is a group chat
    const isGroupChat = data?.chat?.groupChat;

    const showSenderProfile = (e) => {
        if (isGroupChat) {
            profileRef.current = e.currentTarget;
            setSenderProfile(true);
        }
    };

    const closeSenderProfile = () => {
        setSenderProfile(false);
    };

    // Error handling
    if (error) {
        return <Typography color="error">Failed to load chat details</Typography>;
    }

    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            justifyContent={sameSender ? "flex-end" : "flex-start"}
            style={{ width: "100%" }}
        >
            {/* Render the avatar only if it's a group chat and the sender is not the current user */}
            {!sameSender && isGroupChat && (
                <motion.div
                    initial={{ opacity: 0, x: "-100%" }}
                    whileInView={{ opacity: 1, x: 0 }}
                >
                    <Avatar
                        src={sender.avatar.url}
                        sx={{
                            width: 25,
                            height: 25,
                            border: "2px solid #000",
                            cursor: "pointer"
                        }}
                        onClick={showSenderProfile}
                    />
                </motion.div>
            )}
            <motion.div
                initial={{ opacity: 0, x: "-100%" }}
                whileInView={{ opacity: 1, x: 0 }}
                style={{
                    backgroundColor: sameSender ? "#E3F2FD" : "#F1F8E9",
                    color: "#212121",
                    borderRadius: "5px",
                    padding: "0.5rem",
                    width: "fit-content",
                    fontSize: ".9rem",
                    alignSelf: sameSender ? "flex-end" : "flex-start",
                }}
            >
                {!sameSender && (
                    <Typography color={ligthblue} fontWeight={"600"} variant='caption'>
                        {sender.name}
                    </Typography>
                )}
                {content && (
                    <Typography>{content}</Typography>
                )}
                {attachments?.length > 0 && attachments.map((attachment, index) => {
                    const url = attachment.url;
                    const file = fileFormat(url);

                    return (
                        <Box key={index}>
                            <a href={url} target='_blank' download style={{ color: "black" }}>
                                {RenderAttachment(file, url)}
                            </a>
                        </Box>
                    );
                })}
                <Typography variant='caption' color={"text.secondary"}>
                    {timeAgo}
                </Typography>
            </motion.div>
            {sendProfile && (
                <SenderProfileDialog
                    sender={sender}
                    openHandler={sendProfile}
                    closeHandler={closeSenderProfile}
                    anchorEl={profileRef.current}
                />
            )}
        </Stack>
    );
};

export default memo(MessageComp);
