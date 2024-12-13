import { useNavigate } from 'react-router-dom';
import { useLazyGetSpecificChatDetailsQuery } from '../../redux/api/api';
import { Avatar, Box, IconButton, Menu, Stack, Typography } from '@mui/material';
import { Call as CallIcon, Chat as ChatIcon, Info as InfoIcon, VideoCall as VideoCallIcon} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useErrors } from '../../hooks/hook';
const SenderProfileDialog = ({ sender, closeHandler, openHandler, anchorEl }) => {
    const { name, avatar, _id } = sender;
    const navigate = useNavigate();

    const [fetchChatDetails, { data, isLoading, error,isError }] = useLazyGetSpecificChatDetailsQuery();
    // console.log(data);

    // const { data, isLoading, error } = useLazyGetSpecificChatDetailsQuery(_id);
    // console.log(data);

    const chatHandler = async () => {
        const { data: chatDetails } = await fetchChatDetails(_id);  // Pass senderId to the query

        if (chatDetails && chatDetails.chats.length > 0) {
            const chatId = chatDetails.chats[0]._id;
            navigate(`/chat/${chatId}`);  // Redirect to chat page
        } else {
            console.error("No chat available");
        }
    };

    useErrors([{error,isError}])

    return (
        <Menu open={openHandler} onClose={closeHandler} anchorEl={anchorEl}>
            <div style={{ width: "12rem", height: "14rem", position: "relative", top: "-8px" }}>
                <Typography
                    variant="h6"
                    sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "#fff",
                        padding: "0.5rem",
                        position: "absolute",
                        top: 0,
                        zIndex: 100,
                        width: "100%",
                    }}
                >
                    {name}
                </Typography>
                <Box
                    sx={{
                        position: "relative",
                        bgcolor: "#fff",
                        borderRadius: "0 0 8px 8px",
                        boxShadow: 3,
                    }}
                >
                    <Stack flexDirection="row" justifyContent="center" marginTop={"0rem"} padding={"0"}>
                        <Avatar
                            src={avatar.url}
                            sx={{ height: "12rem", width: "100%", borderRadius: "4px" }}
                        />
                    </Stack>
                </Box>
                <Stack flexDirection={"row"} justifyContent={"center"} alignItems={"center"}>
                    <IconButton size="large" onClick={chatHandler}>
                        <ChatIcon />
                    </IconButton>
                    <IconButton size="large">
                        <CallIcon />
                    </IconButton>
                    <IconButton size="large">
                        <VideoCallIcon />
                    </IconButton>
                    <IconButton size="large">
                        <InfoIcon />
                    </IconButton>
                </Stack>
            </div>
        </Menu>
    );
};

export default SenderProfileDialog;
