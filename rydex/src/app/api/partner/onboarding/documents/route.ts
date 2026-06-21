import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

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

		const formData = await req.formData();
		const aadhar = formData.get("aadhar") as Blob | null;
		const license = formData.get("license") as Blob | null;
		const rc = formData.get("rc") as Blob | null;

		if (!aadhar || !license || !rc) {
			return Response.json(
				{ message: "Missing required documents" },
				{ status: 400 },
			);
		}

		const updatePayload: any = {
			status: "pending",
		};

		if (aadhar) {
			if(aadhar instanceof File){
				const url = await uploadOnCloudinary(aadhar);
				if (!url) {
					return Response.json(
						{ message: "Failed to upload Aadhar" },
						{ status: 500 },
					);
				}
				updatePayload.aadharUrl = url;
			}else if(typeof aadhar === "string"){
				updatePayload.aadharUrl = aadhar;
			}else{
				return Response.json(
					{ message: "Invalid Aadhar" },
					{ status: 400 },
				);
			}
		}

		if (license) {
			if(license instanceof File){
				const url = await uploadOnCloudinary(license);
				if (!url) {
					return Response.json(
						{ message: "Failed to upload License" },
						{ status: 500 },
					);
				}
				updatePayload.licenseUrl = url;
			}else if(typeof license === "string"){
				updatePayload.licenseUrl = license;
			}else{
				return Response.json(
					{ message: "Invalid License" },
					{ status: 400 },
				);
			}
		}

		if (rc) {
			if(rc instanceof File){
				const url = await uploadOnCloudinary(rc);
				if (!url) {
					return Response.json(
						{ message: "Failed to upload RC" },
						{ status: 500 },
					);
				}
				updatePayload.rcUrl = url;
			}else if(typeof rc === "string"){
				updatePayload.rcUrl = rc;
			}else{
				return Response.json(
					{ message: "Invalid RC" },
					{ status: 400 },
				);
			}
		}

		const partnerDocs = await PartnerDocs.findOneAndUpdate(
			{ owner: user._id },
			{ $set: updatePayload },
			{ upsert: true, new: true },
		);

		if (user.partnerOnboardingSteps < 2) {
			user.partnerOnboardingSteps = 2;
		}else{
			user.partnerOnboardingSteps = 3;
		}

		user.partnerStatus = "pending"

		await user.save();

		return Response.json(
			{ partnerDocs, message: "Documents uploaded successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return Response.json(
			{ message: "Failed to upload documents" },
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

		const partnerDocs = await PartnerDocs.findOne({ owner: user._id });
		if (!partnerDocs) {
			return Response.json(
				{ message: "Partner documents not found" },
				{ status: 404 },
			);
		}

		return Response.json({ partnerDocs }, { status: 200 });
	} catch (error) {
		return Response.json(
			{ message: "Failed to fetch partner documents" },
			{ status: 500 },
		);
	}
}
