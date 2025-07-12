import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import { Tweet } from "../models/tweet.model.js";
import {ApiError} from "../utils/ApiError.js"
import { Video } from "../models/video.model.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../models/comments.model.js";
import { User } from "../models/user.model.js";

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
    const { limit = 10, pages = 1 } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(pages);

    if (parsedPage < 1) {
        throw new ApiError(400, "Invalid page number");
    }

    const liked = await Like.find({
        likedBy: req.user?._id,
        video: { $exists: true }
    })
    .populate({
        path: 'video',
        select: '_id thumbnail title description duration viwes owner isPublished',
        match: { isPublished: true },
        populate: {
            path: 'owner',
            model: 'User',
            select: '_id fullName username avatar coverImage'
        }
    })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit);

    const filteredLikes = liked.filter(like => like.video !== null);

    const totalLikedVideo = await Like.countDocuments({
        likedBy: req.user._id,
        video: { $exists: true }
    });

    const totalPages = Math.ceil(totalLikedVideo / parsedLimit);

    const pagination = {
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
        currentPage: parsedPage,
        totalLikedVideo
    };

    if (filteredLikes.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, pagination, "No liked videos found")
        );
    }

     
    const videos = filteredLikes.map(like => like.video);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            pagination
        }, "Liked videos fetched successfully")
    );
});



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}