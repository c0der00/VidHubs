import { Router } from "express";

import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"
import { verifyJwt } from "../middelwares/auth.middelware.js";

const router = Router()

router.route("/createtweet").post(verifyJwt,createTweet)
router.route("/getusertweets/:userId").get(verifyJwt,getUserTweets)
router.route("/updatetweet/:tweetId").post(verifyJwt,updateTweet)
router.route("/deletetweet/:tweetId").post(verifyJwt,deleteTweet)

export default router