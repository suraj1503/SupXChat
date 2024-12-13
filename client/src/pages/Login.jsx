import React, { useState } from 'react'
import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { CameraAlt as CameraAltIcon } from '@mui/icons-material'
import { useFileHandler, useInputValidation, useStrongPassword } from '6pp'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import { VisuallyHiddenInput } from '../components/styles/StyledComponents';
import { usernameValidator } from '../utils/validators';
import { server } from '../constants/config';
import { userExists } from '../redux/reducers/auth';


const Login = () => {

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading,setIsLoading] = useState(false)

    const name = useInputValidation("");
    const bio = useInputValidation("");
    const username = useInputValidation("", usernameValidator);
    const password = useInputValidation("");

    const avatar = useFileHandler("single");

    const dispatch = useDispatch();

    const signUpHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true)

        const toastId=toast("Signing Up...")
        const formData=new FormData();
        formData.append("avatar",avatar.file)
        formData.append("name",name.value)
        formData.append("bio",bio.value)
        formData.append("username",username.value)
        formData.append("password",password.value)
        
        // for (let pair of formData.entries()) {
        //     const [key, value] = pair;
        
        //     if (value instanceof File) {
        //         // Log file details like name, size, and type
        //         console.log(`${key}: [File Name: ${value.name}, File Size: ${value.size} bytes, File Type: ${value.type}]`);
        //     } else {
        //         console.log(`${key}: ${value}`);
        //     }
        // }
        
        const config = {
            withCredentials: true,
            headers: {
                // "Content-Type": "application/json"
            },
        }

        try {
            const {data} = await axios.post(`${server}/api/v1/user/new-user`,
                formData,
                config
            )
            dispatch(userExists(data.user));
            toast.success(data.data.data.message,{id:toastId})
        } catch (error) {
            // console.log(error)
            toast.error(error?.response?.data?.message || "Something went wrong!",{id:toastId})
        }finally{
            setIsLoading(false)
        }

    }

    const logInHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const toastId=toast("Logging In...")
        const config = {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json"
            },
        }
        try {
            const {data} = await axios.post(`${server}/api/v1/user/login`,
                {
                    username: username.value,
                    password: password.value
                },
                config
            );
            console.log(data)
            dispatch(userExists(data.user));
            toast.success(data.message,{id:toastId})
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong!!",{id:toastId})
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <div
            style={{
                backgroundImage: "linear-gradient(rgba(200,200,200,0.5),rgba(120,110,200,0.5))"
            }}
        >
            <Container
                component={"main"} maxWidth="xs"
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    {
                        isLogin ? (
                            <>
                                <Typography variant='h5'>Login</Typography>
                                <form style={{
                                    width: "100%",
                                    marginTop: "1rem"
                                }}
                                    onSubmit={logInHandler}
                                >
                                    <TextField
                                        required
                                        fullWidth
                                        label="Username"
                                        margin='normal'
                                        variant='outlined'
                                        value={username.value}
                                        onChange={username.changeHandler}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Password"
                                        type='password'
                                        margin='normal'
                                        variant='outlined'
                                        value={password.value}
                                        onChange={password.changeHandler}
                                    />

                                    <Button type='submit' variant='contained' color='primary' fullWidth
                                        sx={{ marginTop: "1rem" }} disabled={isLoading}
                                    >Login</Button>
                                    <Typography textAlign={"center"} m={"1rem"}>OR</Typography>

                                    <Button
                                        type='submit'
                                        variant='text'
                                        color='secondary'
                                        fullWidth
                                        onClick={() => setIsLogin(false)}
                                        disabled={isLoading}
                                    >
                                        Sign Up Instead
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Typography variant='h5'>Sign Up</Typography>
                                <form style={{
                                    width: "100%",
                                    marginTop: "1rem"
                                }}
                                    onSubmit={signUpHandler}
                                >

                                    <Stack
                                        position={"relative"}
                                        width={"10rem"}
                                        margin={"auto"}
                                    >
                                        <Avatar
                                            sx={{
                                                width: "10rem",
                                                height: "10rem",
                                                objectFit: "contain"
                                            }}
                                            src={avatar.preview}
                                        />
                                        <IconButton
                                            sx={{
                                                position: "absolute",
                                                bottom: "0",
                                                right: "0",
                                                color: "white",
                                                bgcolor: "rgba(0,0,0,0.5)",
                                                ":hover": {
                                                    bgcolor: "rgba(0,0,0,0.7)"
                                                }

                                            }}
                                            component="label"
                                        >
                                            <>
                                                <CameraAltIcon />
                                                <VisuallyHiddenInput type='file' onChange={avatar.changeHandler} />
                                            </>
                                        </IconButton>
                                    </Stack>

                                    {
                                        avatar.error && (
                                            <Typography variant='caption' color="error" m={"1rem"} width={"fit-content"} display={"block"}>
                                                {avatar.error}
                                                {/* {console.log(avatar.error,"hi")} */}
                                            </Typography>
                                        )
                                    }

                                    <TextField
                                        required
                                        fullWidth
                                        label="Name"
                                        margin='normal'
                                        variant='outlined'
                                        value={name.value}
                                        onChange={name.changeHandler}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Username"
                                        margin='normal'
                                        variant='outlined'
                                        value={username.value}
                                        onChange={username.changeHandler}
                                    />
                                    {
                                        username.error && (
                                            <Typography variant='caption' color="error">
                                                {username.error}
                                            </Typography>
                                        )
                                    }
                                    <TextField
                                        required
                                        fullWidth
                                        label="Bio"
                                        margin='normal'
                                        variant='outlined'
                                        value={bio.value}
                                        onChange={bio.changeHandler}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Password"
                                        type='password'
                                        margin='normal'
                                        variant='outlined'
                                        value={password.value}
                                        onChange={password.changeHandler}
                                    />
                                    {
                                        password.error && (
                                            <Typography variant='caption' color="error">
                                                {password.error}
                                            </Typography>
                                        )
                                    }

                                    <Button type='submit' variant='contained' color='primary' fullWidth
                                        sx={{ marginTop: "1rem" }} disabled={isLoading}
                                    >Sign Up</Button>
                                    <Typography textAlign={"center"} m={"1rem"}>OR</Typography>

                                    <Button
                                        type='submit'
                                        variant='text'
                                        color='secondary'
                                        fullWidth
                                        onClick={() => setIsLogin(true)}
                                        disabled={isLoading}
                                    >
                                        Login Instead
                                    </Button>
                                </form>
                            </>
                        )
                    }
                </Paper>
            </Container>
        </div>
    )
}

export default Login