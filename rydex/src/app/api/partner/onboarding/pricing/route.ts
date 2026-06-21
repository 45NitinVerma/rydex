import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
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

        const vehicle = await Vehicle.findOne({owner: partner._id})
        if(!vehicle){
            return Response.json({message: "Vehicle not found"}, {status: 404})
        }

        const formData = await req.formData();
        const image = formData.get("image") as File | null;
        const baseFare = formData.get("baseFare") as string;
        const pricePerKM = formData.get("pricePerKM") as string;
        const waitingCharge = formData.get("waitingCharge") as string;

        const hasImage = (image && image.size > 0) || vehicle.imageUrl;
        if(!hasImage || !baseFare || !pricePerKM || !waitingCharge){
            return Response.json({message: "All fields are required"}, {status: 400})
        }

        let updated = false;
        if(image && image.size>0){
            const imageUrl = await uploadOnCloudinary(image);
            vehicle.imageUrl = imageUrl;
            updated = true;
        }

        if(baseFare!==null){
            vehicle.baseFare = Number(baseFare);
            updated = true;
        }

        if(pricePerKM!==null){
            vehicle.pricePerKM = Number(pricePerKM);
            updated = true;
        }

        if(waitingCharge!==null){
            vehicle.waitingCharge = Number(waitingCharge);
            updated = true;
        }
        
        if(!updated){
            return Response.json({message: "No updates to save"}, {status: 400})
        }

        vehicle.status = "pending"
        vehicle.rejectionReason = undefined;
        partner.partnerOnboardingSteps = 6;

        await partner.save();
        await vehicle.save();
        
        return Response.json({message: "Vehicle updated successfully"}, {status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({message: "pricing error", error}, {status: 500})
    }
}

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

        const vehicle = await Vehicle.findOne({owner: partner._id})
        if(!vehicle){
            return Response.json({message: "Vehicle not found"}, {status: 404})
        }

        return Response.json({vehicle}, {status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({message: "pricing error", error}, {status: 500})
    }
}