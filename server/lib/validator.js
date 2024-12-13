import {body,validationResult,param} from 'express-validator';
import { ErrorHandler } from '../utils/utility.js';

const validatorHandler = (req,res,next)=>{
    const errors=validationResult(req);

    const errorMessage = errors.array().map((err)=>err.msg).join(", ");

    if(errors.isEmpty()) next();
    else  next(new ErrorHandler(errorMessage,400));
}

const newUserValidator = ()=>[
    body("name","Please enter name").notEmpty(),
    body("username","Please enter username").notEmpty(),
    body("bio","Please enter bio").notEmpty(),
    body("password","Please enter password").notEmpty()
];

const loginValidator = ()=>[
    body("username","Please enter username").notEmpty(),
    body("password","Please enter password").notEmpty()
];

const newGroupValidator = ()=>[
    body("name","Please enter group name").notEmpty(),
    body("members","Please enter members")
        .notEmpty()
        .isArray({min:2,max:100})
        .withMessage("Group should have atleast 3 members")
];

const addMembersValidator = ()=>[
    body("chatId","Please enter chat ID!").notEmpty(),
    body("members","Please enter members")
        .notEmpty()
        .isArray({min:1,max:97})
        .withMessage("Group should have atleast 3 members")
];

const removeMemberValidator = ()=>[
    body("chatId","Please enter chatId").notEmpty(),
    body("userId","Please enter userId").notEmpty()
];

const chatIdValidator = ()=>[
    param("chatId","Please enter chatId").notEmpty(),
];

const sendAttachmentsValidator = ()=>[
    body("chatId","Please enter chatId").notEmpty(), 
];

const renameChatValidator = ()=>[
    param("chatId","Please enter chatId").notEmpty(),
    body("name","Please enter chat name").notEmpty(), 
];

const sendRequestValidator = ()=>[
    body("userId","Please enter User Id").notEmpty(), 
];

const acceptRequestValidator = ()=>[
    body("requestId","Please enter Request Id").notEmpty(), 
    body("accept")
        .notEmpty()
        .withMessage("Add accept")
        .isBoolean()
        .withMessage("Accept must be boolean")
];

const verifyAdminValidator = ()=>[
    body("secretKey","Please enter Secret key").notEmpty(), 
];

export {
    validatorHandler,
    newUserValidator,
    loginValidator,
    newGroupValidator,
    addMembersValidator,
    removeMemberValidator,
    chatIdValidator,
    sendAttachmentsValidator,
    renameChatValidator,
    sendRequestValidator,
    acceptRequestValidator,
    verifyAdminValidator
}
