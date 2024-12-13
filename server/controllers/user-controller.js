import { TryCatch } from '../middlewares/error.js';
import { User } from '../models/user-model.js';
import { cookieOptions, emitEvent, sendToken, uploadFilesToCloudinary } from '../utils/features.js';
import { compare } from 'bcrypt';
import { ErrorHandler } from '../utils/utility.js';
import { Chat } from '../models/chat-model.js';
import { Request } from '../models/request-model.js'
import { NEW_REQUEST, REFETCH_CHATS } from '../constants/events.js';
import { otherMember } from '../lib/helper.js'


//create a new user and save it to database and save in cookie
const newUserController = TryCatch(async (req, res, next) => {
    const { name, username, bio, password } = req.body;

    const file = req.file;
    // console.log(file,"file ha")

    if(!file) return next(new ErrorHandler("Please upload avatar",400));

    const result = await uploadFilesToCloudinary([file])

    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url
    };
    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar
    });

    sendToken(res, user, 201, "User created successfully!");
});

const loginController = TryCatch(async (req, res, next) => {
    // otherMember
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid Credentials", 400));

    const isMatchedPassword = await compare(password, user.password);

    if (!isMatchedPassword) return next(new ErrorHandler("Invalid Credentials", 400));

    sendToken(res, user, 200, `Welcome back ${user.name}!`);

});

const myProfileController = TryCatch(async (req, res, next) => {

    const userId = req.user; // we got this from decode inside auth
    const user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("Please login first", 400));

    res.status(200).json({
        success: true,
        data: user
    });

});

const logoutController = TryCatch(async (req, res, next) => {
    return res.status(200).cookie("supx_token", "", { ...cookieOptions, maxAge: 0 }).json({
        success: true,
        message: "Logged out successfully!"
    })
});

const searchUserController = TryCatch(async (req, res, next) => {
    const { name = "" } = req.query;
    console.log(req.user)

    // Fetch all chats that involve the logged-in user, excluding group chats
    const myChats = await Chat.find({ members: req.user, groupChat: false });
    // console.log(myChats,"mera chat")

    // Extract all members from the user's chats
    const allUsersFromMyChat = myChats.flatMap((chat) => chat.members);
    // console.log(allUsersFromMyChat,"mera chat 2")

    // Query to find users not in the user's chat members and also exclude the logged-in user
    const allMembersNotInMyChat = await User.find({
        _id: { $nin: [...allUsersFromMyChat, req.user] },  // Exclude chat members + logged-in user
        name: { $regex: name, $options: "i" }  // Case-insensitive name matching
    });

    // Transform the result to return necessary user info
    const stranger = allMembersNotInMyChat.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar?.url  // Avoid errors if avatar is missing
    }));

    console.log(stranger[stranger.length-1])

    return res.status(200).json({
        success: true,
        users: stranger
    });
});

const sendRequestController = TryCatch(async (req, res, next) => {
    const { userId } = req.body;
    // check vice-versa
    const request = await Request.findOne({
        $or: [
            { sender: req.user, receiver: userId },
            { sender: userId, receiver: req.user },
        ]
    }).populate("sender","name")

    // console.log(request)

    if (request) return next(new ErrorHandler('Request already sent', 400));

    await Request.create({
        sender: req.user,
        receiver: userId
    })

    emitEvent(req, NEW_REQUEST, [userId]);

    return res.status(200).json({
        success: true,
        message: `Friend request sent!`
    })
});

const acceptRequestController = TryCatch(async (req, res, next) => {

    const { requestId, accept } = req.body;
    console.log(requestId,accept)

    const request = await Request.findById(requestId)
        .populate("sender", "name").populate("receiver", "name");

    if (!request) return next(new ErrorHandler("Request not found", 404));
    if (request.receiver._id.toString() !== req.user.toString())
        return next(new ErrorHandler("You are not allowed to accept the request!", 401));
    if (!accept) {
        await request.deleteOne();
        console.log("accept before")
        return res.status(200).json({
            success: true,
            message: 'Friend request rejected!'
        })
        console.log("accept after")
    }

    const members = [request.sender._id, request.receiver._id];

    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name}`
        }),
        request.deleteOne()
    ]);

    console.count("accept")

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
        success: true,
        senderId: request.sender._id,
        message: "Friend request accepted!"
    })
});

const getMyNotificationsController = TryCatch(async (req, res, next) => {
    const requests = await Request.find({ receiver: req.user })
        .populate("sender", "name avatar");

    const allRequest = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url
        }
    }))

    return res.status(200).json({
        success: true,
        // message:`${allRequest[allRequest.length-1].sender.name} sent you a friend request!`,
        requests: allRequest
    })
})

const getMyFriendsController = TryCatch(async (req, res, next) => {
    const chatId = req.query.chatId;
    console.log(chatId)

    const chats = await Chat.find({ members: req.user, groupChat: false }).populate("members", "name avatar");

    console.log(chats,"chat jaha me hu")
    const friends = chats.map(({ members }) => {
        const otherUser = otherMember(members, req.user);
        console.log(otherUser,"otherUser")
        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url
        }
    })

    console.log(friends,"friends")

    if (chatId) {
        // console.log("this one")
        const chat = await Chat.findById(chatId);
        console.log(chat,"given chat")

        //here we add chat and we get available friends in the chat those are not our friends
        const availableFriends = friends.filter((friend) => (
            !chat.members.includes(friend._id)
        ))

        return res.status(200).json({
            success: true,
            friends: availableFriends
        })
    }

    return res.status(200).json({
        success: true,
        friends
    })
})

export {
    loginController,
    newUserController,
    myProfileController,
    logoutController,
    searchUserController,
    sendRequestController,
    acceptRequestController,
    getMyNotificationsController,
    getMyFriendsController
};