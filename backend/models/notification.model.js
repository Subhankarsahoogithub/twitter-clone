import mongoose from "mongoose";

//create schema:
const notificationSchema=new mongoose.Schema({ 
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },

    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },

    type:{
        type:String,
        required:true,
        enum:['follow','like']
    },
    read:{
        type:Boolean,
        default:false,
    }
},{ timestamps:true})


//create model or table:
const Notification=mongoose.model('Notification',notificationSchema);
export default Notification;
