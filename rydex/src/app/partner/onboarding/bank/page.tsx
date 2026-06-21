"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	BadgeCheck,
	CheckCircle,
	CircleDashed,
	CreditCard,
	Landmark,
	Phone,
} from "lucide-react";
import axios from "axios";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function page() {
	const [accountNumber, setAccountNumber] = useState("");
	const [accountHolder, setAccountHolder] = useState("");
	const [ifsc, setIfsc] = useState("");
	const [mobileNumber, setMobileNumber] = useState("");
	const [upi, setUpi] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const sanitizedIFSC = ifsc.trim().toUpperCase();

	const isNameValid = accountHolder.trim().length >= 3;
	const isAccountValid = accountNumber.trim().length >= 9;
	const isIfscValid = IFSC_REGEX.test(sanitizedIFSC);
	const isMobileValid = mobileNumber.trim().length === 10;

	const canSubmit =
		isNameValid && isAccountValid && isIfscValid && isMobileValid;

	const handleBankDetails = async () => {
		setLoading(true);
		setError("");
		try {
			const { data } = await axios.post("/api/partner/onboarding/bank", {
				accountNumber,
				accountHolder,
				ifsc: sanitizedIFSC,
				mobileNumber,
				upi,
			});
			setLoading(false);
			window.location.href = "/"
		} catch (error: any) {
			setError(
				error?.response?.data?.message || "Failed to save bank details",
			);
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const handleGetBankDetails = async () => {
			try {
				const { data } = await axios.get("/api/partner/onboarding/bank");
				setAccountNumber(data.bankDetails.accountNumber);
				setAccountHolder(data.bankDetails.accountHolder);
				setIfsc(data.bankDetails.ifsc);
				setMobileNumber(data.mobileNumber);
				setUpi(data.bankDetails.upi);
			} catch (error) {
				console.log(error);
			}
		};
		handleGetBankDetails();
	}, []);

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 28 }}
				animate={{ opacity: 1, y: 0 }}
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
						Step 3 of 3
					</p>
					<h1 className="text-2xl font-bold mt-1">
						Bank & Payout Details
					</h1>
					<p className="text-sm text-gray-500 mt-2">
						Used for Partner Payouts
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<label
						htmlFor="ahn"
						className="text-xs font-semibold text-gray-500"
					>
						Account holder name
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<BadgeCheck />
						</div>
						<input
							type="text"
							id="ahn"
							placeholder="As per bank records"
							className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isNameValid && accountHolder.length>0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"} `}
							value={accountHolder}
							onChange={(e) => setAccountHolder(e.target.value)}
						/>
					</div>
					{!isNameValid && accountHolder.length > 0 && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mt-1 text-xs text-red-500"
						>
							Minimum 3 characters required
						</motion.p>
					)}
				</div>

				<div className="mt-8 space-y-6">
					<label
						htmlFor="ahn"
						className="text-xs font-semibold text-gray-500"
					>
						Bank Account Number
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<CreditCard />
						</div>
						<input
							type="text"
							id="ahn"
							placeholder="Enter account number"
							className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isAccountValid && accountNumber.length>0? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"} `}
							value={accountNumber}
							onChange={(e) => setAccountNumber(e.target.value)}
						/>
					</div>
					{!isAccountValid && accountNumber.length > 0 && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mt-1 text-xs text-red-500"
						>
							Account Number should be minimum 9 digits
						</motion.p>
					)}
				</div>

				<div className="mt-8 space-y-6">
					<label
						htmlFor="ahn"
						className="text-xs font-semibold text-gray-500"
					>
						IFSC Code
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<Landmark />
						</div>
						<input
							type="text"
							id="ahn"
							placeholder="HDFC0001234"
							className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isIfscValid && ifsc.length>0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"} `}
							value={ifsc.toUpperCase()}
							onChange={(e) => setIfsc(e.target.value)}
						/>
					</div>
					{!isIfscValid && ifsc.length>0 && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mt-1 text-xs text-red-500"
						>
							Invalid IFSC code
						</motion.p>
					)}
				</div>

				<div className="mt-8 space-y-6">
					<label
						htmlFor="ahn"
						className="text-xs font-semibold text-gray-500"
					>
						Mobile Number
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<Phone />
						</div>
						<input
							type="text"
							id="ahn"
							placeholder="Enter mobile number"
							className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isMobileValid && mobileNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"} `}
							value={mobileNumber}
							onChange={(e) => setMobileNumber(e.target.value)}
						/>
						{!isMobileValid && mobileNumber.length > 0 && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="mt-1 text-xs text-red-500"
							>
								Enter a valid 10-digit mobile number
							</motion.p>
						)}
					</div>
				</div>

				<div className="mt-8 space-y-6">
					<div>
						<label
							htmlFor="ahn"
							className="text-xs font-semibold text-gray-500"
						>
							UPI ID (optional)
						</label>
						<div className="flex items-center gap-2 mt-2">
							<input
								type="text"
								id="ahn"
								placeholder="Enter UPI ID"
								className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
								value={upi}
								onChange={(e) => setUpi(e.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
					<CheckCircle size={16} className="mt-0.5" />
					<p>
						Bank details are verified before first payout. This
						usually takes 24-48 hours.
					</p>
				</div>

				{error && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-red-500 text-sm">*{error}</motion.div>
				)}

				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.97 }}
					className="mt-8 w-full h-15 rounded-2xl bg-black text-white font-semibold disabled:opacity-40 transition flex items-center justify-center"
					onClick={handleBankDetails}
					disabled={!canSubmit || loading}
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
