import express from 'express';
import { signupController,loginController,logoutController, getMe } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';


const router=express.Router();

router.get('/me',protectRoute,getMe);
router.post('/signup',signupController);
router.post('/login',loginController);
router.post('/logout',logoutController);

export default router;