import { Router } from "express";
import { currentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import {upload} from '../middelwares/multer.middelwares.js'

const router = Router()


router.route("/register").post( 
    upload.fields([
        {
            name : "avatar",
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ])
    ,registerUser)


router.route("/login").post(loginUser)

router.route('/logout').post(verifyJwt,logoutUser)

router.route('/c/:username').get(verifyJwt,getUserChannelProfile)

router.route('/watch').get(verifyJwt,getWatchHistory)

router.route('/current-user').get(verifyJwt,currentUser)


export default router