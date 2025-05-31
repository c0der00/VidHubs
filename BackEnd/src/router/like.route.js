import { Router } from "express";
import { 
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
 } from "../controllers/likes.controller.js";
import { verifyJwt } from "../middelwares/auth.middelware.js";

const router = Router()
console.log("rrrrrrrr");


router.route("/togglevideolike/:videoId").post(verifyJwt,toggleVideoLike)
router.route("/togglecommentlike/:commentId").post(verifyJwt,toggleCommentLike)
router.route("/toggletweetlike/:tweetId").post(verifyJwt,toggleTweetLike)
router.route("/getlikedvideos").get(verifyJwt,getLikedVideos)

export default router