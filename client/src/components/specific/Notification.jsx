import React, { memo } from 'react'
import { Avatar, Button, Dialog, DialogTitle, ListItem, Skeleton, Stack, Typography } from '@mui/material'

import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '../../redux/api/api'
import { useAsyncMutation, useErrors } from '../../hooks/hook'
import { useDispatch, useSelector } from 'react-redux'
import { setIsNotification } from '../../redux/reducers/misc'
import toast from 'react-hot-toast'

const Notification = () => {
  const dispatch = useDispatch()
  const { isLoading, data, error, isError } = useGetNotificationsQuery()

  const [acceptFriendRequest] = useAsyncMutation(useAcceptFriendRequestMutation)
  
  const { isNotification } = useSelector((state) => state.misc)

  const friendRequestHandler = async({ _id, accept }) => {
    // Handler logic here
    console.log(_id,accept)
    dispatch(setIsNotification(false))
    await acceptFriendRequest("Accepting...",{requestId:_id,accept})

  }

  const closeNotificationHandler = () => {
    dispatch(setIsNotification(false))
  }

  useErrors([{ error, isError }])

  return (
    <Dialog open={isNotification} onClose={closeNotificationHandler}>
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
        <DialogTitle textAlign={"center"}>Notifications</DialogTitle>
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height="6rem" />
        ) : (
          <>
            {data?.requests?.length > 0 ? (
              data.requests.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  sender={notification.sender}
                  _id={notification._id}
                  handler={friendRequestHandler}
                />
              ))
            ) : (
              <Typography textAlign={"center"}>0 notifications</Typography>
            )}
          </>
        )}
      </Stack>
    </Dialog>
  )
}

const NotificationItem = memo(({ sender, _id, handler }) => {
  const { name, avatar} = sender
  return (
    <ListItem>
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"} width={"100%"}>
        <Avatar src={avatar} />

        <Typography
          variant='body1'
          sx={{
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: "1",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%"
          }}
        >
          {`${name} sent you a friend request.`}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }}>
          <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
          <Button color="error" onClick={() => handler({ _id, accept: false })}>Reject</Button>
        </Stack>
      </Stack>
    </ListItem>
  )
})

export default Notification
