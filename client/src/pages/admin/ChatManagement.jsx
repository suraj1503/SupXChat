import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Table from '../../components/shared/Table'
import { Avatar, Skeleton, Stack } from '@mui/material';

import {sampleDashboardData} from '../../constants/sampleData';
import {transformImage} from '../../lib/features'
import AvatarCard from '../../components/shared/AvatarCard'
import { server } from '../../constants/config';
import { useFetchData } from '6pp';
import { useErrors } from '../../hooks/hook';


// here we are defining each column with its ref and header along with color and width
const columns = [
  {
    field:"id",
    headerName:"ID",
    headerClassName:"table-header",
    width:200
  },
  {
    field:"avatar",
    headerName:"Avatar",
    headerClassName:"table-header",
    width:150,
    renderCell:(params)=><AvatarCard avatar={params.row.avatar}/>
  },
  {
    field:"name",
    headerName:"Name",
    headerClassName:"table-header",
    width:300
  },
  {
    field:"groupChat",
    headerName:"Group Chat",
    headerClassName:"table-header",
    width:300
  },
  {
    field:"totalMembers",
    headerName:"Total Members",
    headerClassName:"table-header",
    width:120
  },
  {
    field:"members",
    headerName:"Members",
    headerClassName:"table-header",
    width:400,
    renderCell:(params)=> <AvatarCard max={100} avatar={params.row.members}/>
  },
  {
    field:"totalMessages",
    headerName:"Total Messages",
    headerClassName:"table-header",
    width:120
  },
  {
    field:"creater",
    headerName:"Created By",
    headerClassName:"table-header",
    width:250,
    renderCell:(params)=>(
      <Stack
        direction="row"
        alignItems="center"
        spacing={"1rem"}
      >
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar}/>
        <span>{params.row.creator.name}</span>
      </Stack>
    )
  },
];
const ChatManagement = () => {

  const [rows,setRows] = useState();

  const { loading, data, error } = useFetchData(`${server}/api/v1/admin/chats`, "dashboard-chats")


  console.log(data)
  useErrors([{
    error: error,
    isError: error
  }])

  useEffect(()=>{
    if(data){
      setRows(data?.chats?.map((chat)=>(
        {
          ...chat,
          id:chat._id,
          avatar:chat.avatar.map(av=>transformImage(av,50)),
          members:chat.members.map(mbr=>transformImage(mbr.avatar,50)),
          creator:{
            name:chat.creator.name,
            avatar:transformImage(chat.creator.avatar,50)
          }
        }
      )))
    }
  },[data])

  return (
    <AdminLayout>
        {
          loading?<Skeleton height={"100vh"}/>:(
            <Table heading={"All Chats"} columns={columns} rows={rows}/>
          )
        }
    </AdminLayout>
  )
}

export default ChatManagement