import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if(!content){
        throw new ApiError(400,"content is required") 
    }

    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Tweet could not be created");
    }
    
    return res
       .status(200)
       .json(new ApiResponse(200, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if(!userId){
        throw new ApiError(400,"user id is required")
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"Like",
                localField:"_id",
                foreignField:"tweet",
                as : "likesCount",
                pipeline:[
                    {$count : "total"},
                ]
            }
        },
        {
            $lookup:{
                from:"Like",
                let:{tweetId : "$_id"},
                pipeline:[
                    {
                        $match:{
                            $expr:{
                                $and:[
                                    {$eq : ["$tweet" , "$$tweetId" ]},
                                    {$eq : ["$likedBy" , req.user._id]}
                                ]
                            }
                        }
                    }
                ],
                as : "isLike"
            }
        },
        {
            $addFields:{
                likesCount: {
                    $ifNull: [{ $arrayElemAt: ["$likesCount.total", 0] }, 0]
                },
                isLiked: {
                    $cond: {
                      if: { $gt: [{ $size : "$isLike" }, 0] },
                      then: true,
                      else: false
                    }
                }    
            }
        },
        {
            $project: {
              _id: 1,
              content: 1,
              owner: 1,
              createdAt: 1,
              likesCount: 1,
              isLiked: 1
            }
          }
    ])

    if (!tweets) {
        throw new ApiError(500, "Tweets could not be fetched");
    }
    
    return res
       .status(200)
       .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(!tweetId){
        throw new ApiError(400,"tweet id is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweet is invalid")
    }

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {$set : {content : content}},
        {new : true}
    )

    if (!updateTweet) {
        throw new ApiError(500, "Tweet could not be updated");
      }
  
    return res
        .status(200)
        .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    try {
        await Tweet.findByIdAndDelete(tweetId);

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Tweet could not be deleted");
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}