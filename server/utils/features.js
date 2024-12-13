import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import {v4 as uuid} from 'uuid'
import { getBase64, getSockets } from "../lib/helper.js";
// import { base, fi } from "@faker-js/faker";



const connectDB = (uri)=>{
    mongoose.connect(uri,{ dbName:"SupXChat"})
    .then((data)=>{
        console.log(`Connected to DB:${data.connection.host}`);
    }).catch((err)=>{
        console.log(err);
    })
};

const cookieOptions = {
    maxAge:24*60*60*1000,
    sameSite:"none",
    httpOnly:true,
    secure:true
};

const sendToken = (res, user, code, message)=>{
    const privateKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({_id:user._id},privateKey);

    res.status(code).cookie("supx_token",token,cookieOptions).json({
        success:true,
        user:user,
        message,
    })
};


const emitEvent = (req, event, users, data) =>{
    // console.log(event,users,"users")
    const io=req.app.get("io"); //here we get the socket instance from server
    const usersSocketId = getSockets(users) // here we are getting the socketId of all users then emitting them
    io.to(usersSocketId).emit(event,data)
    // console.log("Emiting event",event);
}

const uploadFilesToCloudinary = async(files=[])=>{
    
    const uploadPromises = files.map((file)=>{
        return new Promise((resolve,reject)=>{
            const base64 = getBase64(file)
            cloudinary.uploader.upload(
                base64,
                {
                    resource_type:"auto",
                    public_id:uuid()
                },
                (error,result)=>{
                    if(error) return reject(error)
                    resolve(result)
                }
            )
        })
    })

    try {
        const results =  await Promise.all(uploadPromises);

        const formattedResults = results.map((result)=>({
            public_id:result.public_id,
            url:result.secure_url
        }))

        return formattedResults
    } catch (error) {
        throw new Error("Error uploading files to cloudinary",error)
    }
}

const deleteFilesFromCloudinary = async(public_ids)=>{

}

export {connectDB, sendToken,cookieOptions, emitEvent, deleteFilesFromCloudinary, uploadFilesToCloudinary};