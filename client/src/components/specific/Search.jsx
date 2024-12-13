import { useInputValidation } from '6pp'
import { Search as SearchIcon } from '@mui/icons-material'
import { Dialog, DialogTitle, InputAdornment, List, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {toast} from 'react-hot-toast'

import { useDispatch, useSelector } from 'react-redux'
import { useLazySearchUserQuery, useSendFriendRequestMutation } from '../../redux/api/api'
import { setIsSearch } from '../../redux/reducers/misc'
import UserItem from '../shared/UserItem'
import { useAsyncMutation } from '../../hooks/hook'


const Search = () => {

  const {isSearch} = useSelector((state)=>state.misc)

  const [searchUser] = useLazySearchUserQuery()
  const [sendFriendRequest, isLoadingSentFriendRequest] = useAsyncMutation(useSendFriendRequestMutation)
  const [users,setUsers] =useState([]);

  const dispatch = useDispatch()

  const search = useInputValidation("")

  const addFriendHandler = async(_id)=>{
    await sendFriendRequest("Sending friend request...",{userId:_id})
  }
  
  const handleSearchClose = ()=>{
    dispatch(setIsSearch(false))
  }

  useEffect(()=>{
    const timeOutId = setTimeout(()=>{
      searchUser(search.value).then(({data})=>setUsers(data.users)).catch(err=>console.log(err))
    },1000)

    return()=>{
      clearTimeout(timeOutId)
    }
  },[search.value])
  return (
    <Dialog open={isSearch} onClose={handleSearchClose}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"}>
        <DialogTitle textAlign={"center"} fontWeight={"700"}>Find People</DialogTitle>
        <TextField 
          label='' 
          value={search.value} 
          onChange={search.changeHandler}
          variant='outlined'
          size='small'
          InputProps={{
            startAdornment:(
              <InputAdornment position='start'>
                <SearchIcon/>
              </InputAdornment>
            )
          }}
        />
        <List>
          {
            users.map((user)=>(
             <UserItem
              user={user}
              key={user._id}
              handler={addFriendHandler}
              handlerIsLoading={isLoadingSentFriendRequest}
             />
            ))
          }
        </List>
      </Stack>
    </Dialog>
  )
}

export default Search