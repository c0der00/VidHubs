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
            { description: { $regex: query, $options: "i" } },
           {"owners.username" : { $regex: query, $options: "i" } },
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
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
            $unwind : "$owner"
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
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  try {
    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerInfo",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          isLiked: {
            $cond: {
              if: {
                $in: [
                  new mongoose.Types.ObjectId(req.user?._id),
                  {
                    $map: {
                      input: "$likes",
                      as: "like",
                      in: "$$like.likedBy",
                    },
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
          owner: {
            $let: {
              vars: { ownerDoc: { $arrayElemAt: ["$ownerInfo", 0] } },
              in: {
                _id: "$$ownerDoc._id",
                username: "$$ownerDoc.username",
                fullName: "$$ownerDoc.fullName",
                avatar: "$$ownerDoc.avatar",
              },
            },
          },
        },
      },
      {
        $project: {
          likes: 0,
          ownerInfo: 0,
        },
      },
    ]);

    if (!video?.length) {
      throw new ApiError(404, "Video not found");
    }

    const currentVideo = video[0];

    if (currentVideo.duration > 0) {
      // Increment view count
    await Video.findByIdAndUpdate(videoId, { $inc: { viwes: 1 } });

      if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { watchHistory: videoId } 
        });
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, currentVideo, "Video retrieved successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});



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

const recommendedVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.id;

    if (!videoId) {
        return res.status(400).json(new ApiError(400, "Video ID is required"));
    }

    const currentVideo = await Video.findById(videoId);
    if (!currentVideo) {
        return res.status(404).json(new ApiError(404, "Video not found"));
    }

    const keywords = currentVideo.title.split(" ").slice(0, 3).join("|");
    const regex = new RegExp(keywords, "i");

    const recommendVideos = await Video.find({
        _id: { $ne: videoId },
        isPublished: true,
        title: { $regex: regex }
    })
        .populate({
            path: "owner",
            select: "-password -watchHistory" 
        })
        .sort({ viwes: -1 })
        .limit(10);

    return res
    .status(200)
    .json(new ApiResponse(200, {recommend : recommendVideos}, "Recommended"));
});

const getChannelVideosByChannelId = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
    } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const pageInt = parseInt(page, 10);
    const limitInt = Math.min(parseInt(limit, 10), 100);

    // Filter videos by user ID (assuming 'owner' is the user)
    const queryObj = {
        owner: new mongoose.Types.ObjectId(userId)
    };

    const allowedSortFields = ["createdAt", "updatedAt"];
    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(400, "Invalid sort field");
    }

    const sortDirection = sortType.toLowerCase() === "asc" ? 1 : -1;
    const sortObj = { [sortBy]: sortDirection };

    const totalVideos = await Video.countDocuments(queryObj);

    const videos = await Video.aggregate([
        { $match: queryObj },
        { $sort: sortObj },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$ownerDetails" },
        { $skip: (pageInt - 1) * limitInt },
        { $limit: limitInt }
    ]);

    const totalPages = Math.ceil(totalVideos / limitInt);

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            {
                pagination: {
                    page: pageInt,
                    limit: limitInt,
                    totalPages,
                    totalVideos,
                    hasNextPage: pageInt < totalPages,
                    hasPrevPage: pageInt > 1
                }
            },
            "User's videos fetched successfully"
        )
    );
});



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    recommendedVideo,
    getChannelVideosByChannelId
}