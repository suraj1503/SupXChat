
import React, { useEffect, useState } from 'react'
import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { CameraAlt as CameraAltIcon } from '@mui/icons-material'
import { useInputValidation } from '6pp'
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, getAdmin } from '../../redux/thunks/admin';

const isAdmin = false;

const AdminLogin = () => {

    const secretKey = useInputValidation("");
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const {isAdmin} = useSelector((state)=>state.auth)

    const adminSubmitHandler = (e) => {
        e.preventDefault()
        dispatch(adminLogin(secretKey.value))
        // console.log("admin submit")
    }

    //we are doing this because when we reload the state comes to it initial state, hence
    // we are redirected back to login, to handle this we call getAdmin which has cookie and it contains
    // value isAdmin=true so it updates the state as true when we reload
    useEffect(()=>{
        dispatch(getAdmin())
    },[dispatch])

    if(isAdmin) return <Navigate to='/admin/dashboard'/>
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

                    <>
                        <Typography variant='h5'>Admin Login</Typography>
                        <form style={{
                            width: "100%",
                            marginTop: "1rem"
                        }}
                            onSubmit={adminSubmitHandler}
                        >
                            <TextField
                                required
                                fullWidth
                                label="Password"
                                type='password'
                                margin='normal'
                                variant='outlined'
                                value={secretKey.value}
                                onChange={secretKey.changeHandler}
                            />

                            <Button type='submit' variant='contained' color='primary' fullWidth
                                sx={{ marginTop: "1rem" }}
                            >Login</Button>
                        </form>
                    </>
                </Paper>
            </Container>
        </div>
    )
}

export default AdminLogin