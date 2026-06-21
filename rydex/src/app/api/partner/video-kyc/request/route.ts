import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function GET(){
    try {
        await connectDB();
		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		const partner = await User.findOne({ email: session.user.email });
		if (!partner) {
			return Response.json(
				{ message: "Partner not found" },
				{ status: 404 },
			);
		}

        if(partner.videoKycStatus!=="rejected"){
            return Response.json(
                {message: "You cannot send kyc request at this time"},
                {status: 400}
            )
        }

        partner.videoKycStatus = "pending"
        partner.videoKycRejectionReason = undefined
        partner.videoKycRoomId = undefined

        await partner.save();

        return Response.json(
            {status: "success"},
            {status: 200}
        )
    } catch (error) {
        console.log("Error in sending KYC request:",error);
		return Response.json(
			{ message: "KYC request error",error },
			{ status: 500 },
		);
    }
}