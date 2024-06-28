import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getNotifications=async(req,res)=>{
     try {
        //fetch the userId:
        const userId=req.user._id;
        //find the user:
        const user=await User.findById(userId);
        //user not exist:
        if(!user) return res.status(404).json({error:"user not found.."})
        //find all the notifications mean for the user: join of user model and notification model:
        const notifications=await Notification.find({to:userId})
        .populate({
            path:"from",
            select:"username profileImg"
        });
        //set all these notifications to read:
        await Notification.updateMany({to:userId},{read:true});

        //send the response:
        return res.status(200).json(notifications);
     } catch (error) {
        //internal server error:
        console.log("error with getNotificationsController",error.message)
        res.status(500).json({error:"something wrong in the server"})
     }
}

export const deleteNotifications=async(req,res)=>{
    try {
        //fetch the userId:
        const userId=req.user._id;
        //find the user:
        const user=await User.findById(userId);
        //user not exist:
        if(!user)return res.status(404).json({error:"user not found.."});

        //delete all notifications mean to the user:
        await Notification.deleteMany({to:userId});

        //send the response:
        return res.status(200).json({message:"notifications deleted... sucessfully"});
    } catch (error) {
        //internal server error:
        console.log("error with deleteNotificationsController",error.message)
        res.status(500).json({error:"something wrong in the server"})
    }
}