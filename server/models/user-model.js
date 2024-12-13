import mongoose,{Schema, model,Types} from "mongoose";
import {hash} from 'bcrypt'

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        unique:true,
        required:true
    },
    bio:{
        type:String,    
        required:true
    },
    password:{
        type:String,
        unique:true,
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true
        }
    }
},{
    timestamps:true
});
//pre hashes password before saving and if not modified will not hash
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return next();
    this.password=await hash(this.password,10);
})

export const User = mongoose.models.User || model("User",userSchema);
