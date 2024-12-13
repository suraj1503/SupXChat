import React, { useState } from 'react';
import { Avatar, Stack, Typography, Box, Modal, Backdrop } from '@mui/material';
import { 
  Face as FaceIcon, 
  AlternateEmail as UsernameIcon, 
  CalendarMonth as CalendarIcon, 
  InfoOutlined as InfoIcon 
} from '@mui/icons-material';
import moment from 'moment';
import { transformImage } from '../../lib/features';

const Profile = ({ user }) => {
    const { avatar, name, bio, username, createdAt } = user;

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Box
                sx={{
                    height: "100vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "1rem",
                    backgroundColor: "#F3E5F5", // Soft Lavender
                    borderRadius: "12px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                    margin: "0",
                    maxWidth: "400px",
                }}
            >
                <Avatar
                    sx={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                        marginBottom: "1rem",
                        border: "5px solid #FFFFFF", // White Border
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                    }}
                    src={avatar && avatar.url ? transformImage(avatar.url) : ''}
                    onClick={handleOpen}
                />
                <ProfileCard heading={"Bio"} text={bio} Icon={<InfoIcon />} />
                <ProfileCard heading={"Username"} text={username} Icon={<UsernameIcon />} />
                <ProfileCard heading={"Name"} text={name} Icon={<FaceIcon />} />
                <ProfileCard heading={"Joined"} text={moment(createdAt).fromNow()} Icon={<CalendarIcon />} />
            </Box>

            <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } // Dark backdrop
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        outline: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: "100vw",
                            maxHeight: "100vh",
                            overflow: "hidden",
                            backgroundColor: "#1c1c1c", // Dark Background for Modal
                            borderRadius: "8px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        <img
                            src={avatar && avatar.url ? transformImage(avatar.url) : ''}
                            alt="Profile"
                            style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                </Box>
            </Modal>
        </>
    );
}

const ProfileCard = ({ text, Icon, heading }) => {
    return (
        <Stack
            direction={"row"}
            alignItems={"center"}
            spacing={"1rem"}
            sx={{
                backgroundColor: "#7B1FA2", // Violet Background for Cards
                color: "white",
                textAlign: "center",
                width: "100%",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                wordWrap: "break-word",
                maxWidth: "100%",
            }}
        >
            <Box width={"30px"} display={"flex"} justifyContent={"center"}>
                {Icon && Icon}
            </Box>
            <Box flexGrow={1} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                <Typography 
                    variant="body1" 
                    sx={{ 
                        fontWeight: 500, 
                        color: "#FFFFFF", // White Text
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}>
                    {text}
                </Typography>
                <Typography 
                    variant="caption" 
                    sx={{ color: "lightgray" }}> {/* Light Gray Caption */}
                    {heading}
                </Typography>
            </Box>
        </Stack>
    );
}

export default Profile;
