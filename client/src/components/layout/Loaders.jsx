import React from 'react'
import { Grid, Skeleton, Stack } from '@mui/material'
import {BouncingSkeleton} from '../styles/StyledComponents'

const LayoutLoader = () => {
    return (
        <Grid container height={"calc(100vh-4rem)"} spacing={"1rem"}>
            <Grid
                item
                sm={4}
                md={3}
                sx={{
                    display: { xs: "none", sm: "block" }
                }}
                height={"100%"}
            >
                <Skeleton variant='rectangular' height={"100vh"} />
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
                overflow={"hidden"}
            >
                <Stack spacing={"1rem"}>
                    {
                        Array.from({ length: 10 }).map((_, index) => (
                            <Skeleton key={index} variant='rounded' height={"3rem"} />
                        ))
                    }
                </Stack>

            </Grid>
            <Grid
                item
                md={4}
                lg={3}
                height={"100%"}
                sx={{
                    display: { xs: "none", md: "block" },
                    // padding:"2rem",
                    // bgcolor: "rgba(0,0,0,0.85)"
                }}

            >
                <Skeleton variant='rectangular' height={"100vh"} />
            </Grid>
        </Grid>
    )
}

const TypingLoader = () => {
    return (
        <Stack
            spacing={"0.5rem"}
            direction={"row"}
            padding={"0.5rem"}
            justifyContent={"center"}
        >
            <BouncingSkeleton
                variant="circular"
                width={15}
                height={15}
                style={{
                    animationDelay: "0.1s",
                }}
            />
            <BouncingSkeleton
                variant="circular"
                width={15}
                height={15}
                style={{
                    animationDelay: "0.2s",
                }}
            />
            <BouncingSkeleton
                variant="circular"
                width={15}
                height={15}
                style={{
                    animationDelay: "0.4s",
                }}
            />
            <BouncingSkeleton
                variant="circular"
                width={15}
                height={15}
                style={{
                    animationDelay: "0.6s",
                }}
            />
        </Stack>
    );
};

export { LayoutLoader, TypingLoader }