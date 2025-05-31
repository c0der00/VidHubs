import express from "express"
import { DB_NAME } from "../constantss.js"
import mongoose from "mongoose"

const app = express()

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONG0DB_URI}/${DB_NAME}`)
        console.log(`mongodb connection ::  host ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("manodb arror  ",error);
        process.exit(1)
    }
}

export default connectDB