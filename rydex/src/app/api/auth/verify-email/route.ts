import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {email, otp} = await req.json();
        await connectDB();
        
        if(!email && !otp){
            return NextResponse.json({
                message: "Email and OTP is required"
            }, {status: 400})
        }

        const user = await User.findOne({email})
        if(!user){
            return NextResponse.json(
                {message: "User not found"},
                {status: 404}
            )
        }

        if(user.isEmailVerified){
            return NextResponse.json(
                {message: "Email already verified"},
                {status: 400}
            )
        }

        if(!user.otpExpiry || user.otpExpiry < Date.now()){
            return NextResponse.json(
                {message: "OTP has expired"},
                {status: 400}
            )
        }

        if(!user.otp || user.otp !== otp){
            return NextResponse.json(
                {message: "Invalid OTP"},
                {status: 400}
            )
        }

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return NextResponse.json(
            {message: "Email verified successfully"},
            {status: 200}
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {message: `verify email error ${error}`},
            {status: 500}
        )
    }
}