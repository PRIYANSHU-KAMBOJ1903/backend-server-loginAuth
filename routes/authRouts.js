import express from "express";

import { isAuthenticated, login, logout, register, sendResetOTP, sendVerifyotp, verifyEmail,resetpassword } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
const authRouter=express.Router();
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verified-otp',userAuth,sendVerifyotp);
authRouter.post('/verify-account',userAuth,verifyEmail);
authRouter.get('/is-auth',userAuth,isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOTP);
authRouter.post('/reset-password',resetpassword);

export default authRouter;