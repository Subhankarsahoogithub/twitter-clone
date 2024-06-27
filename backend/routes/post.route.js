import express from 'express'
import {protectRoute} from '../middleware/protectRoute.js'
import { createPost,deletePost,commentOnPost,likeUnlikePost,getAllPosts,getLikedPosts,getFollowingPosts,getUserPosts } from '../controllers/post.controller.js';



const router=express.Router();

router.get('/all',protectRoute,getAllPosts);//get all posts 
router.get('/following',protectRoute,getFollowingPosts)//get all the posts of followings of the user:
router.get('/likes/:id',protectRoute,getLikedPosts)//get all posts liked by a specific user-id:
router.get('/user/:username',protectRoute,getUserPosts)//get all posts created by a user-name:
router.post('/create',protectRoute,createPost);//to create a new post:
router.post('/comment/:id',protectRoute,commentOnPost);//comment on a post:
router.post('/like/:id',protectRoute,likeUnlikePost);//like and unlike a post:
router.delete('/:id',protectRoute,deletePost);//delete a post:


export default router;