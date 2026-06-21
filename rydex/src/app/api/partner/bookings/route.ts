import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		await connectDB();
		const session = await auth();
		if (!session || !session.user?.email) {
			return NextResponse.json(
				{ message: "Unauthorised" },
				{ status: 401 },
			);
		}

        const driver = await User.findOne({email: session.user.email})
		const bookings = await Booking.find({ driver: driver._id})
			.populate("user driver vehicle")
			.sort({ createdAt: -1 });

		return NextResponse.json(bookings, { status: 200 });
	} catch (error:any) {
		return NextResponse.json(
			{ message: "Error getting bookings ", error: error.message},
			{ status: 500 },
		);
	}
}
