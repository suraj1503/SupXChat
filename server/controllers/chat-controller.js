import { ALERT, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../constants/events.js";
import { otherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from '../models/chat-model.js';
import { Message } from "../models/message-model.js";
import { User } from '../models/user-model.js';
import { deleteFilesFromCloudinary, emitEvent, uploadFilesToCloudinary } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";


const newGroupController = TryCatch(async(req,res,next)=>{
    const {name, members} =req.body;

    if(members.length<2) return next(new ErrorHandler("Group chat must have atleast 3 members",400));

    const duplicateMembers = members.filter((member,index,array)=>{ return array.indexOf(member)!==index});
    if(duplicateMembers.length >0) return next(new ErrorHandler(`Duplicate members found: ${duplicateMembers.join(', ')}`, 400));

    const allMembers = [...members,req.user];

    await Chat.create({
        name,
        groupChat:true,
        creator:req.user,
        members:allMembers
    });

    emitEvent(req,ALERT,allMembers,`Welcome to ${name} group!`);
    emitEvent(req,REFETCH_CHATS,members); //this event is for others to get chats updates

    return res.status(201).json({
        success:true,
        message:"Group created successfully!",
    }); 

});

const getMyChatsController = TryCatch(async(req,res,next)=>{
    const myChats = await Chat.find({members:req.user}).populate("members","name avatar");
    // console.log(myChats);

    const transformedChats = myChats.map(({_id,name,groupChat,members})=>{
        const otherMemberData = otherMember(members,req.user);        
        return {   
            _id,
            groupChat,
            avatar:groupChat?members.slice(0,3).map(({avatar})=>avatar.url):[otherMemberData.avatar.url],
            name:groupChat?name:otherMemberData.name,
            members:members.reduce((prev,curr)=>{
                if(curr._id.toString()!==req.user.toString()){
                    prev.push(curr._id);
                }
                return prev
            },[])   
        }
    })

    res.status(200).json({
        success:true,
        chats:transformedChats
    });
});

const getMyChatsSpecificController = TryCatch(async (req, res, next) => {
    const { senderId } = req.query;  // Extract senderId from query parameters

    const [user, myChats] = await Promise.all([
        User.findById(senderId),
        Chat.find({ members: req.user, groupChat: false })
            .populate("members", "name avatar"),
    ]);

    if (!user) {
        return next(new ErrorHandler(`User not found`, 404));
    }

    const transformedChats = [];

    for (const chat of myChats) {
        const { _id, groupChat, members } = chat;

        const otherMemberData = members.find(
            (member) => member._id.toString() === senderId.toString()
        );

        if (!otherMemberData) {
            return next(new ErrorHandler(`Please send a request to ${user.name} to chat!`, 401));
        }

        transformedChats.push({
            _id,
            groupChat,
            avatar: [otherMemberData.avatar.url],
            name: otherMemberData.name,
        });
    }

    res.status(200).json({
        success: true,
        chats: transformedChats,
    });
});

const getMyGroupsController = TryCatch(async(req,res,next)=>{
    const myGroups = await Chat.find({members:req.user,groupChat:true,creator:req.user}).populate("members","name avatar");
    // console.log(myGroups);
    const groups = myGroups.map(({_id,name,groupChat,members})=>(
        {
            _id,
            name,
            groupChat,
            avatar:members.slice(0,3).map(({avatar})=>avatar.url)
        }
    ));
    console.log(groups)
    return res.status(200).json({
        success:true,
        groups
    })
});

const addMembersController = TryCatch(async(req,res,next)=>{
    
    const {chatId,members} = req.body;

    if(!members || members.length<1) 
        return next(new ErrorHandler("Please provide members",400));

    const chat = await Chat.findById(chatId);

    // if(!chat) return next(new ErrorHandler("Chat not found",404));

    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));

    if(chat.creator.toString()!==req.user.toString()) 
        return next(new ErrorHandler("You are not allowed to add members",403));


    const allNewMembersPromise = members.map((user)=>User.findById(user,"name"));

    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers.filter(
        (newMember)=>!chat.members.includes(newMember._id.toString())
    );

    chat.members.push(...uniqueMembers.map((member)=>member._id));

    if(chat.members.length>100) 
        return next(new ErrorHandler("Group limit exceeded",403));

    await chat.save();

    // [a,b,c]=>"a,b,c"
    const allUsersName = allNewMembers.map((member)=>member.name).join(",");

    emitEvent(req,ALERT,chat.members,{message:`${allUsersName} are added in the group`,chatId});

    emitEvent(req,REFETCH_CHATS,chat.members);

    return res.status(200).json({
        success:true,
        message:"Members added successfully"
    })
});

