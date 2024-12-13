import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import { attachments } from "../middlewares/multer.js";
import {
  addMembersController,
  deleteChatDetailsController,
  getChatDetailsController,
  getMessagesContoller,
  getMyChatsController,
  getMyChatsSpecificController,
  getMyGroupsController,
  leaveGroupController,
  newGroupController,
  removeMemberController,
  renameChatDetailsController,
  sendAttachmentsController

} from "../controllers/chat-controller.js";
import { addMembersValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameChatValidator, sendAttachmentsValidator, validatorHandler } from "../lib/validator.js";



const router = express.Router();

//After above routes user should be logged in to access the below routes.

router.use(isAuthenticated);

router.post('/new-group', newGroupValidator(), validatorHandler, newGroupController);

router.get('/my-chats', getMyChatsController);

router.get('/specific-chat',getMyChatsSpecificController)

router.get('/my-groups', getMyGroupsController);

router.put('/add-members', addMembersValidator(), validatorHandler, addMembersController);

router.put('/remove-members', removeMemberValidator(),validatorHandler,removeMemberController);

router.delete('/leave/:chatId',chatIdValidator(),validatorHandler, leaveGroupController);

// attachments
router.post('/message', attachments,sendAttachmentsValidator(),validatorHandler, sendAttachmentsController);

//Get messages
router.get('/message/:chatId',chatIdValidator(),validatorHandler, getMessagesContoller);

// get chat details,rename and delete
router.route('/:chatId')
  .get(chatIdValidator(),validatorHandler,getChatDetailsController)
  .put(renameChatValidator(),validatorHandler,renameChatDetailsController)
  .delete(chatIdValidator(),validatorHandler,deleteChatDetailsController);

export default router;    