import express from "express";
import { 
    allChatsController,
    allMessagesController,
    allUsersController,
    getAdminController,
    getDashboardStatsController,
    logoutAdminController,
    verifyAdminController
 } from "../controllers/admin-controller.js";
import { validatorHandler, verifyAdminValidator } from "../lib/validator.js";
import { isAdminOnly } from "../middlewares/auth.js";


const router = express.Router();


router.post('/verify',verifyAdminValidator(),validatorHandler,verifyAdminController);

router.get('/logout',logoutAdminController);

router.use(isAdminOnly);

router.get('/',getAdminController);

router.get('/users',allUsersController);

router.get('/chats',allChatsController);

router.get('/messages',allMessagesController);

router.get('/stats',getDashboardStatsController);

export default router;