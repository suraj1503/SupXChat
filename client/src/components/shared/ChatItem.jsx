import React,{memo} from 'react'
import {motion} from 'framer-motion'


import {Link} from '../styles/StyledComponents'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import AvatarCard from './AvatarCard'

const ChatItem = ({
    avatar=[],
    name,
    _id,
    groupChat=false,
    sameSender,
    isOnline,
    newMessageAlert,
    index=0,
    handleDeleteChat
}) => {
    // console.log(newMessageAlert)
  return (
    <Link
      sx={{
        padding: "0",
      }}
      to={`/chat/${_id}`}
      onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)}
    >
      <motion.div
        initial={{opacity:0,y:"-100%"}}
        whileInView={{opacity:1,y:0}}
        transition={{delay:index*0.5}}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          backgroundColor: sameSender ? "#BBDEFB" : "unset",
          color: sameSender ? "#E3F2FD" : "unset",
          position: "relative",
          padding: "1rem",
        }}
      >
        <AvatarCard avatar={avatar} />

        <Stack>
          <Typography>{name}</Typography>
          {newMessageAlert && !sameSender && (
            <Typography>{newMessageAlert.count} new messages</Typography>
          )}
        </Stack>

        {isOnline && (
          <Box
            sx={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "green",
              position: "absolute",
              top: "50%",
              right: "1rem",
              transform: "translateY(-50%)",
            }}
          />
        )}
      </motion.div>
    </Link>
  )
}

export default memo(ChatItem)


// import React, { memo } from 'react';
// import { motion } from 'framer-motion';
// import { Link } from '../styles/StyledComponents';
// import { Avatar, Box, Stack, Typography } from '@mui/material';
// import AvatarCard from './AvatarCard';

// const ChatItem = ({
//   avatar = [],
//   name,
//   _id,
//   groupChat = false,
//   sameSender,
//   isOnline,
//   newMessageAlert,
//   index = 0,
//   handleDeleteChat,
// }) => {
//   const containerVariants = {
//     hidden: { opacity: 0, y: 50, scale: 0.8 },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       scale: 1,
//       transition: { 
//         type: 'spring', 
//         stiffness: 300, 
//         damping: 20, 
//         delay: index * 0.15 
//       } 
//     },
//     hover: {
//       scale: 1.02,
//       boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)',
//       transition: { 
//         type: 'spring', 
//         stiffness: 200 
//       },
//     },
//     tap: {
//       scale: 0.95,
//       transition: { 
//         type: 'spring', 
//         stiffness: 300 
//       },
//     },
//   };

//   return (
//     <Link
//       sx={{ padding: '0' }}
//       to={`/chat/${_id}`}
//       onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)}
//     >
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         whileHover="hover"
//         whileTap="tap"
//         style={{
//           display: 'flex',
//           gap: '1rem',
//           alignItems: 'center',
//           backgroundColor: sameSender ? 'black' : 'unset',
//           color: sameSender ? 'white' : 'unset',
//           position: 'relative',
//           padding: '1rem',
//           borderRadius: '8px',
//           overflow: 'hidden',
//         }}
//       >
//         <AvatarCard avatar={avatar} />

//         <Stack>
//           <Typography variant="h6" component="p" fontWeight="500">
//             {name}
//           </Typography>
//           {newMessageAlert && !sameSender && (
//             <Typography variant="body2" color="textSecondary">
//               {newMessageAlert.count} new messages
//             </Typography>
//           )}
//         </Stack>

//         {isOnline && (
//           <Box
//             sx={{
//               width: '10px',
//               height: '10px',
//               borderRadius: '50%',
//               backgroundColor: 'green',
//               position: 'absolute',
//               top: '50%',
//               right: '1rem',
//               transform: 'translateY(-50%)',
//             }}
//           />
//         )}
//       </motion.div>
//     </Link>
//   );
// };

// export default memo(ChatItem);
