import mongoose from "mongoose";

const chatMessage = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    sender: {
        type: String,
        enum: ["user", "driver"],
        required: true,
    },
    text: {
        type: String,
        required: true
    }
}, {timestamps: true})

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessage)

export default ChatMessage
