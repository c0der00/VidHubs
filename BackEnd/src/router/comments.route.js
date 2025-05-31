import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import { 
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment } from "../controllers/comments.controller.js";

const router = Router()

router.route("/addcomment/:videoId").post(verifyJwt,addComment)
router.route("/getvideocomments/:videoId").get(verifyJwt,getVideoComments)
router.route("/updatecomment/:commentId").post(verifyJwt,updateComment)
router.route("/deletecomment/:commentId").post(verifyJwt,deleteComment)

export default router