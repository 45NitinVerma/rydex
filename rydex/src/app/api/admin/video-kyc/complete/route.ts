import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	try {
		connectDB();
		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "admin") {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { roomId, action, reason } = await req.json();
		if (!roomId) {
			return Response.json(
				{ message: "Room Id is required" },
				{ status: 400 },
			);
		}

		if (!["approved", "rejected"].includes(action)) {
			return Response.json(
				{ message: "Invalid Action" },
				{ status: 400 },
			);
		}

		const partner = await User.findOneAndUpdate({
			videoKycRoomId: roomId,
			role: "partner",
		});

        if(action=="approved"){
            partner.videoKycStatus = "approved";
            partner.videoKycRejectionReason = undefined;
            partner.partnerOnboardingSteps = 5;
        }
        
        if(action=="rejected"){
            if(!reason){
                return Response.json({message: "Reason is required"}, {status: 400});
            }
            partner.videoKycStatus = "rejected";
            partner.videoKycRejectionReason = reason.trim();
        }

        await partner.save()
        return Response.json({
            message: "Action performed successfully",
            status: partner.videoKycStatus
        }, {status: 200})
	} catch (error) {
        return Response.json({
            message: "KYC complete error: "+error,
        }, {status: 500})
    }
}
