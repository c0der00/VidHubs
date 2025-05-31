import mongoose,{ Schema } from "mongoose";

const commentsSchema = new Schema({
    content:{
        type:String,
        require : true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref : "User"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comments",commentsSchema)