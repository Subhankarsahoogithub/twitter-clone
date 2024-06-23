import express from 'express';
import authRoute from './routes/auth.route.js'
import dotenv from 'dotenv';
import connectMongoDb  from './db/connectMongoDb.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app=express();
const PORT=process.env.PORT || 5000;

//middleware: parese req.body
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//middleware routes:
app.use('/api/auth',authRoute)

app.listen(PORT,()=>{
    console.log(`server is running on port: ${PORT}`)
    connectMongoDb();
});

