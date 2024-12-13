import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Table from '../../components/shared/Table'
import { Avatar, Box, Skeleton, Stack } from '@mui/material';
import moment from 'moment';

import { sampleDashboardData } from '../../constants/sampleData';
import { transformImage } from '../../lib/features'
import { fileFormat } from '../../lib/features'
import RenderAttachment from '../../components/shared/RenderAttachment'
import { server } from '../../constants/config';
import { useFetchData } from '6pp';
import { useErrors } from '../../hooks/hook';


// here we are defining each column with its ref and header along with color and width
const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => {
      const { attachments } = params.row;

      return attachments?.length > 0
        ? attachments.map((i) => {
          const url = i.url;
          const file = fileFormat(url);

          return (
            <Box>
              <a
                href={url}
                download
                target="_blank"
                style={{
                  color: "black",

                }}
              >
                {RenderAttachment(file, url)}
              </a>
            </Box>
          );
        })
        : "No Attachments";
    },
  },

  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => (
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} />
        <span>{params.row.sender.name}</span>
      </Stack>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];

const MessageManagement = () => {

  const [rows, setRows] = useState();

  const { loading, data, error } = useFetchData(`${server}/api/v1/admin/messages`, "dashboard-messages")


  console.log(data)
  useErrors([{
    error: error,
    isError: error
  }])

  useEffect(() => {
    if (data) {
      setRows(data?.messages?.map(message => (
        {
          ...message,
          id: message._id,
          sender: {
            name: message.sender.name,
            avatar: transformImage(message.sender.avatar, 50)
          },
          createdAt: moment(message.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
        }
      )))
    }
  }, [data])

  return (
    <AdminLayout>
      {
        loading?<Skeleton height={"100vh"}/>:(
          <Table heading={"All Messages"} columns={columns} rows={rows} rowHeight={200} />
        )
      }
    </AdminLayout>
  )
}
export default MessageManagement