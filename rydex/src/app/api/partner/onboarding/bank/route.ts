import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await connectDB();
		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json(
				{ message: "User not found" },
				{ status: 404 },
			);
		}

		const { accountHolder, accountNumber, upi, ifsc, mobileNumber } =
			await req.json();

		if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
			return Response.json(
				{ message: "Missing required details" },
				{ status: 400 },
			);
		}

		const bankDetails = await PartnerBank.findOneAndUpdate(
			{
				owner: user._id,
			},
			{
				accountHolder,
				accountNumber,
				upi,
				ifsc,
				status: "added",
				isActive: true,
			},
			{ upsert: true, new: true },
		);
		user.role = "partner";

		user.mobileNumber = mobileNumber;
		user.partnerOnboardingSteps = 3;
		user.partnerStatus = "pending"
		await user.save();
		return Response.json(
			{ bankDetails, message: "Bank details created successfully" },
			{ status: 201 },
		);
	} catch (error) {
		return Response.json(
			{ message: "Failed to create bank details" },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		await connectDB();
		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json(
				{ message: "User not found" },
				{ status: 404 },
			);
		}

		const bankDetails = await PartnerBank.findOne({ owner: user._id });
		if (!bankDetails) {
			return Response.json(
				{ message: "Bank details not found" },
				{ status: 404 },
			);
		}

		return Response.json(
			{ bankDetails, mobileNumber: user.mobileNumber },
			{ status: 200 },
		);
	} catch (error) {
		return Response.json(
			{ message: "Failed to fetch bank details" },
			{ status: 500 },
		);
	}
}