const removeMemberController = TryCatch(async(req,res,next)=>{
    const {chatId, userId} = req.body;

    const [chat, removedUser] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId,"name")
    ])

    if(!chat) return next(new ErrorHandler("Chat not found",404));

    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));

    if(chat.creator.toString()!==req.user.toString())
        return next(new ErrorHandler("You are not allowed to remove members",403));

    if(chat.members.length<=3) 
        return next(new ErrorHandler("There should be atleast 3 members in a group",400));

    const allChatMembers=chat.members.map((i)=>i.toString())
    chat.members = chat.members.filter((member)=>member.toString()!==userId.toString());

    await chat.save();

    emitEvent(req,ALERT,chat.members,{message:`${removedUser.name} has been removed from the group`,chatId});

    emitEvent(req,REFETCH_CHATS,allChatMembers);

    return res.status(200).json({
        success:true,
        message:'Member removed successfully!'
    })
});

const leaveGroupController = TryCatch(async(req,res,next)=>{
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found",404));

    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));

    const remainingMembers = chat.members.filter(
        (member)=>member.toString()!==req.user.toString()
    )

    if(remainingMembers.length<3)
        return next(new ErrorHandler("Group should have atleast 3 members",400));

    if(!remainingMembers.includes(req.user)) 
        return next(new ErrorHandler(`Action not valid!`,403)); 
    
    if(chat.creator.toString()===req.user.toString()){
        const randomAdmin = Math.floor(Math.random()*remainingMembers.length);
        const newAdmin = remainingMembers[randomAdmin];
        chat.creator=newAdmin;
    }

    chat.members=remainingMembers;

    const [user] = await Promise.all([
        User.findById(req.user,"name"),
        chat.save()
    ])

    emitEvent(req,ALERT,chat.members,{message:`${user.name} has left the chat!`,chatId});

    return res.status(200).json({
        success:true,
        message:`${user.name} has left the group!`
    })
});

const sendAttachmentsController = TryCatch(async(req,res,next)=>{
    const {chatId} =req.body;

    const files = req.files || [];

    if(files.length<1) return next(new ErrorHandler("Please upload attachments",400));

    if(files.length>5) return next(new ErrorHandler("Only maximum of 5 files can be send",400));

    const[chat,user] = await Promise.all([
        Chat.findById(chatId),
        User.findById(req.user,"name avatar")
    ]);

    if(!chat) return next(new ErrorHandler(`Chat not found!`,404));


    // console.log(files);

    if(files.length < 1) 
        return next(new ErrorHandler("Please provide attachments",400));

    //Upload files here

    const attachments = await uploadFilesToCloudinary(files);

    const messageForDB={
        content:"",
        attachments,
        sender:user._id,
        chat:chatId
    }

    const messageForRealTime = {
        ...messageForDB,
        sender:{
            _id:user._id,
            name:user.name,
            avatar:user.avatar.url
        },
    }

    const message = await Message.create(messageForDB);

    emitEvent(req,NEW_MESSAGE,chat.members,{
        message:messageForRealTime,
        chatId
    });

    emitEvent(req,NEW_MESSAGE_ALERT,chat.members,{
        chatId
    });

    res.status(200).json({
        success:true,
        message
    })

});

