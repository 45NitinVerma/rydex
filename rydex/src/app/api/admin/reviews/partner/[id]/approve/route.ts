import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: {params: Promise<{id: string}>}
){
    try {
        const session = await auth();
        if(!session || !session.user?.email || session.user.role !== "admin"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        await connectDB();
        const partnerId = (await context.params).id;
        const partner = await User.findById(partnerId);
        if(!partner || partner.role !== "partner"){
            return NextResponse.json(
                {message: "Partner not found"},
                {status: 404}
            )
        }
        
        if(partner.partnerStatus==='approved'){
            return NextResponse.json(
                {message: "Partner already approved"},
                {status: 400}
            )
        }

        const partnerDocs = await PartnerDocs.findOne({owner: partner._id})
        const partnerBank = await PartnerBank.findOne({owner: partner._id})

        if(!partnerDocs || !partnerBank){
            return NextResponse.json(
                {message: "Partner documents or bank details not found"},
                {status: 404}
            )
        }

        partner.partnerStatus = "approved";
        partner.videoKycStatus = "pending";
        partner.partnerOnboardingSteps = 4;
        partnerDocs.status = "approved";
        partnerBank.status = "verified";
        await partner.save();
        await partnerDocs.save();
        await partnerBank.save();

        return NextResponse.json(
            {message: "Partner approved successfully"},
            {status: 200}
        )
                
    } catch (error) {
        return NextResponse.json(
            {message: "Internal Server Error", error},
            {status: 500}
        )
    }
}