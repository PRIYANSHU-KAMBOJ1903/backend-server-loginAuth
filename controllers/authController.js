import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import transpoter from "../config/nodeMailer.js";



export const register=async (req,res)=>{
    const {name,email,password}=req.body;
    if(!name||!email||!password){
        return res.json({success:false,message:"Missing Details"});
    }
    try{
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false,message:'User Already exists'});
        }
        const hashedPassword =await bcrypt.hash(password,10);
        const user=new userModel({name,email,password:hashedPassword});
        await user.save();
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true,
            secure: true,
            sameSite: "None",
            maxAge:7*24*60*60*1000,
        });
        //sending welcome email
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:'Welcome the Testing Project Developed by Priyanshu',
            text:`Welcome to this site .Your Account has been created with email id: ${email}`
        }
        await transpoter.sendMail(mailOptions);
        return res.json({success:true});

    }catch(error){
        res.json({success:false,message:error.message})
    }
}
export const login=async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.json({success:false,message:'Email and Password are required'})
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'Invalid email'})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:'Invalid Password'})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true,
           secure: true,
            sameSite: "None",
            maxAge:7*24*60*60*1000,
        })
        return res.json({success:true});

    }catch(error){
        return res.json({success:false,message:error.message});
    }

}

export const logout=async (req,res)=>{
    try{
        res.clearCookie('token',{
             httpOnly:true,
           secure: true,
             sameSite: "None",
        })
        return res.json({success:true,message:'Logged Out'})
    }catch(error){
        return res.json({success:false,message:error.message});
    }

}

// Send Verification OTP to the user 's Email
export const sendVerifyotp= async(req,res)=>{
    try{
        const {userId}=req.body;
        const user=await userModel.findById(userId);

        if(user.isAccountVerified){
           return res.json({success:false,message:"Account Already verified"});
        }
      const otp= String( Math.floor(100000+Math.random()*900000) );
      user.verifyOTP=otp;
      user.verifyOTPExpireAt=Date.now()+24*60*60*1000
      await user.save();
      const mailOptions={
         from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Account Verification OTP',
            text:`You OTP is ${otp}. Verify your account using this OTP`
        }
        await transpoter.sendMail(mailOptions);
       return res.json({success:true,message:'Verification OTP Send on Email'});
    }catch(error){
        res.json({success:false,message:error.message});
    }

}
export const verifyEmail=async (req,res)=>{
    const {userId,otp}=req.body;
    if(!userId || !otp){
        return res.json({success:false,message:'Missing Details'});
    }
    try{
        const user=await userModel.findById(userId);
        if(!user){
            return res.json({success:false,message:'User not found'});
        }
        if(user.verifyOTP===''||user.verifyOTP!==otp){
            return res.json({success:false,message:'Invalid OTP'});
        }
        if(user.verifyOTPExpireAt<Date.now()){
            return res.json({success:false,message:'OTP Expired'});
        }
        user.isAccountVerified=true;
        user.verifyOTP='';
        user.verifyOTPExpireAt=0;
        await user.save();
        return res.json({success:true,message:'Email verified successfully'});


    }catch(error){
        return res.json({success:false,message:error.message});
    }
}
//check if user is authenticated
export const isAuthenticated=async (req,res)=>{
    try{ 

        return res.json({success:true});
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

//send Password reset otp
export const sendResetOTP=async(req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({success:false,message:'Email is required'})
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'User not fouund'});
        }
         const otp= String( Math.floor(100000+Math.random()*900000) );
      user.resetOTP=otp;
      user.resetOTPExpireAt=Date.now()+15*60*1000
      await user.save();
      const mailOptions={
         from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Password Reset OTP',
            text:`Your OTP for resetting your password is ${otp}. Use this OTP to proceed with ressetting your password.`,
        }
        await transpoter.sendMail(mailOptions);
        return res.json({success:true,message:'OTP send to your email'});
    }catch(error){

    }
}
// Resett your password
export const resetpassword =async (req,res)=>{
    const {email ,otp,newpassword}=req.body;
    if( !email || !otp || !newpassword){
        return res.json({success:false,message:'Email ,OTP ,and new password are required' });
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'User not found'});
        }
        if(user.resetOTP===''||user.resetOTP !==otp){
            return res.json({success:false,message:'Invalid OTP'});
        }
        if(user.resetOTPExpireAt<Date.now()){
            return res.json({success:false,message:'OTP Expire'});
        }
        const hassedPassword=await bcrypt.hash(newpassword,10);
        user.password=hassedPassword;
        user.resetOTP='';
        user.resetOTPExpireAt='';
        await user.save();
        return res.json({success:true,message:'Password has been reset succesfully'});
    }catch(error){
        return res.json({success:false,message:error.message});
    }
}