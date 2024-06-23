import mongoose from "mongoose";
 
const connectMongoDb=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log(`MONGODB connected succefully:${conn.connection.host}`)
    } catch (error) {
        console.log(`error while connecting MONGODB : ${error.message}`)
        process.exit(1);
    }
}

export default connectMongoDb;