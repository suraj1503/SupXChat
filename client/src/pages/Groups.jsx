import { Add as AddIcon, Delete as DeleteIcon, Done as DoneIcon, Edit as EditIcon, KeyboardBackspace as KeyboardBackspaceIcon, Menu as MenuIcon } from '@mui/icons-material'
import { Backdrop, Box, Button, CircularProgress, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import React, { lazy, memo, Suspense, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { LayoutLoader } from '../components/layout/Loaders'
import AvatarCard from '../components/shared/AvatarCard'
import UserItem from '../components/shared/UserItem'
import { Link } from '../components/styles/StyledComponents'
import { bisque } from '../constants/color'
import { useAsyncMutation, useErrors } from '../hooks/hook'
import { useChatDetailsQuery, useDeleteChatMutation, useMyGroupsQuery, useRemoveGroupMemberMutation, useRenameGroupMutation } from '../redux/api/api'
import { setIsAddMember } from '../redux/reducers/misc'
import { useDispatch, useSelector } from 'react-redux'

const DeleteDialog = lazy(() => import('../components/dialog/DeleteDialog'));

const AddMemberDialog = lazy(() => import('../components/dialog/AddMemberDialog'));

const Groups = () => {

  const dispatch = useDispatch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupNameUpdated, setGroupNameUpdated] = useState("")
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [members, setMembers] = useState([])
  const navigate = useNavigate();
  const chatId = useSearchParams()[0].get("group")

  const {isAddMember} = useSelector((state)=>state.misc)
  const myGroups = useMyGroupsQuery("")
  const groupDetails = useChatDetailsQuery({ chatId, populate: true }, { skip: !chatId })

  const [updateGroup, isLoadingGroupName] = useAsyncMutation(useRenameGroupMutation)
  const [removeGroupMember, isLoadingRemoveGroupMember] = useAsyncMutation(useRemoveGroupMemberMutation)
  const [deleteGroup, isLoadingDeleteGroupChat] = useAsyncMutation(useDeleteChatMutation)


  // console.log(isAddMember,"add member")

  // console.log(groupDetails.data?.chat?.members)

  const errors = [
    {
      isError: myGroups.isError,
      error: myGroups.error
    },
    {
      isError: groupDetails.isError,
      error: groupDetails.error
    }
  ]

  useErrors(errors)

  useEffect(() => {
    if (groupDetails.data) {
      setGroupName(groupDetails.data?.chat?.name)
      setGroupNameUpdated(groupDetails.data?.chat?.name)
      setMembers(groupDetails.data.chat.members)
    }

    //
    return () => {
      setDeleteDialog("");
      setGroupNameUpdated("")
      setMembers([])
      setIsEdit(false)
    }
  }, [groupDetails.data])

  const navigateBack = () => {
    navigate("/")
  }

  const handleMobile = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const updateGroupNameHandler = (e) => {
    setIsEdit(false)
    updateGroup("Updating group name...",{
      chatId,
      name:groupNameUpdated
    })
    // console.log(e.target.value)
    // setGroupName(e.target.value)
  }

  const openDeleteHandler = () => {
    setDeleteDialog(true)
    console.log("delete dialog")
  }

  const closeDeleteHandler = () => {
    setDeleteDialog(false)
  }

  const addMemberHandler = () => {
    dispatch(setIsAddMember(true))
  }

  const confirmDeleteHandler = () => {
    deleteGroup("Deleting group...",chatId)
    closeDeleteHandler()
    navigate("/groups")
  }

  

  const removeMemberHandler = (_id) => {
    removeGroupMember("Removing member...",{chatId,userId:_id})
    console.log(_id)
   }

  // useEffect(() => {
  //   if (chatId) {
  //     setGroupName(`Group Name-${myGroups.data?.groups.name}`);
  //     setGroupNameUpdated(`Group Name-${chatId}`)
  //   }
  //   setIsEdit(false)

  //   return () => {
  //     setGroupName("");
  //     setGroupNameUpdated("")
  //   }
  // }, [chatId]);

  const IconBtn = (
    <>
      <Box
        sx={{
          display: {
            xs: "block",
            sm: "none",
            position: "fixed",
            right: "1rem",
            top: "2rem",
            bgcolor: "rgba(0,0,0,0.8)"

          }
        }}
      >
        <IconButton onClick={handleMobile}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Tooltip title="back">
        <IconButton
          sx={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            bgcolor: "rgba(0,0,0,0.8)",
            color: "#fff",
            ":hover": {
              bgcolor: "rgba(0,0,0,0.7)"
            }
          }}
          onClick={navigateBack}
        >
          <KeyboardBackspaceIcon />
        </IconButton>
      </Tooltip>
    </>
  )

  const GroupName = (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"center"}
      spacing={"1rem"}
      padding={"3rem"}
    >
      {isEdit ? (
        <>
          <TextField
            value={groupNameUpdated}
            onChange={(e) => setGroupNameUpdated(e.target.value)}
          />
          <IconButton onClick={updateGroupNameHandler} disabled={isLoadingGroupName}>
            <DoneIcon />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant='h4'>{groupName}</Typography>
          <IconButton onClick={() => setIsEdit(true)}>
            <EditIcon />
          </IconButton>
        </>
      )
      }
    </Stack>
  )

  const ButtonGroup = (
    <Stack
      direction={{
        sm: "row",
        xs: "column-reverse"
      }}
      spacing={{
        sm: "1rem",
        xs: "0",
        md: "1rem 4rem"
      }}
    >
      <Button size='large' color='error' startIcon={<DeleteIcon />} onClick={openDeleteHandler}>Delete Group</Button>
      <Button size='large' variant='contained' startIcon={<AddIcon />} onClick={addMemberHandler}>Add Member</Button>
    </Stack>
  )

  return myGroups.isLoading ? <LayoutLoader /> : (
    <Grid container height={"100vh"}>
      <Grid
        item
        sx={{
          display: {
            xs: "none",
            sm: "block"
          }
        }}
        sm={4}
        bgcolor={bisque}
      >

        <GroupList myGroups={myGroups.data?.groups} chatId={chatId} />
      </Grid>
      <Grid
        item
        xs={12}
        sm={8}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          padding: "1rem 3rem"
        }}
      >
        {IconBtn}
        {groupName && <>
          {GroupName}
          <Typography
            margin={"2rem"}
            alignSelf={"flex-start"}
            variant='body1'
          >
            Members
          </Typography>
          <Stack
            maxWidth={"45rem"}
            width={"100%"}
            boxSizing={"border-box"}
            padding={{
              sm: "1rem",
              xs: "0",
              md: "1rem 4rem"
            }}
            // spacing={"2rem"}
            // bgcolor={"bisque"}
            height={"50vh"}
            overflow={"auto"}
          >
            {/* members */}
            {
              isLoadingRemoveGroupMember?<CircularProgress/>:members.length > 0 ? members.map((user) => (
                <UserItem
                  key={user._id}
                  user={user}
                  isAdded
                  styling={{
                    boxShadow: "0 0 0 0.2rem bisque",
                    padding: ".5rem 2rem",
                    borderRadius: "1rem"
                  }}
                  handler={removeMemberHandler}
                />
              )) : <Typography>No Users</Typography>
            }
          </Stack>
          {ButtonGroup}
        </>}
      </Grid>

      {
        isAddMember && <Suspense fallback={<Backdrop open />}>
          <AddMemberDialog chatId={chatId} isAddMember={isAddMember}/>
        </Suspense>
      }

      {deleteDialog && <>
        <Suspense fallback={<Backdrop open />}>
          <DeleteDialog open={deleteDialog} handleClose={closeDeleteHandler} deleteHandler={confirmDeleteHandler} groupName={groupName} />
        </Suspense>
      </>
      }

      <Drawer open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}
        sx={{
          display: {
            xs: "block",
            sm: "none"
          },
          "& .MuiPaper-root": {
            backgroundColor: bisque, // Change this to your desired background color
          }
        }}
      >
        <GroupList w={"50vw"} chatId={chatId} myGroups={myGroups.data?.groups} />
      </Drawer>
    </Grid>
  )
};

const GroupList = ({ w = "100%", myGroups = [], chatId }) => {

  return (
    <Stack width={w} height={"100vh"}>
      {
        myGroups?.length > 0 ? (
          myGroups.map((group) => (
            <GroupListItem group={group} chatId={chatId} key={group._id} />
          ))
        ) : (
          <Typography textAlign={"center"} padding="1rem">
            No groups
          </Typography>
        )
      }
    </Stack>
  )
}

const GroupListItem = memo(({ group, chatId }) => {
  const { name, avatar, _id } = group;

  return (
    <Link to={`?group=${_id}`} onClick={(e) => {
      if (chatId === _id) e.preventDefault();
    }}
      sx={{
        ":hover": {
          bgcolor: "#ffd3a4"
        }
      }}
    >
      <Stack
        direction={"row"}
        spacing={"1rem"}
        alignItems={"center"}
      >
        <AvatarCard avatar={avatar} />
        <Typography>{name}</Typography>
      </Stack>
    </Link>
  )

})

export default Groups