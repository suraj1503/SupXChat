import React from 'react'
import { Container, Paper, Typography } from '@mui/material'
import {DataGrid} from '@mui/x-data-grid'

const Table = ({rows,columns,heading,rowHeight=52}) => {
  return (
    <Container
        sx={{
            height:"100vh",
        }}
    >
        <Paper
            elevation={3}
            sx={{
                padding:"1rem 4rem",
                borderRadius:"1rem",
                margin:"auto",
                width:"100%",
                overflow:"hidden",
                height:"100%"
            }}
        >
            <Typography
                textAlign={"center"}
                variant='h4'
                sx={{
                    margin:"2rem",
                    textTransform:"uppercase"
                }}
            >
                {heading}
            </Typography>
            <DataGrid
                key={rows}
                rows={rows}
                columns={columns}
                rowHeight={rowHeight}
                
                style={{
                    height:"80%"
                }}
                sx={{
                    border:"none",
                    ".table-header":{
                        bgcolor:"black",
                        color:"white"
                    },
            
                }}
            />
        </Paper>
    </Container>
  )
}

export default Table