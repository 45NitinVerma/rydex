import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		await connectDB();
		const session = await auth();
		if (
			!session ||
			!session?.user?.email ||
			session.user.role !== "admin"
		) {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		const totalPartners = await User.countDocuments({ role: "partner" });
		const totalApprovedPartners = await User.countDocuments({
			role: "partner",
			partnerStatus: "approved",
		});
		const totalPendingPartners = await User.countDocuments({
			role: "partner",
			partnerStatus: "pending",
		});
		const totalRejectedPartners = await User.countDocuments({
			role: "partner",
			partnerStatus: "rejected",
		});

		const pendingPartnerUsers = await User.find({
			role: "partner",
			partnerStatus: "pending",
			partnerOnboardingSteps: { $gte: 3 },
		});
		const partnerIds = pendingPartnerUsers.map((user) => user._id);
		const partnerVehicles = await Vehicle.find({
			owner: { $in: partnerIds },
		});
		const vehicleTypeMap = new Map(
			partnerVehicles.map((vehicle) => [
				String(vehicle.owner),
				vehicle.type,
			]),
		);

		const pendingPartnersReviews = pendingPartnerUsers.map((p) => ({
			_id: p._id,
			name: p.name,
			email: p.email,
			vehicleType: vehicleTypeMap.get(String(p._id)),
		}));

		const pendingVehicles = await Vehicle.find({
			status: "pending",
            baseFare: {$exists:true},
            pricePerKM:{$exists:true},
            
		}).populate("owner");

		return NextResponse.json(
			{
				pendingVehicles,
				stats: {
					totalPartners,
					totalApprovedPartners,
					totalPendingPartners,
					totalRejectedPartners,
				},
				pendingPartnersReviews,
			},
			{ status: 200 },
		);
	} catch (error) {
		// console.error('Error fetching admin dashboard data:', error);
		return NextResponse.json(
			{ message: "Internal Server Error" + error },
			{ status: 500 },
		);
	}
}
