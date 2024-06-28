import express from 'express';
import dotenv from 'dotenv';
import connectMongoDb  from './db/connectMongoDb.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';


import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import postRoute from './routes/post.route.js'
import notificationRoute from './routes/notification.route.js'

dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const app=express();
const PORT=process.env.PORT || 5000;

//middleware: parese req.body
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//middleware routes:
app.use('/api/auth',authRoute)//authentications:
app.use('/api/user',userRoute)//follow,unfollow,update,getprofile:
app.use('/api/posts',postRoute);//related to post:
app.use('/api/notifications',notificationRoute)

app.listen(PORT,()=>{
    console.log(`server is running on port: ${PORT}`)
    connectMongoDb();
});

