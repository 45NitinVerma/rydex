import connectDB from "@/lib/db";
import { auth } from "@/auth";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";

export async function GET(req: NextRequest) {
	try {
		await connectDB();
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ booking: null });
		}

		const user = await User.findOne({ email: session.user.email });

		const booking = await Booking.findOne({
			user: user._id,
			bookingStatus: {
				$in: ["requested", "awaiting_payment", "confirmed", "started"],
			},
		});

        if(!booking){
            return NextResponse.json({
                booking: "idle"
            })
        }

		return NextResponse.json(
			{
				booking,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "Get active booking error", error },
			{ status: 500 },
		);
	}
}
