import React from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Box, Container, Paper, Skeleton, Stack, Typography } from '@mui/material'
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import moment from 'moment'
import { CurveButton, SearchField } from '../../components/styles/StyledComponents'
import { DoughnutChart, LineChart } from '../../components/specific/Charts'
import { useFetchData } from '6pp'
import { server } from '../../constants/config'
import { LayoutLoader } from '../../components/layout/Loaders'
import {useErrors} from '../../hooks/hook'

const Dashboard = () => {

  const { loading, data, error } = useFetchData(`${server}/api/v1/admin/stats`, "dashboard-stats")

  const { stats } = data || {}

  // console.log(stats)
  useErrors([{
    error:error,
    isError:error
  }])
  
  const AppBar = (
    <Paper
      elevation={3}
      sx={{
        padding: "2rem",
        margin: "2rem 0",
        borderRadius: "1rem"
      }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />
        <SearchField type='text' placeholder='Search...' />
        <CurveButton>Search</CurveButton>
        <Box flexGrow={1} />
        <Typography
          display={{
            xs: "none",
            sm: "block"
          }}
          color={"rgba(0,0,0,0.7)"}
          textAlign={"center"}
        >
          {moment().format("ddd, Do MMM YYYY")}
        </Typography>
        <NotificationsIcon />
      </Stack>
    </Paper>
  )

  const Widgets = (
    <Stack
      direction={{
        xs: "column",
        sm: "row"
      }}
      spacing={"2rem"}
      justifyContent="space-between"
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={stats?.userCount} Icon={<PersonIcon />} />
      <Widget title={"Chats"} value={stats?.totalChatCount} Icon={<GroupIcon />} />
      <Widget title={"Messages"} value={stats?.messageCount} Icon={<MessageIcon />} />
    </Stack>
  )
  return  (
    <AdminLayout>
      {
        loading?<Skeleton height={"100vh"}/>:(
          <Container component={"main"}>
        {AppBar}
        <Stack
          direction={{
            xs: "column",
            lg: "row"
          }}
          flexWrap={"wrap"}
          justifyContent={"center"}
          alignItems={{
            xs: "center",
            lg: "stretch"
          }}
          sx={{
            gap: "2rem"
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: "1rem 2rem",
              borderRadius: "1rem",
              width: "100%",
              maxWidth: {
                md: "40rem",
                lg: "35rem"
              }
            }}
          >
            <Typography margin={".5rem 0"} variant='h6'>Last Messages</Typography>
            <LineChart value={stats?.messages || []} />
          </Paper>

          <Paper
            elevation={3}
            sx={{
              padding: "1rem ",
              borderRadius: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: { xs: "100%", sm: "50%" },
              position: "relative",
              maxWidth: "20rem",
            }}
          >
            <DoughnutChart
              labels={["Single Chats", "Group Chats"]}
              value={[stats?.singleChatCount || 0, stats?.groupCount || 0]}
            />
            <Stack
              position={"absolute"}
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={"0.5rem"}
              width={"100%"}
              height={"100%"}
            >
              <GroupIcon /> <Typography>v/s</Typography>
              <PersonIcon />
            </Stack>
          </Paper>
        </Stack>
        {
          Widgets
        }
      </Container>
        )
      }
    </AdminLayout>
  )
}

const Widget = ({ title, value, Icon }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: "2rem",
        margin: "2rem 0",
        borderRadius: "1.5rem",
        width: "20rem",
      }}
    >
      <Stack
        alignItems={"center"}
        spacing={"1rem"}
      >
        <Typography
          sx={{
            color: "rgba(0,0,0,0.7)",
            borderRadius: "50%",
            border: `5px solid black`,
            width: "5rem",
            height: "5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {value}
        </Typography>
        <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
          {Icon}
          <Typography>{title}</Typography>
        </Stack>
      </Stack>
    </Paper>
  )

}

export default Dashboard