import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
    } = req.query;
    //TODO: get all videos based on query, sort, pagination

    const queryObj = {}

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "user id is not valid")
        }
        queryObj.owner = new mongoose.Types.ObjectId(userId);
    }

    if(!query){
        throw new ApiError(400,"query is require")
    }

    if (query) {
        queryObj.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    const allowedSortFields = ["title", "description", "createdAt", "updatedAt", "views"];
    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(400, "Invalid sort field")
    }

    if (!["asc", "desc"].includes(sortType)) {
        throw new ApiError(400, "only asc & desc")
    }

    const sortObj = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    const totalVideos = await Video.countDocuments(queryObj)
console.log("in video all");

    const videos =await Video.aggregate([
        {
            $match: queryObj
        },
        {
            $sort: sortObj
        },
        {
            $lookup:
            {
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "owners",
                pipeline: [
                    {
                        $project : {
                            username : 1,
                            fullName : 1,
                            avatar : 1
                        }
                    }
                ]
            }
        },
        {
            $unwind : "$owners"
        },
        {
            $skip : Number((page) - 1 ) * Number(limit)
        },
        {
            $limit : Number(limit)
        }
    ])

    const totalPages = Math.ceil(totalVideos / limit);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        videos,
        {
            pagination : {
            page: Number(page),
            limit: Number(limit),
            totalPages,
            totalVideos,
            hasNextPage: Number(page) < totalPages,
            hasPrevPage: Number(page) > 1
            }
        },
        "Videos retrieved successfully"
    ))

})

const publishAVideo = asyncHandler(async (req, res) => {
    console.log('in upload');
    
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title && !description) {
        throw new ApiError(400,"title and description is require")
    }

    const localVideoPath = req.files?.videoFile[0]?.path
    const thumbnailVideoPath = req.files?.thumbnail[0]?.path

    if(!localVideoPath){
        throw new ApiError(400,"localvideo path is required")
    }

    if(!thumbnailVideoPath){
        throw new ApiError(400,"thumbnail video path is required")
    }

    const videoFile = await uploadOnCloudinary(localVideoPath)

    console.log("tis video",videoFile);
    

    if(!videoFile){
        throw new ApiError(500,"video is not uploaded")
    }

    const thumbnailFile = await uploadOnCloudinary(thumbnailVideoPath)


    if(!thumbnailFile) {
        throw new ApiError(500,"thumblinail video is not uploaded")
    }


    const video = Video.create({
        videoFile : videoFile.url,
        thumbnail : thumbnailFile.url,
        title,
        description,
        duration : videoFile.duration,
        owner : req.user._id
    })

    if(!video) {
        throw new ApiError(500,"video is not published")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        "video is published successfull",
        video
    ))
})

const getVideoById = asyncHandler(async (req, res) => {

    
    const { videoId } =  req.params
    //TODO: get video by id
    if(!videoId){
        return new ApiError(400,"video id is required")
    }
    try {
        const video = Video.aggregate([
            {
                $match : {
                _id :new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup : {
                    from:"likes",
                    localField : "_id",
                    foreignField: "video",
                    as:"likes"
                }
            },
            {
                $lookup : {
                    from : 'User',
                    localField : "owner",
                    foreignField : "_id",
                    as : "owner"
                }
            },
            {
                $addFields: {
                    $likesCount : {$size : "$likes"},
                    $isLiked : {
                        $cond: {
                            if: req.user?._id ? {
                                $in : [
                                    new mongoose.Types.ObjectId(req.user._id),
                                   {
                                    $map : {
                                       input : "$likes",
                                       as : "like",
                                       in : $$like.likedBy
                                    }
                                    }
                                ]
                            } : false,
                            then : true,
                            else : false
                        }
                    },
                    $owner : {
                        $let : {
                            vars:{ownerDoc :{$arrayElemAt : ["$owner",0]}},
                            in:{
                                _id: "$$ownerDoc._id",
                                username: "$$ownerDoc.username",
                                fullName: "$$ownerDoc.fullName",
                                avatar: "$$ownerDoc.avatar"
                            }
                        }
                    }
                }
    
            },
            {
                $project: {
                    likes : 0
                }
            }
        ])

        if(!video?.lenght){
            throw new ApiError(404,"video not found")
        }
    
    
    } catch (error) {
        throw new ApiError(500,error.message)
    }
   
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        "video found",
        video[0]
    ))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(500,"video id is required")
    }

    const {title,description} = req.body
    const updateData = {}
    if(!title){
        throw new ApiError(400,"title is required")
    }

    updateData.title = title

    if(!description){
        throw new ApiError(400,"description is required")
    }

    updateData.description = description

    if(req.file){
        if(!["image/jpeg","image/png"].includes(req.file.mimetype)){
            throw new ApiError(400,"Invalid thumbnail format")
        }
        if (req.file.size > 2_097_152) {
            throw new ApiError(400, "Thumbnail exceeds 2MB size limit");
        }
        const uploadResult = await uploadOnCloudinary(req.file.path)

        if(!uploadResult?.url){
            throw new ApiError(500,"file uploade is fail")
        }

        updateData.thumbnail = uploadResult.url;

        if (Object.keys(updateData).length === 0) {
            throw new ApiError(400, "No valid update fields provided");
        }

        const afterUpdate = await Video.findByIdAndUpdate(
            videoId,
            {$set : updateData},
            {
                new: true,
                projection: { __v: 0, internalState: 0 },
            }
        )
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(400,"video id is required")
    }

    const response = await findByIdAndDelete(videoId)

    if(!response){
        throw new ApiError(400,"video is not deleted")
    }

    res
    .status(200)
    .json(new ApiResponse(
        200,
        "video is deleted",
    ))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"video id is required")
    }

    const toggelVideoStatus = await findByIdAndUpdate(
        videoId,
        {$set: {isPublished: !isPublished}},
        {new : true}
    )

    if(!toggelVideoStatus){
        throw new ApiError(400,"video not found")
    }

    res
    .status(200)
    .json(new ApiResponse(
        200,
        "video status change successfuly",
        toggelVideoStatus
    ))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}