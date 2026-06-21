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

        if(!booking.dropOtp){
            return NextResponse.json(
                {message: "Drop OTP not generated"},
                {status: 404}
            )
        }

        if(booking.dropOtp !== otp){
            return NextResponse.json(
                {message: "Invalid Drop OTP"},
                {status: 400}
            )
        }

        if(booking.dropOtpExpires < new Date()){
            return NextResponse.json(
                {message: "Drop OTP expired"},
                {status: 400}
            )
        }

        if(booking.paymentStatus === "cash"){
            booking.adminCommission = booking.fare*0.10;
            booking.partnerAmount = booking.fare - (booking.fare*0.10);
        }

        booking.paymentStatus = "paid"
        booking.bookingStatus = "completed"
        booking.dropOtp = ""
        booking.dropOtpExpires = undefined;
        await booking.save()

        return NextResponse.json(
            {message: "Drop OTP verified successfully"},
            {status: 200}
        )

    } catch (error) {
        return NextResponse.json(
            {message: "Failed to verify drop OTP", error},
            {status: 500}
        )
    }
}