import connectDB from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDB()
        const {bookingId, otp} = await req.json()
        const booking = await Booking.findById(bookingId).populate("user")
        if(!booking){
            return NextResponse.json(
                {message: "Booking not found"},
                {status: 404}
            )
        }

        if(!booking.pickUpOtp){
            return NextResponse.json(
                {message: "Pickup OTP not generated"},
                {status: 404}
            )
        }

        if(booking.pickUpOtp !== otp){
            return NextResponse.json(
                {message: "Invalid Pickup OTP"},
                {status: 400}
            )
        }

        if(booking.pickUpOtpExpires < new Date()){
            return NextResponse.json(
                {message: "Pickup OTP expired"},
                {status: 400}
            )
        }

        booking.bookingStatus = "started"
        booking.pickUpOtp = ""
        booking.pickUpOtpExpires = undefined;
        await booking.save()

        return NextResponse.json(
            {message: "Pickup OTP verified successfully"},
            {status: 200}
        )

    } catch (error) {
        return NextResponse.json(
            {message: "Failed to verify pickup OTP", error},
            {status: 500}
        )
    }
}