"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleDashed, FileCheck, Upload } from "lucide-react";
import axios from "axios";

type docsType = "aadhar" | "license" | "rc";

function page() {
	const router = useRouter();
	const [docs, setDocs] = useState<Record<docsType, File | string | null>>({
		aadhar: null,
		license: null,
		rc: null,
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleImage = (doc: docsType, file: File | null) => {
		if (!file) return;
		setDocs((prev) => ({ ...prev, [doc]: file }));
	};

	const handleDocs = async () => {
		setLoading(true);
		setError("");
		try {
			const formData = new FormData();
			if (!docs.aadhar || !docs.license || !docs.rc) {
				setError("Please upload all documents");
				return;
			}
			formData.append("aadhar", docs.aadhar);
			formData.append("license", docs.license);
			formData.append("rc", docs.rc);
			const { data } = await axios.post(
				"/api/partner/onboarding/documents",
				formData,
			);
			router.push("/partner/onboarding/bank");
		} catch (error: any) {
			setError(
				error?.response?.data?.message || "Failed to upload documents",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const handleGetDocs = async () => {
			try {
				const { data } = await axios.get(
					"/api/partner/onboarding/documents",
				);
				// console.log(data);
				setDocs({
					aadhar: data?.partnerDocs?.aadharUrl,
					license: data?.partnerDocs?.licenseUrl,
					rc: data?.partnerDocs?.rcUrl,
				});
			} catch (error) {
				console.log(error);
			}
		};
		handleGetDocs();
	}, []);

	const isCompleted = docs.aadhar && docs.license && docs.rc;

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 28 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
			>
				<div className="relative text-center">
					<button
						className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
						onClick={() => router.back()}
					>
						<ArrowLeft size={18} />
					</button>
					<p className="text-xs text-gray-500 font-medium">
						Step 2 of 3
					</p>
					<h1 className="text-2xl font-bold mt-1">
						Upload Documents
					</h1>
					<p className="text-sm text-gray-500 mt-2">
						Required for verification
					</p>
				</div>

				<div className="mt-8 space-y-5">
					<motion.label
						whileHover={{ scale: 1.02 }}
						className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
					>
						<div>
							<p className="text-sm font-semibold">
								Aadhar / ID Proof
							</p>
							<p className="text-xs text-gray-500">
								Government issued ID
							</p>
						</div>
						<div>
							{docs.aadhar ? (
								<div className="flex items-center gap-2">
									<span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1.5 rounded-full border border-green-200">
										Uploaded
									</span>
									<span className="text-xs text-gray-500 font-medium bg-gray-50 hover:bg-gray-100 hover:text-black px-2.5 py-1.5 rounded-full border border-gray-200 transition">
										Reupload
									</span>
								</div>
							) : (
								<>
									<span className="text-xs text-gray-500">
										Upload
									</span>
									<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
										<Upload size={18} />
									</div>
								</>
							)}
						</div>

						<input
							type="file"
							hidden
							accept="image/*,.pdf"
							onChange={(e) =>
								handleImage(
									"aadhar",
									e.target?.files?.[0] || null,
								)
							}
						/>
					</motion.label>
					<motion.label
						whileHover={{ scale: 1.02 }}
						className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
					>
						<div>
							<p className="text-sm font-semibold">
								Driving Licence
							</p>
							<p className="text-xs text-gray-500">
								Valid Driving Licence
							</p>
						</div>
						<div>
							{docs.license ? (
								<div className="flex items-center gap-2">
									<span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1.5 rounded-full border border-green-200">
										Uploaded
									</span>
									<span className="text-xs text-gray-500 font-medium bg-gray-50 hover:bg-gray-100 hover:text-black px-2.5 py-1.5 rounded-full border border-gray-200 transition">
										Reupload
									</span>
								</div>
							) : (
								<>
									<span className="text-xs text-gray-500">
										Upload
									</span>
									<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
										<Upload size={18} />
									</div>
								</>
							)}
						</div>

						<input
							type="file"
							hidden
							accept="image/*,.pdf"
							onChange={(e) =>
								handleImage(
									"license",
									e.target?.files?.[0] || null,
								)
							}
						/>
					</motion.label>
					<motion.label
						whileHover={{ scale: 1.02 }}
						className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
					>
						<div>
							<p className="text-sm font-semibold">Vehicle RC</p>
							<p className="text-xs text-gray-500">
								Registration Certificate
							</p>
						</div>
						<div>
							{docs.rc ? (
								<div className="flex items-center gap-2">
									<span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1.5 rounded-full border border-green-200">
										Uploaded
									</span>
									<span className="text-xs text-gray-500 font-medium bg-gray-50 hover:bg-gray-100 hover:text-black px-2.5 py-1.5 rounded-full border border-gray-200 transition">
										Reupload
									</span>
								</div>
							) : (
								<>
									<span className="text-xs text-gray-500">
										Upload
									</span>
									<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
										<Upload size={18} />
									</div>
								</>
							)}
						</div>

						<input
							type="file"
							hidden
							accept="image/*,.pdf"
							onChange={(e) =>
								handleImage("rc", e.target?.files?.[0] || null)
							}
						/>
					</motion.label>
				</div>

				<div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
					<FileCheck size={16} className="mt-0.5" />
					<p>
						Documents are securely stored and manually verified by
						our team.
					</p>
				</div>

				{error && <p className="text-red-500 text-center">*{error}</p>}

				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.97 }}
					className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
					onClick={handleDocs}
					disabled={loading || !isCompleted}
				>
					{loading ? (
						<CircleDashed className="text-white animate-spin" />
					) : (
						"Continue"
					)}
				</motion.button>
			</motion.div>
		</div>
	);
}

export default page;
