import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    context: {params: Promise<{id: string}>}
){
    try {
        const session = await auth();
        if(!session || !session.user?.email || session.user.role !== "admin"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        await connectDB();
        const {rejectionReason} = await req.json();
        const partnerId = (await context.params).id;
        const partner = await User.findById(partnerId);
        if(!partner || partner.role !== "partner"){
            return NextResponse.json(
                {message: "Partner not found"},
                {status: 404}
            )
        }


        partner.partnerStatus = "rejected";
        partner.rejectionReason = rejectionReason;
        // partner.partnerOnboardingSteps = 4;
        await partner.save();

        return NextResponse.json(
            {message: "Partner rejected successfully"},
            {status: 200}
        )
                
    } catch (error) {
        return NextResponse.json(
            {message: "Internal Server Error", error},
            {status: 500}
        )
    }
}