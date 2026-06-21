import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectDB()
        const session = await auth()
        const driver = await User.findOne({email: session?.user?.email})

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const bookings = await Booking.find({
            driver: driver?._id,
            paymentStatus: "paid",
            createdAt: {$gte: sevenDaysAgo},
        }).select("partnerAmount createdAt")

        let earningMap: Record<string, number> = {}
        bookings.forEach(b => {
            const date = new Date(b.createdAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
            })

            if(!earningMap[date]){
                earningMap[date] = 0;
            }
            earningMap[date] += b.partnerAmount || 0
        })

        const earnings = Object.entries(earningMap).map(([date, earnings]) => {
            return { date, earnings }
        })

        return NextResponse.json({
            earnings
        }, {status: 200})
        
    } catch (error) {
        return NextResponse.json(
            {message: "Partner Earning Error", error},
            {status: 500}
        )       
    }
}