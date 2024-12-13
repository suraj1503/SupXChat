import { Button, Dialog, DialogTitle, Skeleton, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'

import { sampleUsers } from '../../constants/sampleData'
import UserItem from '../shared/UserItem'
import { useAsyncMutation, useErrors } from '../../hooks/hook'
import { useAddGroupMemberMutation, useAvailableFriendsQuery } from '../../redux/api/api'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAddMember } from '../../redux/reducers/misc'

const AddMemberDialog = ({ isAddMember,chatId }) => {

    const dispatch=useDispatch()
    const [members, setMembers] = useState(sampleUsers);
    const [selectedMembers, setSelectedMembers] = useState([]);

    
    const {isLoading,data,isError,error} = useAvailableFriendsQuery(chatId)
    // console.log(isAddMember,"dialog")

    console.log(data?.friends)
    const [addMember, isLoadingAddMember]=useAsyncMutation(useAddGroupMemberMutation)

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((currElement) => currElement !== id) : [...prev, id]
        )
    };

    const addMemberSubmitHandler = () => { 
        addMember("Adding members...",{chatId,members:selectedMembers})
        closeAddMemberDialog()
    }
    const closeAddMemberDialog = () => {
        dispatch(setIsAddMember(false))
     }

     useErrors([{isError,error}])
    return (
        <Dialog open={isAddMember} onClose={closeAddMemberDialog}>
            <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                <Stack spacing={"1rem"}>
                    {
                        isLoading?<Skeleton/>:data?.friends?.length > 0 ? data?.friends?.map((user) => (
                            <UserItem
                                key={user._id}
                                user={user}
                                handler={selectMemberHandler}
                                isAdded={selectedMembers.includes(user._id)}
                            />
                        )) : <Typography textAlign={"center"}>No Friends</Typography>
                    }
                </Stack>
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                >
                    <Button color='error' onClick={closeAddMemberDialog}>Cancel</Button>
                    <Button variant='contained'
                        disabled={isLoadingAddMember}
                        onClick={addMemberSubmitHandler}
                    >
                        Submit Changes
                    </Button>
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default AddMemberDialog