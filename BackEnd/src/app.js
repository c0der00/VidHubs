//  import express from 'express'
//  import core from 'core-js'
//  import cookieParser from 'cookie-parser'

//  const app = express()

//  app.use(core({
//     origin:process.env.CORE_ORIGIN,
//     Credential : true
//  }))

//  app.use(express.json({limit:"5kb"}))
//  app.use(express.urlencoded({extended:true,limit:"5kb"}))
//  app.use(express.static("public"))

//  app.use(cookieParser())



//  import {registerUser} from './router/user.route.js'



//  app.use("/api/v1/users",registerUser)
 
//  export {app}