import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import axios from "axios";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        await connectDB()
        const session = await auth()
        if(!session?.user?.id){
            return NextResponse.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

        const {driverId, vehicleId, pickUpAddress, dropAddress, pickUpLocation, dropLocation, fare, mobileNumber} = await req.json()

        if(!driverId || !vehicleId || !pickUpLocation.coordinates || !dropLocation.coordinates || !fare || !mobileNumber){
            return NextResponse.json(
                {message: "All fields are required"},
                {status: 400}
            )
        }

        const user = await User.findOne({email: session.user.email})
        const driver = await User.findById(driverId)
        if(!driver){
            return NextResponse.json(
                {message: "Driver not found"},
                {status: 404}
            )
        }
        
        const existing = await Booking.findOne({
            user: user._id,
            status: {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            }
        })

        if(existing){
            return NextResponse.json(
                {message: "You already have an active booking"},
                {status: 400}
            )
        }
        
        const booking = await Booking.create({
            user: user._id,
            driver,
            vehicle: vehicleId,
            pickUpAddress,
            dropAddress,
            pickUpLocation,
            dropLocation,
            fare,
            userMobileNumber: mobileNumber,
            driverMobileNumber: driver.mobileNumber,
            bookingStatus: "requested"
        })

        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "new-booking",
            userId: driverId,
            data: booking
        })

        return NextResponse.json({
            message: "Booking created successfully",
            booking
        }, {status: 201})
        
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {message: "Booking error", error},
            {status: 500}
        )
    }
}