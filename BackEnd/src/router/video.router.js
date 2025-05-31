import { Router } from "express";
import { getAllVideos,
        publishAVideo,
        getVideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus
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
        upload.single({name : "thumbnail"})//IF PROBLEM
        ,updateVideo)

router.route('/getVideo/:videoId').get(verifyJwt,getVideoById)

router.route('/deleteVideo/:videoId').post(verifyJwt,deleteVideo)
router.route('/getAllVideo').get(verifyJwt,getAllVideos)
router.route('/togglepublishstatus/:videoId').post(verifyJwt,togglePublishStatus)

export default router