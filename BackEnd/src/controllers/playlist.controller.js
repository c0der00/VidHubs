import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name){
        throw new ApiError(400,"name is reuired")
    }

    if(!description){
        throw new ApiError(400,"description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : req.user._id,
        video : []
    })

    if(!playlist){
        throw new ApiError(400,"playlist not created")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlist,
        "playlist is created successfuly"
    ))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"userId is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid userId")
    }

    const owner = await User.findById(userId)
console.log(owner);

    if(!owner){
        throw new ApiError(404,"user not found")
    }

    const userPlaylists = await Playlist.aggregate([
        {
            $match:{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"Video",
                localField:"_id",
                foreignField:"videoFile",
                as:"videosList"
            }
        },
        {
            $addFields:{
                videoLList:{
                $cond :{
                    if:{
                        $gt : [
                            { 
                            $size : "$videosList"
                            },
                            0
                        ]
                    },
                    then: true,
                    else: false
                }}
            }
        },
        
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        userPlaylists,
        "User playlists"
    ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(40,"playlist id is required")
    }

    

    const playlist = await Playlist.findById(playlistId)
                            .populate("videos")

    if(!playlist){
        throw new ApiError(40,"playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlist,
        "fatch by id playlist successfuly"
    ))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }

    if(!videoId){
        throw new ApiError(400,"video id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    const video = await Video.findById(videoId)
                        

    if(!video){
        throw new ApiError(400,"video not found")
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"video is already in playlist")
    }
    playlist.videos.push(videoId)
   
    playlist.populate("videos")
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlist,
        "add video to playlist successfuly"
    ))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }

    if(!videoId){
        throw new ApiError(400,"video id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }
 
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"video not found in playlist")
    }

    playlist.videos = playlist.videos.filter(
        (videoid) => videoid.toString() === videoId.toString() 
    )

    playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlist,
        "remove video from playlist successfuly"
    ))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"you are not the owner of this playlist")
    }

    await Playlist.findByIdAndDelete(playlist._id)

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "delete playlist successfuly"
    ))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }
    if (playlist.owner.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "Unauthorized - You don't own this playlist")
    }

    if(!name){
        throw new ApiError(400,"name is required")
    }

    if(!description){
        throw new ApiError(400,"description is required")
    }

    // if(name){playlist.name = name}
    // if(description){playlist.description = description} 

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name: name,
                description : description
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        updatedPlaylist,
        "update playlist successfuly"
    ))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}