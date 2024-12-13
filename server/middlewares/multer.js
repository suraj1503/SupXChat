import multer from 'multer'
// two types of storage memory(ram) or disk(rom)

//default is ram
const multerUpload =multer({
    limits:{
        fileSize:1024*1024*5,
    }
});

const singleAvatar = multerUpload.single("avatar");

const attachments = multerUpload.array("files",5);

export {singleAvatar, attachments};