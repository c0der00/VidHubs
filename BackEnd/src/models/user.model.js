import mongoose,{Schema} from "mongoose";
import bcryp from 'bcrypt'
import jwt from "jsonwebtoken";


const userSechema = Schema({
    username : {
        type : String,
        required : true,
        unique : true ,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true ,
        lowercase : true,
        trim : true,
    },
    fullName : {
        type : String,
        required : true,
        trim : true,
    },
    avatar : {
        type : String, //cloudenarry
        required : true,
    },
    coverImage: {
        type : String
    },
    watchHistory : [
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
    }
    ],
    password : {
        type : String,
        required : [true,"password is required"]
    },
    refreshToken : {
        type : String
    }
},{timestamps : true})

userSechema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcryp.hash(this.password, 10)
    next()
})

userSechema.methods.isPasswordCorrect = async function(password){
    return await bcryp.compare(password, this.password)
}

userSechema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
      }
    );
  };

userSechema.methods.generateRefreshToken = function () {
return jwt.sign(
    {
    _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
);
}

export const  User = mongoose.model("User",userSechema) 