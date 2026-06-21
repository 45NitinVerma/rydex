import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const bookingId = (await context.params).id;
		await connectDB();
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "Booking not found" },
				{ status: 404 },
			);
		}

		booking.bookingStatus = "confirmed";
		booking.paymentStatus = "cash";
		await booking.save();

		return NextResponse.json(
			{
				success: true,
				message: "Booking confirmed successfully",
			},
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, message: "Error confirming booking." },
			{ status: 500 },
		);
	}
}