import express from "express";

import {
    loginController,
    newUserController,
    myProfileController,
    logoutController,
    searchUserController,
    sendRequestController,
    acceptRequestController,
    getMyNotificationsController,
    getMyFriendsController
} from "../controllers/user-controller.js";

import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

import { 
    acceptRequestValidator,
    loginValidator, 
    newUserValidator, 
    sendRequestValidator, 
    validatorHandler 
} from "../lib/validator.js";

const router = express.Router();

router.post('/login', loginValidator(), validatorHandler, loginController);

router.post('/new-user', singleAvatar, newUserValidator(), validatorHandler, newUserController);

//After above routes user should be logged in to access the below routes.

router.use(isAuthenticated);

router.get('/my-profile', myProfileController);

router.get('/logout', logoutController);

router.get('/search-user', searchUserController);

router.put('/send-request', sendRequestValidator(), validatorHandler, sendRequestController);

router.put('/accept-request', acceptRequestValidator(), validatorHandler, acceptRequestController);

router.get('/notifications', getMyNotificationsController);

router.get('/friends',getMyFriendsController);

export default router;