import React from 'react'
import AppLayout from '../components/layout/AppLayout'
import { Box, Typography } from '@mui/material';

const Home = () => {
  return (
    <Box
      bgcolor={"rgba(0,0,0,0.1)"}
      height={"100%"}
    >
      <Typography
        p={"2rem"}
        variant='h6'
        textAlign={"center"}
      >
        Select a friend to chat!!
      </Typography>
    </Box>
  )
}

export default AppLayout()(Home);


//Applayout expects a function in which we home

// export default (props)=>{
//   return (
//     <div>
//       <div>Header</div>
//       <Home {...props}/>
//       <div>Footer</div>
//     </div>
//   )
// }