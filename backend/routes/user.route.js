import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile,followUnfollowUser,getSuggestedUsers,updateUser } from '../controllers/user.controller.js';


const router=express.Router();

router.get('/profile/:username',protectRoute,getUserProfile) //to get the profile page of specific username
router.get('/suggested',protectRoute,getSuggestedUsers)  //show some user suggestions:
router.post('/follow/:id',protectRoute,followUnfollowUser) //follow or unfollow a user with specific id
router.post('/update',protectRoute,updateUser)//update changes made by user:

export default router;