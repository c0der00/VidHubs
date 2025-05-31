import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import { Tweet } from "../models/tweet.model.js";
import {ApiError} from "../utils/ApiError.js"
import { Video } from "../models/video.model.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../models/comments.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        return new ApiError(400, "Invalid video id")
    }
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video is not found")
    }
    

    const isLiked = await Like.findOne({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: req.user._id
    })


    if(isLiked){
        await Like.findByIdAndDelete(isLiked._id)

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "dislike is done"
        ))
    }else{
        const newLike = await Like.create({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy : req.user._id
        })
        return res
        .status(200)
        .json(new ApiResponse(
            200,
             newLike,
            "video liked !"
        ))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"comments is inValid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400,"comments not found")
    }

    const isLiked = await Like.findOne({
        comment : new mongoose.Types.ObjectId(commentId),
        likedBy: req.user._id
    })

    if(isLiked){
        await Like.findByIdAndDelete(isLiked._id)

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "comments like is dislike successfuly"
        ))
    }else{
        const newCommnetsLike = Like.create({
            comment : new mongoose.Types.ObjectId(commentId),
            likedBy : req.user._id
        })

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            newCommnetsLike,
            "comments liked !"
        ))
    }
}) 

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400,"tweed id is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400,"tweet is not found")
    }

    const isLiked = await Like.findOne({
        tweet : new mongoose.Types.ObjectId(tweetId),
        likedBy: req.user._id
    })

    if(isLiked){
        await Like.findByIdAndDelete(isLiked._id)

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            "tweet disliked seccessfuly"
        ))
    }else{
        const newTweetLike = await Like.create({
            tweet : new mongoose.Types.ObjectId(tweetId),
            likedBy : req.user._id
        })

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            newTweetLike,
            "tweet liked seccessfuly!"
        ))
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const {limit =10, pages = 1} = req.query

    if(pages < 1){
        throw new ApiError(400,"invalid page number")
    }

    const liked = await Like.find({
        likedBy: req.user?._id,
        video: { $exists: true } 
    })
    .populate({
        path: 'video',
        select: '_id thumbnail title description duration views isPublished',
        match: { isPublished: true }
    })
    .skip((pages - 1) * limit)
    .limit(limit);

    const filteredLike =  liked.filter(like => like.video !== null)

    const totalLikedVideo = await Like.countDocuments({
        video : {$exists: true},
        likedBy : req.user._id,
    })

    const totalPages = Math.ceil(totalLikedVideo / limit);
     const pagination = {
        totalPages,
        hasNextPage : pages < totalPages,
        hasPreviousPage : pages>1,
        currentPage : Number(pages),
        totalLikedVideo
     }

     if(filteredLike.length === 0){
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            pagination,
            "liked video not found"
        ))
     }

     const video = filteredLike.map(like => like.video)

     return res
     .status(200)
     .json(new ApiResponse(
        200,
        video,
        pagination,
        "liked video is facth successfuly"
     ))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}