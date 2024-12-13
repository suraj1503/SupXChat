import jwt from 'jsonwebtoken';

import { ErrorHandler } from "../utils/utility.js";
import { adminSecretKey } from '../server.js';
import { SUPX_ADMIN_TOKEN, SUPX_TOKEN } from '../constants/config.js';
import { User } from '../models/user-model.js';


const isAuthenticated = (req, res, next) => {
    // console.log("cookie:",req.cookies["supx_token"]);
    const token = req.cookies[SUPX_TOKEN];
    if (!token) return next(new ErrorHandler("You need to login to move forward!", 401));

    const secretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);

    //req.user makes value available throughout the code.
    req.user = decoded._id;
    // console.log(req.user)
    next();
};

const isAdminOnly = (req, res, next) => {
    // console.log("cookie:",req.cookies["supx_token"]);
    const token = req.cookies[SUPX_ADMIN_TOKEN];
    if (!token) return next(new ErrorHandler("Only admin can access this route!", 401));

    const secretKey = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (secretKey !== adminSecretKey)
        return next(new ErrorHandler("Only admin can access this route!", 401))

    next();

};

const socketAuthenticator = async(err,socket,next) => {
    try {
        if(err) return next(err);

        const authToken = socket.request.cookies[SUPX_TOKEN];

        if(!authToken) return next(new ErrorHandler('Please login to access this route!',401));

        const secretKey = process.env.JWT_SECRET_KEY;
        const decodedData = jwt.verify(authToken,secretKey);

        const user = await User.findById(decodedData._id);

        if(!user) return next(new ErrorHandler('Please login to access this route!',401))

        socket.user = user

        next()
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("Please login to access this route!",401));
    }   
}

export { isAuthenticated, isAdminOnly, socketAuthenticator };