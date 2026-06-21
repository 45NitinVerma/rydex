import connectDB from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDB()
        const {bookingId} = await req.json()
        const booking = await Booking.findById(bookingId).populate("user")
        if(!booking){
            return NextResponse.json(
                {message: "Booking not found"},
                {status: 404}
            )
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiryTime = new Date(Date.now() + 5*60*1000);

        booking.dropOtp = otp;
        booking.dropOtpExpires = expiryTime;

        await booking.save()

        if(booking.user.email){
            await sendMail({
                to: booking.user.email,
                subject: `Drop OTP for Ride ${booking._id}`,
                html: `
                <div style="font-family:sans-serif; padding:20px">
                    <h2>Ride OTP</h2>
                    <p>Your drop OTP is:</p>
                    <h1 style="letter-spacing:6px">${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>Share this OTP with your driver only when they arrive at the drop location.</p>
                    <br>
                    <p>Thank you!</p>
                    <b>RYDEX</b>
                </div>
                `
            })
        }

        return NextResponse.json(
            {message: "Drop OTP sent to user"},
            {status: 200}
        )

    } catch (error) {
        return NextResponse.json(
            {message: "Failed to send drop OTP", error},
            {status: 500}
        )
    }
}