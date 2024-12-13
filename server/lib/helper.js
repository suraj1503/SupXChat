import { userSocketIDs } from "../server.js";


export const otherMember = (members, userId)=>{
    // console.log(members,userId);
    return members.find((member)=>member._id.toString()!==userId.toString());
}
    
export const getSockets = (members=[])=>{
    // console.log(users,"getSockets")
    // const sockets =  users.map((user)=>userSocketIDs.get(user.toString()));
    // return sockets;

    let sockets = [];
    members.forEach((memberId) => {
        const userSockets = userSocketIDs.get(memberId.toString()) || [];
        sockets = sockets.concat(userSockets);
    });
    return sockets;
}

export const getBase64 = (file)=>{
    //  console.log(file,"base64")
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
}