import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDB()
        const {latitude, longitude, vehicleType} = await req.json()
        if(!latitude || !longitude){
            return NextResponse.json(
                {message: "Coordinates not found"},
                {status: 400}
            )
        }

        const partners = await User.find({
            role: "partner",
            isOnline: true,
            partnerStatus: "approved",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000 //10 kms
                }
            }
        })

        const partnerIds = partners.map(partner => partner._id)

        if(partnerIds.length==0){
            return NextResponse.json(
                {vehicles: []},
                {status: 404}
            )
        }
        
        const vehicles = await Vehicle.find({
            owner: {$in: partnerIds},
            type: vehicleType,
            status: "approved",
            isActive: true
        }).lean();

        return NextResponse.json(
            {
                message: "Vehicles found",
                vehicles
            },
            {status: 200}
        )

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {message: "Nearby vehicle errors", error},
            {status: 500}
        )
    }
}