import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';


export const signupController=async(req,res)=>{
        try {
            const {fullname,username,email,password} = req.body;
            
            //vlidate email-format:
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid email format" });
            }
            //validate uqique user-name:
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: "Username is already taken" });
            }
            //validate unique email:
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ error: "Email is already taken" });
            }
            //validate password length:
            if(password.length < 6){
                return res.status(400).json({ error: "password length is incorrect" });
            }

            //hashed password:
            const salt=await bcrypt.genSalt(10);
            const hashedPassword=await bcrypt.hash(password,salt);

            //create a new user:
            const newUser=new User({
                fullname,
                username,
                email,
                password:hashedPassword,
            })

            //generate token and cookies:
            if (newUser) {
                generateTokenAndSetCookie(newUser._id,res);
                //save:
                await newUser.save();

                res.status(201).json({
                    _id:newUser._id,
                    fullname:newUser.fullname,
                    username:newUser.username,
                    email:newUser.email,
                    followers:newUser.followers,
                    following:newUser.following,
                    profileImg:newUser.profileImg,
                    coverImg:newUser.coverImg, 
                })
            } else {
                res.status(400).json({error:"invalid user_data"});
            }

        } catch (error) {
            console.log("error with sign-up-controller",error.message)
            res.status(500).json({error:"something wrong in the server"})
        }
    
};

export const loginController=async(req,res)=>{
    try {
        const {username,password}=req.body;
        //find the user:
        const user=await User.findOne({username});
        //validate the corresponding password:
        const isPasswordCorrect=await bcrypt.compare(password,user?.password || "");

        //validate credentials:
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"invalid username or password !!!"})
        }

        //set token and cookies:
        generateTokenAndSetCookie(user._id,res);

        //sucessful:
        res.status(200).json({
                    _id:user._id,
                    fullname:user.fullname,
                    username:user.username,
                    email:user.email,
                    followers:user.followers,
                    following:user.following,
                    profileImg:user.profileImg,
                    coverImg:user.coverImg, 
        });
    } catch (error) {
        console.log("error with login-controller",error.message)
        res.status(500).json({error:"something wrong in the server"})
    }
}

export const logoutController=async(req,res)=>{
    try {
        //set the cookie free:
       res.cookie("jwt","",{maxAge:0});
       //sucessfully logout:
       res.status(200).json({message:"user log-out sucessfully"})


    } catch (error) {
        console.log("error with logout-controller",error.message)
        res.status(500).json({error:"something wrong in the server"})
    }
}

export const getMe=async(req,res)=>{
    try {
        //find the user:
        const user=await User.findById(req.user._id).select("-password");
        res.status(200).json(user)
    } catch (error) {
        console.log("error with getMe-controller",error.message)
        res.status(500).json({error:"something wrong in the server"})
    }
}