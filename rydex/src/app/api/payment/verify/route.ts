import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";

export async function POST(req: NextRequest) {
	try {
		await connectDB();
		const {
			bookingId,
			razorpay_payment_id,
			razorpay_order_id,
			razorpay_signature,
		} = await req.json();
		const body = razorpay_order_id + "|" + razorpay_payment_id;

		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
			.update(body.toString())
			.digest("hex");

		if (razorpay_signature !== expectedSignature) {
			return NextResponse.json(
				{ success: false, message: "Payment verification failed" },
				{ status: 400 },
			);
		}

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "Booking not found" },
				{ status: 404 },
			);
		}

		booking.bookingStatus = "confirmed";
		booking.paymentStatus = "paid";
		booking.adminCommission = booking.fare * 0.1;
		booking.partnerAmount = booking.fare - booking.adminCommission;

		await booking.save();

		return NextResponse.json(
			{
				success: true,
				adminCommision: booking.adminCommission,
				partnerAmount: booking.partnerAmount,
				message: "Payment verified successfully",
			},
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to verify payment" },
			{ status: 500 },
		);
	}
}
