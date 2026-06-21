import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: {params: Promise<{id: string}>}) {
    try {
        const id = (await context.params).id
        await connectDB()
        const booking = await Booking.findById(id)

        if(!booking || booking.bookingStatus !== "requested"){
            return NextResponse.json(
                {message: "Invalid booking."},
                {status: 404}
            )
        }

        booking.bookingStatus = "cancelled"
        await booking.save()

        return NextResponse.json(
            {message: "Booking cancelled successfully."},
            {status: 200}
        )
    } catch (error: any) {
        return NextResponse.json(
            {message: "Error cancelling booking."},
            {status: 500}
        )
    }
}