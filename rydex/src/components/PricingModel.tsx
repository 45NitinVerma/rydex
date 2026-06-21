"use client";
import { IVehicle } from "@/models/vehicle.model";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImagePlus, IndianRupee } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Props = {
	open: boolean;
	onClose: () => void;
	data: IVehicle | null;
	onSuccess?: () => void;
};

function PricingModel({ open, onClose, data, onSuccess }: Props) {
	const [image, setImage] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [baseFare, setBaseFare] = useState<string>("");
	const [pricePerKM, setPricePerKM] = useState<string>("");
	const [waitingCharge, setWaitingCharge] = useState<string>("");

	useEffect(() => {
		if (data) {
			setPreview(data.imageUrl || null);
			setBaseFare(data.baseFare?.toString() || "");
			setPricePerKM(data.pricePerKM?.toString() || "");
			setWaitingCharge(data.waitingCharge?.toString() || "");
		}
	}, [data]);

	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async () => {
		try {
			const formData = new FormData();
			if (image) {
				formData.append("image", image);
			}
			formData.append("baseFare", baseFare);
			formData.append("pricePerKM", pricePerKM);
			formData.append("waitingCharge", waitingCharge);
			setLoading(true);

			const { data } = await axios.post(
				"/api/partner/onboarding/pricing",
				formData,
			);

			setLoading(false);
			if (onSuccess) onSuccess();
			router.refresh();
			onClose();
		} catch (error: any) {
			console.log(error.response.data.message ?? error);
			setLoading(false);
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
				>
					<motion.div
						initial={{ scale: 0.85 }}
						animate={{ scale: 1 }}
						className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
					>
						<div className="p-6 border-b">
							<h2 className="text-xl font-bold">
								Pricing and Vehicle Image
							</h2>
						</div>

						<div className="p-6 space-y-6">
							<label
								htmlFor="imageLabel"
								className="relative h-44 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer"
							>
								{!preview ? (
									<ImagePlus size={28} />
								) : (
									<img
										src={preview}
										className="absolute inset-0 w-full h-full object-cover rounded-2xl"
									/>
								)}

								<input
									type="file"
									accept="image/*"
									hidden
									id="imageLabel"
									onChange={(e) => {
										if (e.target.files?.[0]) {
											setImage(e.target.files[0]);
											setPreview(
												URL.createObjectURL(
													e.target.files[0],
												),
											);
										}
									}}
								/>
							</label>

							<div>
								<p className="text-sm font-semibold mb-1">
									Base Fare
								</p>
								<div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
									<IndianRupee size={18} />
									<input
										type="text"
										value={baseFare}
										onChange={(e) =>
											setBaseFare(e.target.value)
										}
										className="outline-none w-full"
										placeholder="Base fare"
									/>
								</div>
							</div>

							<div>
								<p className="text-sm font-semibold mb-1">
									Price per KM
								</p>
								<div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
									<IndianRupee size={18} />
									<input
										type="text"
										value={pricePerKM}
										onChange={(e) =>
											setPricePerKM(e.target.value)
										}
										className="outline-none w-full"
										placeholder="Price per KM"
									/>
								</div>
							</div>

							<div>
								<p className="text-sm font-semibold mb-1">
									Waiting Charge
								</p>
								<div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
									<IndianRupee size={18} />
									<input
										type="text"
										value={waitingCharge}
										onChange={(e) =>
											setWaitingCharge(e.target.value)
										}
										className="outline-none w-full"
										placeholder="Waiting charge"
									/>
								</div>
							</div>
						</div>

						<div className="p-6 border-t flex gap-3">
							<button
								className="flex-1 border rounded-xl py-2"
								onClick={onClose}
							>
								Cancel
							</button>
							<button
								className="flex-1 bg-black text-white rounded-xl py-2"
								onClick={handleSubmit}
								disabled={loading}
							>
								{loading ? "Saving..." : "Save"}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default PricingModel;
