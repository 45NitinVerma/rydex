import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank";
import PartnerDocs from "@/models/partnerDocs.model";
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
        const partnerId = (await context.params).id;
        const partner = await User.findById(partnerId)

        if(!partner || partner.role !== "partner"){
            return NextResponse.json(
                {message: "Partner not found"},
                {status: 404}
            )
        }

        const vehicle = await Vehicle.findOne({owner: partnerId})
        const documents = await PartnerDocs.findOne({owner: partnerId})
        const bank = await PartnerBank.findOne({owner: partnerId})

        return NextResponse.json(
            {
                partner,
                vehicle: vehicle || null,
                documents: documents || null,
                bank: bank || null
            },
            {status: 200}
        )
    } catch (error) {
        return Response.json(
            {message: "Internal Server Error", error},
            {status: 500}
        )
    }
}