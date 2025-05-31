import { Router } from "express";
import { verifyJwt } from "../middelwares/auth.middelware.js";
import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
 } from "../controllers/playlist.controller.js";

const router = Router()

router.route('/getuserplaylists/:userId').get(verifyJwt,getUserPlaylists)
router.route('/createplaylist').post(verifyJwt,createPlaylist)
router.route('/getplaylisbyid/:playlistId').get(verifyJwt,getPlaylistById)
router.route('/addvideotoplaylist/:playlistId/:videoId').post(verifyJwt,addVideoToPlaylist)
router.route('/removevideofromplaylist/:playlistId/:videoId').post(verifyJwt,removeVideoFromPlaylist)
router.route('/deleteplaylist/:playlistId').post(verifyJwt,deletePlaylist)
router.route('/updateplaylist/:playlistId').post(verifyJwt,updatePlaylist)



export default router