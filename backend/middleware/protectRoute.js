import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'

export const protectRoute=async(req,res,next)=>{
    try {
        //get the token:
     const token=req.cookies.jwt;
     //unauthorised:
     if(!token){
       return res.status(401).json({error:"unauthorised or token haven't provided"})
     }
     //authorised: then decode it and verify it:
     const decoded=jwt.verify(token,process.env.JWT_SECRET);

     //token not valid or expired:
     if(!decoded){
         return res.status(401).json({error:"Unauthorised or invalid token"});
     }

     //valid : find the corresponding userId:
     const user=await User.findById(decoded.userId).select("-password");

     //if user not found:
     if(!user){
        return res.status(404).json({error:"user not found"});
     }

     //user found so set it:
     req.user=user;
     next()//next middleware call
 
    } catch (error) {
        console.log("error with protect-route-middleware",error.message)
        res.status(500).json({error:"something wrong in the server"})
    }
}