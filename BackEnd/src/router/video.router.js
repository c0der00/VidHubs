import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  recommendedVideo,
  getChannelVideosByChannelId
} from '../controllers/video.controller.js'
import { upload } from "../middelwares/multer.middelwares.js";
import { verifyJwt } from "../middelwares/auth.middelware.js";


const router = Router()
console.log('in video route');



router.route('/publishVideo').post(verifyJwt,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
)

router.route('/updateVideo/:videoId').patch(verifyJwt,
  upload.single({ name: "thumbnail" }), updateVideo)

router.route('/getVideo/:videoId').get(verifyJwt, getVideoById)

router.route('/deleteVideo/:videoId').post(verifyJwt, deleteVideo)
router.route('/getAllVideo').get(getAllVideos)
router.route('/togglepublishstatus/:videoId').post(verifyJwt, togglePublishStatus)
router.route('/getVideo/:id/recom').get(recommendedVideo)

router.route('/getChannelVideosByChannelId').get(verifyJwt,getChannelVideosByChannelId)

export default router