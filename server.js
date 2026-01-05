  import express from "express";
  import cors from "cors";
  import 'dotenv/config'
  import cookieParser from "cookie-parser";
  import connectDB from "./config/mongodb.js";
  import authRouter from './routes/authRouts.js'
  import userRouter from "./routes/userRouts.js";
  const app=express();
  const port=process.env.PORT || 4000;

  connectDB();
  const allowerdOrigins=['https://melodic-biscuit-846e6b.netlify.app']
  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  app.use(cookieParser());
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowerdOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true // important for cookies
  }));


  //API Endpoints
  app.get("/",(req,res)=>{
      res.send("API is working fine");
  })
  app.use('/api/auth',authRouter);
  app.use('/api/user',userRouter);
  app.listen(port,(req,res)=>{
      console.log(`Server Starting on Port:${port}`)
  })




