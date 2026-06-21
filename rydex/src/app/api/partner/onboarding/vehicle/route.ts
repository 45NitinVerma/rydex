import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;
export async function POST(req: Request) {
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

		const { type, number, vehicleModel } = await req.json();
		if (!type || !number || !vehicleModel) {
			return Response.json(
				{ message: "Missing required details" },
				{ status: 400 },
			);
		}

		if (!VEHICLE_REGEX.test(number)) {
			return Response.json(
				{ message: "Invalid vehicle number" },
				{ status: 400 },
			);
		}

		const vehicleNumber = number.toUpperCase();

		const existingVehicle = await Vehicle.findOne({ owner: user._id });
		if (existingVehicle) {
			existingVehicle.type = type;
			existingVehicle.number = vehicleNumber;
			existingVehicle.vehicleModel = vehicleModel;
			existingVehicle.status = "pending";
			if(user.partnerOnboardingSteps < 2){
				user.partnerOnboardingSteps = 2;
				user.partnerStatus = "pending"
				await user.save()
			}else{
				user.partnerOnboardingSteps = 3;
				user.partnerStatus = "pending"
				await user.save()
			}
			await existingVehicle.save();

			return Response.json(
				{
					vehicle: existingVehicle,
					message: "Vehicle updated successfully",
				},
				{ status: 200 },
			);
		}

		const duplicate = await Vehicle.findOne({ number: vehicleNumber });
		if (duplicate) {
			return Response.json(
				{ message: "Vehicle already exists" },
				{ status: 400 },
			);
		}

		const vehicle = await Vehicle.create({
			owner: user._id,
			type,
			number: vehicleNumber,
			vehicleModel,
			status: "pending",
			isActive: true,
		});

		if (user.partnerOnboardingSteps < 1) {
			user.partnerOnboardingSteps = 1;
		}
       
		user.role = "partner";
		user.partnerStatus = "pending"
		await user.save();
		return Response.json(
			{ vehicle, message: "Vehicle created successfully" },
			{ status: 201 },
		);
	} catch (error) {
		return Response.json(
			{ message: "Internal Server Error" },
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

		const vehicle = await Vehicle.findOne({ owner: user._id });
		if (!vehicle) {
			return Response.json(
				{ message: "Vehicle not found" },
				{ status: 404 },
			);
		}

		return Response.json(vehicle, { status: 200 });
	} catch (error) {
		return Response.json(
			{ message: "Failed to fetch vehicle" },
			{ status: 500 },
		);
	}
}
