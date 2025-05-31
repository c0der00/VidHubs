import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middelwares/auth.middelware.js";

const router = Router()

router.route("/togglesubscription/:channelId").post(verifyJwt,toggleSubscription)
router.route("/getuserchannelsubscribers/:channelId").get(verifyJwt,getUserChannelSubscribers)
router.route('/getsubscribedchannels/:subscriberId').get(verifyJwt,getSubscribedChannels)

export default router