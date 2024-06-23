import express from 'express';
import authRoute from './routes/auth.route.js'
import dotenv from 'dotenv';
import connectMongoDb  from './db/connectMongoDb.js';

dotenv.config();

const app=express();

const PORT=process.env.PORT || 5000;
console.log(process.env.MONGO_URI)


app.listen(PORT,()=>{
    console.log(`server is running on port: ${PORT}`)
    connectMongoDb();
});


//middleware routes:
app.use('/api/auth',authRoute)