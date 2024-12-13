
import { useInputValidation } from '6pp'
import { Button, Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

import { sampleUsers } from '../../constants/sampleData'
import UserItem from '../shared/UserItem'
import { useAvailableFriendsQuery, useNewGroupMutation } from '../../redux/api/api'
import { useAsyncMutation, useErrors } from '../../hooks/hook'
import { useDispatch, useSelector } from 'react-redux'
import { setIsNewGroup } from '../../redux/reducers/misc'
import toast from 'react-hot-toast'


const NewGroup = () => {

  // const [members,setMembers] = useState(sampleUsers);
  const [selectedMembers,setSelectedMembers] = useState([]);

  const dispatch = useDispatch()

  const {isNewGroup} = useSelector((state)=>state.misc)

  const {isError,data,error,isLoading} = useAvailableFriendsQuery()
const [newGroup,isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation)
  // console.log(newGroup)
  // console.log(data?.friends,"new group")

  const errors=[
    {
      isError,
      error
    }
  ]

  useErrors(errors)

  const selectMemberHandler = (id)=>{
    setSelectedMembers((prev)=>
      prev.includes(id)?prev.filter((currElement)=>currElement!==id):[...prev,id]
    )
  };

  const newGroupSubmitHandler = ()=>{
    if(!groupName.value) return toast.error("Group name is required!!")

    if(selectedMembers.length<2) 
      return toast.error("Please select atleast 3 members")

    newGroup("Creating new group...",{name:groupName.value,members:selectedMembers})

    closeHandler()
  }

  const closeHandler = ()=>{
    dispatch(setIsNewGroup(false))
  }

  const groupName = useInputValidation("");

  // console.log(selectedMembers,"selected members")

  return (
    <Dialog open={isNewGroup} onClose={closeHandler}>
    <Stack p={{
      xs:"1rem",sm:"2rem"
    }}
    width={"25rem"}
    spacing={"1rem"}
    >
      <DialogTitle textAlign={"center"} variant='h4'>New Group</DialogTitle>

      <TextField 
        label="Group Name"
        value={groupName.value}
        onChange={groupName.changeHandler}
      />
      <Typography variant='body1'>Members</Typography>
      <Stack>
      { isLoading?(<Skeleton/>):(
            data?.friends.map((user)=>(
             <UserItem
              user={user}
              key={user._id}
              handler={selectMemberHandler}
              isAdded={selectedMembers.includes(user._id)}
             />
            ))
          )}
      </Stack>
      <Stack direction={"row"} justifyContent={"space-evenly"}>
        <Button variant='text' color='error' onClick={closeHandler}>Cancel</Button>
        <Button variant='contained' onClick={newGroupSubmitHandler} disabled={isLoadingNewGroup}>Create</Button>
      </Stack>
    </Stack>
  </Dialog>
  )
}

export default NewGroup