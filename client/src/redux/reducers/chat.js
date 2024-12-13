import { createSlice } from "@reduxjs/toolkit";
import { getOrSaveFromLocalStorage } from "../../lib/features";
import { NEW_MESSAGE_ALERT } from "../../constants/events";

const initialState={
   notificationCount:0,
   newMessagesAlert:getOrSaveFromLocalStorage({key:NEW_MESSAGE_ALERT,get:true}) || [
    {
        chatId:"",
        count:0
    }
   ]
}

const chatSlice = createSlice({
    name:"chat",
    initialState,
    reducers:{
        incrementNotification:(state)=>{
            state.notificationCount+=1
        },
        resetNotification:(state)=>{
            state.notificationCount=0
        },
        // in this we are check wether newMessagesAlert array has chatId similar to chatId will pass
        // through action.payload if yes then we'll just increase the count and not then we'll just
        // set new object with diff chatid with count as 1
        setNewMessagesAlert:(state,action)=>{
            const index = state.newMessagesAlert.findIndex(idx=>idx.chatId===action.payload.chatId)
            //above statement will give index if action payload and newMessagesAlert will have 
            //same chatId

            if(index!==-1){
                state.newMessagesAlert[index].count+=1 // here we increase count because we found the index
            }
            else{
                state.newMessagesAlert.push({
                    chatId:action.payload.chatId,
                    count:1
                })
            }

        },
        removeNewMessagesAlert:(state,action)=>{
            //here we are removing the chatId from newMessagesAlert which matches with action payload chatId
            state.newMessagesAlert=state.newMessagesAlert.filter(msg=>msg.chatId!==action.payload)

        }
    }
})

export default chatSlice;
export const {
    incrementNotification,
    resetNotification,
    setNewMessagesAlert,
    removeNewMessagesAlert
} = chatSlice.actions