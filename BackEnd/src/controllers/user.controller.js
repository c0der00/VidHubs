import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import mongoose from 'mongoose'


const generateAccessAndRefereshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new ApiError(404, "User not found");
          }

          console.log(user);
          

        const refreshToken = user.generateRefreshToken()
        const accsessToken=  user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accsessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"somthing want wrrong at generateAccessAndRefereshToken")
    }
}


const registerUser = asyncHandler ( async(req,res) => {

    if(!req.body){
        console.log("req body is emty",);
        throw new ApiError(500,"req bosy is empty")
    }

    console.log(req.body);
    
    const {fullName,password , username,email} = req.body

    if(
    [fullName,password,username,email].some((field ) => field?.trim === "")
    ){
        return new ApiError(400,"All field is required")
    }

    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"user with email and username is already exists");
    } 

    const avatarLocalPath =  req.files?.avatar[0]?.path;
    console.log(avatarLocalPath,"dvsdv");
    
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        console.log(req.body);
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url ,
        coverImage : coverImage?.url || "",
        email,
        password,
        username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"    )
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(202).json(
        new ApiResponse(200,createdUser,"user register is sccessfuly register")
    )

})

const changePassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"old password is invalid")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json( new ApiResponse(200,{},"password is updated succsesfuly"))
})

const currentUser = asyncHandler(async (req,res)=> {
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"currentuser"))
})



const updatedUserDetail = asyncHandler(async(req,res) => {
    const {email,fullName} = req.body

    if(!email || !fullName) {
        throw new ApiError(400,"all fildes are require")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email,
                fullName
            }
        },
        {new: ture}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"user ditels updated successfuly "))

})

const loginUser = asyncHandler(async (req,res) => {
    const {email,username,password} = req.body

    if(!username  && !email){
        throw new ApiError(400,"username or password is required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"user is not exits")
    }

    const isPasswoedValid = await user.isPasswordCorrect(password)

    if(!isPasswoedValid) {
        throw new ApiError(401,"invalid user  credential")
    }

    const {accsessToken,refreshToken} = await generateAccessAndRefereshToken(user?._id)



    const loggrdUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options ={
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accsessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user : loggrdUser,
            accessToken : accsessToken,
            refreshToken : refreshToken
        },
        "user logged in seccessfully"
    )
    )
})

const updatedUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError("400","error while uploding avatar file ")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new : ture}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"user avtar is uploaded successfuly"))
})

const updatedUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError("400","error while uploding coverImage file ")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new : ture}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"coverlater is updated successfuly"))
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset : {
                refreshToken : 1
            }
        },
        {
            new : true
        }
    )
    const options ={
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken")
    .json(new ApiResponse(200,{},'userlogout'))
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }
    const channel = await User.aggregate([
       { 
        $match:{
            username : username?.toLowerCase()
        }
       },
       {
        $lookup:{
            from : "subscriptions",
            localField : "_id",
            foreignField : "channel",
            as : "subscribers"
        }
       },
       {
        $lookup:{
            from : "subscriptions",
            localField : "_id",
            foreignField : "subscriber",
            as : "subscribersTo"
        }
       },
       {
        $addFields:{
            subscriberCount : {
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{
                $size:"$subscribersTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then: true,
                    else:false
                }
            }
        }
       },
       {
        $project:{
            fullName:1,
            username:1,
            subscriberCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
        }
       }
 ])

 if(!channel?.length){
    throw new ApiError(404,"chennal is not exists")
 }

 return res
 .status(200)
 .json(new ApiResponse(200,channel[0],"user channel facth successfuly"))
})

const getWatchHistory = asyncHandler(async(req,res)=> {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] }
                        }
                    }
                ]
            }
        }
    ]);

    return res.json(
        new ApiResponse(
            200,
            user,
            "watch history"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    updatedUserDetail,
    changePassword,
    updatedUserAvatar,
    updatedUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}