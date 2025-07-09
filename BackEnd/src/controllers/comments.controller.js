import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video

    const { videoId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1 || isNaN(page)) {
        throw new ApiError(400, "Page must be greater than 0");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.aggregate([
        {
            $match: {
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from : "users",
                localField: "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                    {
                        $project:{
                            fullName : 1,
                            username : 1,
                            avatar : 1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from : "likes",
                localField :"_id",
                foreignField : "comment",
                as : "likes"
            }
        },
        {
            $addFields: {
                countLikes: { $size: "$likes" },  // Count the number of elements in the 'likes' array
                owner: { $arrayElemAt: ["$owner", 0] },  // Extract the first element from the 'owner' array
                isLikes: {
                    $cond: {
                        if: {
                            $gt: [
                                { 
                                    $size: { 
                                        $filter: {
                                            input: "$likes",  // The 'likes' array
                                            as: "like",  // Alias for each element in the array
                                            cond: { 
                                                $eq: ["$$like.likedBy", new mongoose.Types.ObjectId(req.user?._id)]  // Compare the 'likedBy' field to the current user's ObjectId
                                            }
                                        }
                                    }
                                },
                                0  // If the size of the filtered array is greater than 0, it means the user has liked the item
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            comments,
            pagination: {
                page,
                limit,
                totalPages,
                totalComments,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        },
        "comments fatch successfuly"
    ))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const comment =await Comment.create({
        content,
        video : new mongoose.Types.ObjectId(video._id),
        owner : req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Comment added successfully"
    ))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if(!commentId){
        throw new ApiError(400,"comment id is required")
    }

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400,"comments not found")
    }

    const updatedCommnet = await Comment.findByIdAndUpdate(
        commentId,
        {
          $set: { content: content.trim() },
        },
        { new: true }
    )

    if(!updatedCommnet){
        throw new ApiError(500,"comment not update ")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        updatedCommnet,
        "comments update successfuly"
    ))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment Id is required");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // if (comment.owner.toString() !== req.user._id.toString()) {
    //     throw new ApiError(403, "You are not authorized to delete this comment");
    // }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }