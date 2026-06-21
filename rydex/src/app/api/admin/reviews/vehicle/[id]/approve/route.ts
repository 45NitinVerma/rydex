import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
        context: {params: Promise<{id: string}>}
){
    try {
        const session = await auth();
        if(!session || !session.user?.email || session.user.role!=="admin"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        await connectDB();
        const vehicleId = (await context.params).id;
        const vehicle = await Vehicle.findById(vehicleId).populate("owner");

        if(!vehicle){
            return NextResponse.json(
                {message: "Vehicle not found"},
                {status: 404}
            )
        }

        vehicle.status = "approved";
        vehicle.rejectionReason = undefined;

        await vehicle.save();

        const partner = await User.findById(vehicle.owner);
        if(!partner){
            return Response.json(
                {message: "Partner not found"},
                {status: 400}
            )
        }
        partner.partnerOnboardingSteps = 7;

        await partner.save()

        return NextResponse.json(
            {message: "Vehicle approved successfully", vehicle},
            {status: 200}
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {message: "Vehicle Review Fetching Error" + error},
            {status: 500}
        )
    }
}