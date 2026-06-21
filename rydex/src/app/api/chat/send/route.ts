import connectDB from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const {bookingId, sender, text} = await req.json()

        const message = await ChatMessage.create({
            bookingId,
            sender,
            text
        })

        return NextResponse.json(message, {status: 201})
    } catch (error) {
        return NextResponse.json(
            {message: "Send Message error", error},
            {status: 500}
        )
    }
}