// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './db/index.js';

dotenv.config({
    path: './.env',
})


// WRITE CODE IN APP.JS
 import core from 'core-js'
 import cookieParser from 'cookie-parser'

 const app = express()



 app.use( express.json({limit:"20kb"}))
 app.use(express.urlencoded({extended:true,limit:"20kb"}))
 app.use(express.static("public"))

 app.use(cookieParser())

connectDB() 
.then(() => {
    app.on("error",(error) => {
        console.log("ERROR" , error);        
        throw error
    })
    app.listen(process.env.PORT || 6000,() => {
        console.log(`server is ranning at port numer ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log('monodb connection fail ' , error);
})


import userRoute from "./router/user.route.js"
import videRoute from "./router/video.router.js"
import likeRoute from "./router/like.route.js"
import commentsRoute from "./router/comments.route.js"
import tweetRoute from './router/tweet.router.js'
import playListRoute from './router/playlist.router.js'
import subRouter from './router/subscription.route.js'
app.use("/api/v1/users",userRoute)


app.use("/api/v1/videos",videRoute)
console.log("in index");
app.use("/api/v1/like",likeRoute)

app.use("/api/v1/comments",commentsRoute)

app.use("/api/v1/tweet",tweetRoute)

app.use("/api/v1/playlists",playListRoute)

app.use("/api/v1/sub",subRouter)

 //iefy fuction for immediate axecution
 /*
;(async () => {
    try {
        await mongoose.connect(`${process.env.MONG0DB_URI}/${DB_NAME}`)
        app.on('error',(error) => {
            console.log('Error')
            throw error
        })
        app.listen(process.env.PORT,() => {
            console.log(`Server is running on port ${process.env.PORT}`)

        })
    } catch (error) {
        console.log(error);
        throw error        
    }
})()*/

