import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { server } from '../../constants/config'

const api = createApi({
    reducerPath:"api",
    baseQuery:fetchBaseQuery({baseUrl:`${server}/api/v1/`}),
    tagTypes:["Chat","User","Message"],
    endpoints:(builder)=>({
        //query notation is for get and mutation is for post put
        myChats:builder.query({
            //inside this we have another
            query:()=>({
                url:"chat/my-chats",
                credentials:'include'
            }),
            providesTags:["Chat"]
        }),
        searchUser:builder.query({
            query:(name)=>({
                url:`user/search-user?name=${name}`,
                credentials:'include'
            }),
            providesTags:["User"]
        }),
        sendFriendRequest:builder.mutation({
            query:(data)=>({
                url:"user/send-request",
                method:"PUT",
                credentials:"include",
                body:data
            }),
            invalidatesTags:["User"]
        }),
        acceptFriendRequest:builder.mutation({
            query:(data)=>({
                url:'user/accept-request',
                method:"PUT",
                credentials:"include",
                body:data
            }),
            invalidatesTags:["Chat"]
        }),
        getNotifications:builder.query({
            query:()=>({
                url:"user/notifications",
                credentials:"include", 
            }),
            keepUnusedDataFor:0  //this  means no caching
        }),
        chatDetails:builder.query({
            query:({chatId,populate=false})=>{
                let url=`chat/${chatId}`
                if(populate) url+="?populate=true"
                return {
                    url,
                    credentials:"include", 
                }
            },
            providesTags:["Chat"] 
        }),
        getSpecificChatDetails: builder.query({
            query: (senderId) => ({
                url: `chat/specific-chat?senderId=${senderId}`,  // Send senderId in the query string
                credentials: "include",
            }),
            providesTags: ["Chat"],
        }),        
        getMessages:builder.query({
            query:({chatId,page})=>({
                url:`chat/message/${chatId}?page=${page}`,
                credentials:"include"
            }),
            keepUnusedDataFor:0
        }),
        sendAttachments:builder.mutation({
            query:(data)=>({
                url:'chat/message',
                method:"POST",
                credentials:"include",
                body:data
            })
        }),
        myGroups:builder.query({
            //inside this we have another
            query:()=>({
                url:"chat/my-groups",
                credentials:'include'
            }),
            providesTags:["Chat"]
        }),
        availableFriends:builder.query({
            query:(chatId)=>{
                let url=`user/friends`
                if(chatId) url+=`?chatId=${chatId}`
                return {
                    url,
                    credentials:"include", 
                }
            },
            providesTags:["Chat"] 
        }),
        newGroup:builder.mutation({
            query:({name,members})=>({
                url:'chat/new-group',
                method:"POST",
                credentials:"include",
                body:{name,members}
            }),
            invalidatesTags:["Chat"]
        }),
        renameGroup:builder.mutation({
            query:({chatId,name})=>({
                url:`chat/${chatId}`,
                method:"PUT",
                credentials:"include",
                body:{name}
            }),
            invalidatesTags:["Chat"]
        }),
        removeGroupMember:builder.mutation({
            query:({chatId,userId})=>({
                url:`chat/remove-members`,
                method:"PUT",
                credentials:"include",
                body:{chatId,userId}
            }),
            invalidatesTags:["Chat"]
        }),
        addGroupMember:builder.mutation({
            query:({chatId,members})=>({
                url:`chat/add-members`,
                method:"PUT",
                credentials:"include",
                body:{chatId,members}
            }),
            invalidatesTags:["Chat"]
        }),
        deleteChat:builder.mutation({
            query:(chatId)=>({
                url:`chat/${chatId}`,
                method:"DELETE",
                credentials:"include",
            }),
            invalidatesTags:["Chat"]
        }),
        leaveChat:builder.mutation({
            query:(chatId)=>({
                url:`chat/leave/${chatId}`,
                method:"DELETE",
                credentials:"include",
            }),
            invalidatesTags:["Chat"]
        }),
    })
})

export default api
export const {
    useMyChatsQuery, 
    useLazySearchUserQuery,
    useSendFriendRequestMutation,
    useGetNotificationsQuery,
    useAcceptFriendRequestMutation,
    useChatDetailsQuery,
    useGetMessagesQuery,
    useSendAttachmentsMutation,
    useMyGroupsQuery,
    useAvailableFriendsQuery,
    useNewGroupMutation,
    useRenameGroupMutation,
    useRemoveGroupMemberMutation,
    useAddGroupMemberMutation,
    useDeleteChatMutation,
    useLeaveChatMutation,
    useLazyGetSpecificChatDetailsQuery
}=api

//uselazy if not use then it will call directly as the component mounts to avoid that we use lazy

//in query we give provided tag because want data from cache and in mutation we provide
//invalid tags as we want to refresh instead of cache