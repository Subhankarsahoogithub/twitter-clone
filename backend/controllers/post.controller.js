import {v2 as cloudinary} from 'cloudinary'
import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"



export const createPost=async(req,res)=>{
     try {
        //fetch the image and text of the post:
        const {text}=req.body;
        let {img}=req.body;
        //get the userid:
        const userId=req.user._id.toString();

        //verify user exist or not:
        const user=await User.findById(userId);
        //not exist:
        if(!user) return res.status(404).json({message:"user not found..."});
        //invalid post:
        if(!text && !img)return res.status(400).json({error:"post must have some text or image:"});

        //upload in cloudinary:
        if(img){
            const uploadedResponse=cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
         
        //post valid: create a post:
        const newPost=new Post({
              user:userId,
              text,
              img
        })
        //save it in the database:
        await newPost.save();

        //return response:
        return res.status(201).json(newPost);
     } catch (error) {
        //server side error:
        console.log("error with createPost handler:");
        return res.status(500).json({error:error.message});
     }
}

export const deletePost=async(req,res)=>{
    try {
       //fetch the id of the post and find the post:
       const post=await Post.findById(req.params.id);
       //post not exist:
       if(!post) return res.status(404).json({message:"post not found"});
       //check post belongs to that user or not:
       if(post.user.toString() !== req.user._id.toString()) return res.status(400).json({error:"you cann't delete other usre's post"})
       
         //delete it from cloudinary:
         if(post.img){
             const imgId=post.img.split("/").pop().split(".")[0];
             await cloudinary.uploader.destroy(imgId);
         }
         //delete the post from mongodb:
         await Post.findByIdAndDelete(req.params.id);

         //send response:
         return res.status(200).json({message:"post deleted sucessfully:"});
    } catch (error) {
       //server side error:
       console.log("error with deletePost handler:");
       return res.status(500).json({error:error.message});
    }
}

export const commentOnPost=async(req,res)=>{
   try {
      //fetch the text of the comment:
      const {text}=req.body;
      //fetch postid and userid:
      const postId=req.params.id;
      const userId=req.user._id;

      //empty comment:
      if(!text) return res.status(400).json({error:"invalid comment, Text field is required:"})
      //post not found:
      const post=await Post.findById(postId);
      if(!post)return res.status(404).json({error:"post not exist"}); 

      //create a comment:
      const comment= {user:userId,text};
      post.comments.push(comment);
      //save it:
      await post.save();
      
      //send response:
      return res.status(200).json(post);

   } catch (error) {
      //server side error:
      console.log("error with commentOnPost handler:");
      return res.status(500).json({error:error.message});
   }
}

export const likeUnlikePost=async(req,res)=>{
   try {
      //fetch post id and userid:
      const userId=req.user._id;
      const postId=req.params.id;

      //post doesnot exist:
      const post=await Post.findById(postId);
      if(!post) return res.status(404).json({error:"post not exist"});

      //user already liked this post:
      const userLikedPost = await post.likes.includes(userId);

      if(userLikedPost){
          //unlike it:
          await Post.findOneAndUpdate({_id:postId},{$pull:{likes:userId}});
          await User.findOneAndUpdate({_id:userId},{$pull:{likedPosts:postId}});

          return res.status(200).json({message:"post unliked sucessfully:"});
      }else{
         //like it:
         post.likes.push(userId);
         //add post in likedpost section array of the user:
         await User.findByIdAndUpdate({_id:userId},{$push:{likedPosts:postId}});
         //save it:
         await post.save();
         //send a notification:
         const notification=new Notification({
              from:userId,
              to:post.user,
              type:"like",
         })
         //save notification:
         await notification.save();
         //response:
         return res.status(200).json({message:"post liked sucessfully:"});
      }

   } catch (error) {
      //server side error:
      console.log("error with likeUnlikePost handler:");
      return res.status(500).json({error:error.message});
   }
}

export const getAllPosts=async(req,res)=>{
   try {
      const posts=await Post.find().sort({createdAt:-1}).populate({
         path:"user",
         select:"-password"
      }).populate({
         path:"comments.user",
         select:"-password"
      })//lifo

      //if no posts available:
      if(posts.length === 0)return res.status(200).json([]);

      //send all posts:
      return res.status(200).json(posts);

   } catch (error) {
      //server side error:
      console.log("error with getAllPosts handler:");
      return res.status(500).json({error:error.message});
   }
}

export const getLikedPosts=async(req,res)=>{
    //fetch the userid:
    const userId=req.params.id;
    try {
      //find the user:
      const user=await User.findById(userId);
      //user not found:
      if(!user) return res.status(404).json({error:"user not exist"});
      //fetch all the posts liked by user: just like a join operation between User && Post models
      const likePosts=await Post.find({_id:{$in:user.likedPosts}})
      .populate({
         path:"user",
         select:"-password"
      })
      .populate({
         path:"comments.user",
         select:"-password"
      });

      //send the response:
      return res.status(200).json(likePosts);

    } catch (error) {
      //server side error:
      console.log("error with getLikedPosts handler:");
      return res.status(500).json({error:error.message});
    }
}

export const getFollowingPosts=async(req,res)=>{
     try {
       //fetch the userId:
       const userId=req.user._id;
       //find the user:
       const user=await User.findById(userId);
       //user not exist:
       if(!user) return res.status(404).json({error:"user doesn't exist:"});

       //find all the followings of the user: as array:
       const following=user.following;
       //find all the post by followings of the user: like join operation between user and post table or model:
       const feedPosts=await Post.find({user:{$in:following}})
       .sort({createdAt:-1})
       .populate({
         path:"user",
         select:"-password"
      })
      .populate({
         path:"comments.user",
         select:"-password"
      });

      //send response:
      return res.status(200).json(feedPosts);

     } catch (error) {
        //server side error:
        console.log("error with getFollowingPosts handler:");
        return res.status(500).json({error:error.message});
     }
}

export const getUserPosts=async(req,res)=>{
   try {
      //fetch the username:
      const {username}=req.params;
      //find the user:
      const user=await User.findOne({username});
      //user not exist:
      if(!user) return res.status(404).json({error:"user not exist"});
      //find all the posts made by the user: just like join between user and post model:
      const posts=await Post.find({user:user._id})
      .sort({createdAt:-1})
      .populate({
         path:"user",
         select:"-password"
      })
      .populate({
         path:"comments.user",
         select:"-password"
      });

      //send response:
      return res.status(200).json(posts);
      

   } catch (error) {
      //server side error:
      console.log("error with getUserPosts handler:");
      return res.status(500).json({error:error.message});
   }
}