import jwt from 'jsonwebtoken'

import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat-model.js";
import { User } from "../models/user-model.js";
import {Message} from '../models/message-model.js'
import { ErrorHandler } from "../utils/utility.js";
import {cookieOptions} from '../utils/features.js'
import { adminSecretKey } from '../server.js';

const verifyAdminController = TryCatch(async(req,res,next)=>{
    const {secretKey} = req.body;

    if(secretKey!==adminSecretKey)
        return next(new ErrorHandler("Invalid admin key!",401));

    const token = jwt.sign(secretKey,process.env.JWT_SECRET_KEY);

    res.status(200)
       .cookie("supx_admin_token",token,{...cookieOptions,maxAge:1000*60*15})
       .json({
            success:true,
            message:"Welcome Admin!"
       });

})  

const logoutAdminController = TryCatch(async(req,res,next)=>{
    
    res.status(200)
       .cookie("supx_admin_token","",{...cookieOptions,maxAge:0})
       .json({
            success:true,
            message:"Logged out successfully!"
       });

}) 

const getAdminController = TryCatch(async(req,res,next)=>{
    res.status(200)
       .json({
            success:true,
            admin:true
       });

}) 

const allUsersController = TryCatch(async(req,res,next)=>{
    const users = await User.find({});


    const transformedUsers = await Promise.all(
        users.map(async({_id, name,username,avatar})=>{
            const [groupCount, friendCount] = await Promise.all([
                Chat.countDocuments({members:_id,groupChat:true}),
                Chat.countDocuments({members:_id,groupChat:false})
            ])
            return {
                _id,
                name,
                username,
                avatar:avatar.url,
                groupCount,
                friendCount
            }
        })
    );

    res.status(200).json({
        success:true,
        users:transformedUsers
    });
});

const allChatsController = TryCatch(async(req,res,next)=>{
    // console.log("all chats")
    const chats = await Chat.find({})
                    .populate("members","name avatar")
                    .populate("creator","name avatar");
    
    console.log(chats)
    const transformedChats = await Promise.all(chats.map(async({_id,name,groupChat,creator,members})=>{
        
        const messages=await Message.countDocuments({_id});

        return{
            _id,
            name,
            creator,
            groupChat,
            avatar:members.slice(0,3).map(member=>member.avatar.url),
            members:members.map(({_id,name,avatar})=>({
                _id,
                name,
                avatar:avatar.url
            })),
            creator:{
                name:creator?.name || "None",
                avatar:creator?.avatar.url || "",
            },
            totalMembers:members.length,
            totalMessages:messages
        }
    }))

    console.log(transformedChats)
                
    res.status(200).json({
        success:true,
        chats:transformedChats
    })

})

const allMessagesController = TryCatch(async(req,res,next)=>{
    const messages = await Message.find({})
    .populate("sender","name avatar")
    .populate("chat","groupChat");
    
    console.log(messages)
    console.log("message controller")

    const transformedMessages = await Promise.all(messages.map(async({_id,content,sender,attachments,chat,createdAt})=>{
        
        return{
            _id,
            content,
            attachments,
            chat:chat._id,
            groupChat:chat.groupChat,
            sender:{
                _id:sender._id,
                name:sender.name,
                avatar:sender.avatar.url
            },
            createdAt
        }
    }))

    console.log(transformedMessages)
                
    res.status(200).json({
        success:true,
        messages:transformedMessages
    })

})

const getDashboardStatsController = TryCatch(async(req,res,next)=>{
    
    const [groupCount,userCount,messageCount,totalChatCount] = await Promise.all([
        Chat.countDocuments({groupChat:true}),
        User.countDocuments({}),
        Message.countDocuments({}),
        Chat.countDocuments({})
    ])

    const singleChatCount = totalChatCount-groupCount;

    const today = new Date();

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate()-7);

    const last7DaysMessages = await Message.find({
        createdAt:{
            $gte:last7Days,
            $lte:today
        }
    }).select("createdAt");

    // [0,0,0,0,0,0,0]
    const messages = new Array(7).fill(0);

    const dayInMilliSeconds = 1000*60*60*24;
    //this will add messages counter for each past 7 days
    last7DaysMessages.forEach((message)=>   {
        const indexApprox = (today.getTime()-message.createdAt.getTime())/(dayInMilliSeconds);
        const index = Math.floor(indexApprox);

        messages[6-index]++;
    });

    const dashBoardData = {
        groupCount,
        singleChatCount,
        userCount,
        messageCount,
        totalChatCount,
        messages
    }

    res.status(200).json({
        success:true,
        stats:dashBoardData,
    })

})

export {
    allUsersController,
    allChatsController,
    allMessagesController,
    getDashboardStatsController,
    verifyAdminController,
    logoutAdminController,
    getAdminController
}