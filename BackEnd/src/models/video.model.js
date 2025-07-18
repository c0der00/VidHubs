import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from 'jsonwebtoken'
import bcrypt from  'bcrypt'


const videoSechma = Schema(
    {
        videoFile: {
            type : String,
            required : true,
        },
        thumbnail : {
            type : String,
            required : true,
        },
        title : {
            type : String,
            required : true,
        },
        description: {
            type : String,
            required : true,
        },
        duration : {
            type : Number,
            required : true,
        },
        viwes : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)

videoSechma.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSechma)