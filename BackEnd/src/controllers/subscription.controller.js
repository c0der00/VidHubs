import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId){
        throw new ApiError(400,"channel id is required")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"channel is is invalid")
    }

    const issubscribed = await Subscription.findOne({
        subscriber : req.user._id,
        channel : channelId,
    })

    if(issubscribed){
        await Subscription.deleteOne({
            _id : issubscribed._id
        })

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "subscription deleted successfully",
        ))
    }else{
        await Subscription.create({
            subscriber : req.user._id,
            channel : channelId
        })

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "subscription created successfully",
        ))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400,"channel id is required")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"channel is is invalid")
    }

    const subscriberlist = await Subscription.aggregate([
        {
            $match : {channel : new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscribers",
                pipeline:[
                    {
                        $project:{
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            coverImage: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                "subscribersCount" :{ $size : "$subscribers" },
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        subscriberlist,
        "Subscriber list of the channel is returned successfully",
    ))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(400,"Subscriber ID is required")
    }

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber ID")
    }

    const channelList = await Subscription.aggregate([
        {
            $match: {subscriber : new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar:1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },

    ])
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        channelList,
        "sub"
    ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}