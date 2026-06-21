import express from "express";
import dotEnv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import User from "./models/user.model.js";

dotEnv.config();

const port = process.env.PORT || 5000;
const mongodbUrl = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbUrl);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

const app = express();
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
});

/*  */
app.post("/emit", async(req, res)=>{
  const {event, userId, data} = req.body;

  try{
    const user = await User.findById(userId);
    if(!user?.socketId){
      return res.json(
        {success: false}
      )
    }
    io.to(user?.socketId).emit(event, data);

    return res.json(
      {success: true}
    )
  }catch(error){
    return res.json(
      {success: false}
    )
  }
})

io.on("connection", (socket) => {
    console.log("New socket connection established. Socket ID:", socket.id);
    
    socket.on("identity", async (userId)=>{
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, {
            socketId: socket.id,
            isOnline: true,
        })
    })

    socket.on("update-location", async ({userId, latitude, longitude})=>{
        await User.findByIdAndUpdate(userId, {
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        })
    })

    socket.on("join-ride", (bookingId) => {
      console.log("Join Ride", bookingId)
      socket.join(`ride-${bookingId}`)
    })

    socket.on("driver-location-update", ({bookingId, latitude, longitude, status})=>{
      io.to(`ride-${bookingId}`).emit("driver-location", {
        latitude, longitude
      })
    })

    socket.on("chat-message", (data)=>{
      io.to(`ride-${data.bookingId}`).emit("new-message", data)
    })

    socket.on("disconnect", async() =>{
        if(!socket.userId) return;
        await User.findByIdAndUpdate(socket.userId, {
            socketId: null,
            isOnline: false,
        })
    })
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});
