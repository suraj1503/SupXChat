import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { v4 as uuid } from 'uuid';
import cors from 'cors'
import { v2 as cloudinary } from 'cloudinary'

import userRoute from './routes/user-route.js';
import chatRoute from './routes/chat-route.js';
import adminRoute from './routes/admin-route.js';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';

import { createUser } from './seeders/user-seeder.js';
import { createMessagesInAChat, createSingleChats } from './seeders/chat-seeder.js';
import { CHAT_JOIN, CHAT_LEAVE, NEW_MESSAGE, NEW_MESSAGE_ALERT, ONLINE_USERS, START_TYPING, STOP_TYPING } from './constants/events.js';
import { getSockets } from './lib/helper.js';
import { Message } from './models/message-model.js';
import { corsOption } from './constants/config.js';
import { socketAuthenticator } from './middlewares/auth.js';

const app = express();
dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_DB_URI;
export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "supxchat";
const userSocketIDs = new Map();
const onlineUsers = new Set()

connectDB(mongoURI);

//config cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = createServer(app);
const io = new Server(server, {
    cors: corsOption
});

app.set("io", io) //here we are setting the io instance so we can use it wherever we want
// createUser(10);
// createSingleChats(5);
// createMessagesInAChat("66bc5e1a173f398c90ad7168",15);

//middleware
app.use(express.json()); //for raw json body
// app.use(express.urlencoded()) //for form data    
app.use(cookieParser());

app.use(cors(corsOption))

app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/admin', adminRoute);

//this will make sure sockets are available after it passes use i.e. middleware
// reason why we invoke cookieParser here is because by default there is not cookieparser chain
// for websocket, so we call manually by invoking cookieParser which then calls a function
io.use((socket, next) => {
    // cookieParser()(
    //     socket.request,
    //     socket.request.res,
    //     async (err) => await socketAuthenticator(err, socket, next)
    // )

    cookieParser()(socket.request, {}, async (err) => {
        if (err) return next(new Error('Authentication error'));
        await socketAuthenticator(err, socket, next);
    });
});

io.on("connection", (socket) => {
    // console.log(`${socket.id} connected`); 

    const user = socket.user
    // console.log(user)

    // here particular user is connected to a socket id user(u1)=>socket(skeia54ad)
    const existingSockets = userSocketIDs.get(user._id.toString()) || [];
    userSocketIDs.set(user._id.toString(), [...existingSockets, socket.id]);

    // userSocketIDs will have user which are currently active
    // console.log(userSocketIDs);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        // console.log(messages);
        const messageForRealtime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
                avatar: user.avatar
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        };

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,

        };

        const membersSockets = getSockets(members);
        io.to(membersSockets).emit(NEW_MESSAGE, { chatId, message: messageForRealtime });
        io.to(membersSockets).emit(NEW_MESSAGE_ALERT, { chatId });


        // console.log("Emitting",messageForRealime)

        // io.to(membersSockets).emit(NEW_MESSAGE,{
        //     chatId,
        //     message:messageForRealime,
        // })


        // // to notify users
        // io.to(membersSockets).emit(NEW_MESSAGE_ALERT,{
        //     chatId,
        // })

        try {
            await Message.create(messageForDB);
        } catch (error) {
            throw new Error(error);
        }

        // console.log("New Message",messageForRealime);
    });

    socket.on(START_TYPING, ({ members, chatId }) => {
        // console.log("start-typing",members,chatId);
        const memberSockets = getSockets(members)
        // console.log(memberSockets);
        io.to(memberSockets).emit(START_TYPING, { chatId });
    })

    socket.on(STOP_TYPING, ({ members, chatId }) => {
        // console.log("stop-typing",members,chatId);
        const memberSockets = getSockets(members)
        // console.log(memberSockets);
        io.to(memberSockets).emit(STOP_TYPING, { chatId });

    })


    socket.on(CHAT_JOIN, ({ userId, members }) => {
        console.log("User is undefined",userId)
        // console.log("Members",members);
        if(userId) 
            onlineUsers.add(userId.toString());

        console.log(onlineUsers);

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    });

    socket.on(CHAT_LEAVE, ({ userId, members }) => {
        if(userId) 
            onlineUsers.delete(userId.toString());

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    });

    socket.on("disconnect", () => {
        // userSocketIDs.delete(user._id.toString());
        // onlineUsers.delete(user._id.toString())
        // socket.broadcast.emit(ONLINE_USERS,Array.from(onlineUsers))
        // console.log(`${socket.id} disconnect`);

        const userSockets = userSocketIDs.get(user._id.toString()) || [];
        const updatedSockets = userSockets.filter((id) => id !== socket.id);

        if (updatedSockets.length > 0) {
            userSocketIDs.set(user._id.toString(), updatedSockets);
        } else {
            userSocketIDs.delete(user._id.toString());
            onlineUsers.delete(user._id.toString());
        }

        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
        console.log(`${socket.id} disconnected`);
    })
})

app.use(errorMiddleware);

server.listen(5000, (req, res) => {
    console.log(`Server connected to PORT:${PORT} and running in ${process.env.NODE_ENV} mode!`);
});

export { userSocketIDs };