import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function GET(){
    try {
        connectDB()
        const session = await auth();
        if(!session || !session.user?.email || session.user.role!=="admin"){
            return Response.json({message: "Unauthorized"}, {status: 401});
        }

        const partner = await User.find({
            role: "partner",
            partnerOnboardingSteps: 4,
            videoKycStatus: {$in: ["pending", "in_progress"]}
        })
        return Response.json({
            message: "Pending video kyc partners fetched successfully",
            partner
        }, {status: 200})
        
    } catch (error) {
        return Response.json({
            message: "Internal server error: "+error,
        }, {status: 500})
        
    }
}