const getChatDetailsController = TryCatch(async(req,res,next)=>{
    const chatId=req.params.chatId;

    if(req.query.populate==="true"){
        // console.log("Populate")

        //lean will make chat instance as regular js
        const chat=  await Chat.findById(chatId).populate("members","name avatar").lean();

        if(!chat) return next(new ErrorHandler('Chat not found',404));

        chat.members = chat.members.map(({_id,name,avatar})=>(
            {
                _id,
                name,
                avatar:avatar.url
            }
        ))

        res.status(200).json({
            success:true,
            chat
        });    
    }
    else{
        const chat=  await Chat.findById(chatId);

        if(!chat) return next(new ErrorHandler('Chat not found',404));

        res.status(200).json({
            success:true,
            chat:chat
        })
    }

    
});

const renameChatDetailsController = TryCatch(async(req,res,next)=>{
    const chatId = req.params.chatId;
    const {name} = req.body;

    const chat = await Chat.findById(chatId);
    
    if(!chat) return next(new ErrorHandler("Chat not found!",404));

    const prevName = chat.name;

    
    if(!chat.groupChat)
        return next(new ErrorHandler("This is not a group chat!",401));

    if(chat.creator.toString()!==req.user.toString())
        return next(new ErrorHandler("You are not allowed to rename the group",403));

    chat.name=name;

    await chat.save();

    emitEvent(req,REFETCH_CHATS,chat.members);

    res.status(200).json({
        success:true,
        message:`${prevName} is now changed to ${chat.name}`
    })
});

const deleteChatDetailsController = TryCatch(async(req,res,next)=>{
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);

    const prevName = chat.name;
    console.log(req.user.toString());

    if(!chat) return next(new ErrorHandler("Chat not found!",404)); 

    const members = chat.members;

    if(chat.groupChat && chat.creator.toString()!==req.user.toString())
        return next(new ErrorHandler("You are not allowed to delete the group",403));

    if(chat.groupChat && !chat.members.includes(req.user.toString()))
        return next(new ErrorHandler("You are not allowed to delete the group",403));

    // now we should delete messaages and files related to that chat from cloudinary as well

    const messagesWithAttachment = await Message.find({
        chat:chatId,
        attachments:{ $exists:true, $ne:[]}
    });

    console.log(messagesWithAttachment);

    const public_ids=[];

    messagesWithAttachment.forEach((attachments)=>{
        attachments.forEach((attachment)=>{
            public_ids.push(attachment.public_id);
        })
    });

    await Promise.all([
        //delete files from cloudinary
        deleteFilesFromCloudinary(public_ids),
        chat.deleteOne(),
        Message.deleteMany({chat:chatId})
    ])

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
        success:true,
        message:`${prevName} deleted successfully!`
    })
});

const getMessagesContoller = TryCatch(async(req,res,next)=>{
    const chatId = req.params.chatId;

    const {page=1}=req.query;

    const resultPerPage = 10;
    const skip = (page-1)*resultPerPage;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("chat not found!",404));

    if (!chat.members.includes(req.user.toString()))
        return next(
          new ErrorHandler("You are not allowed to access this chat", 403)
        );
    
    
    const [messages, totalMessageCount]=await Promise.all([
        Message.find({chat:chatId})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(resultPerPage)
        .populate("sender","name avatar")
        .lean(),
        Message.countDocuments({chat:chatId})
    ])

    const totalPages = Math.ceil(totalMessageCount/resultPerPage) || 0;

    res.status(200).json({
        success:true,
        messages:messages.reverse(),
        totalPages
    })
})

export {
    addMembersController, deleteChatDetailsController, getChatDetailsController, getMessagesContoller, getMyChatsController,
    getMyGroupsController, leaveGroupController, newGroupController, removeMemberController, renameChatDetailsController, sendAttachmentsController,
    getMyChatsSpecificController
};
