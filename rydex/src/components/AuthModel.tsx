"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircleDashed, Lock, Mail, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";

type AuthModelProps = {
	open: boolean;
	onClose: () => void;
};

type stepType = "login" | "signup" | "otp";

const AuthModel = ({ open, onClose }: AuthModelProps) => {
	const [step, setStep] = useState<stepType>("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");
	const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

	const session = useSession(); // data will be null if user is not logged in and will have user data if user is logged in

	const handleSignUp = async () => {
		setLoading(true);
		try {
			const { data } = await axios.post("/api/auth/register", {
				name,
				email,
				password,
			});
			setErr("")
			setStep("otp")
			setLoading(false);
		} catch (error: any) {
			setErr(error.response.data.message || "Something went wrong");
			setLoading(false);
		}
	};

	const handleVerifyEmail = async () => {
		setLoading(true);
		try {
			const { data } = await axios.post("/api/auth/verify-email", {
				email,
				otp: otp.join(""),
			});
			console.log(data);
			setOtp(["", "", "", "", "", ""])
			setErr("")
			setStep("login")
			setLoading(false);
		} catch (error: any) {
			setErr(error.response.data.message || "Something went wrong");
			setLoading(false);
		}
	}

	const handleLogin = async () => {
		setLoading(true);
		const res = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});
		setLoading(false);
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		const res = await signIn("google");
		setLoading(false);
	};

	const handleOtpChange = (index: number, value: string) => {
		if (!/^[0-9]?$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value && index < otp.length - 1) {
			document.getElementById(`otp-${index + 1}`)?.focus();
		}

		if (!value && index > 0) {
			document.getElementById(`otp-${index - 1}`)?.focus();
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 40 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 40 }}
							transition={{ duration: 0.35, ease: "easeOut" }}
							className="fixed inset-0 z-[100] flex items-center justify-center px-4"
						>
							<div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black">
								<div
									className="absolute right-4 top-4 text-gray-500 hover:text-black transition"
									onClick={onClose}
								>
									<X size={20} />
								</div>
								<div className="mb-6 text-center">
									<h1 className="text-3xl font-extrabold tracking-widest">
										RYDEX
									</h1>
									<p className="mt-1 text-xs text-gray-500">
										Premium Vehicle Booking
									</p>
								</div>

								{/* Google Login */}
								<button
									onClick={handleGoogleLogin}
									className="w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition"
								>
									<Image
										src={"/google.png"}
										alt="Google"
										width={20}
										height={20}
									/>
									Continue with Google
								</button>

								{/* Divider */}
								<div className="my-6 flex items-center gap-4">
									<div className="flex-1 h-px bg-black/10"></div>
									<span className="text-xs text-gray-500">
										OR
									</span>
									<div className="flex-1 h-px bg-black/10"></div>
								</div>

								<div className="text-center">
									{step === "login" && (
										<motion.div
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
										>
											<h1 className="text-xl font-semibold">
												Welcome back
											</h1>
											<div className="mt-5 space-y-4">
												<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
													<Mail
														size={18}
														className="text-gray-500"
													/>
													<input
														type="email"
														placeholder="Email"
														value={email}
														onChange={(e) =>
															setEmail(
																e.target.value,
															)
														}
														className="w-full bg-transparent outline-none text-sm"
													/>
												</div>
												<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
													<Lock
														size={18}
														className="text-gray-500"
													/>
													<input
														type="password"
														placeholder="Password"
														value={password}
														onChange={(e) =>
															setPassword(
																e.target.value,
															)
														}
														className="w-full bg-transparent outline-none text-sm"
													/>
												</div>

												<button
													onClick={handleLogin}
													className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center"
												>
													{loading ? (
														<CircleDashed
															size={18}
															color="white"
															className="animate-spin"
														/>
													) : (
														"Login"
													)}
												</button>
											</div>

											<p className="mt-6 text-center text-sm text-gray-500">
												Don't have an account
											</p>
											<button
												onClick={() =>
													setStep("signup")
												}
												className="text-black font-medium hover:underline"
											>
												Sign Up
											</button>
										</motion.div>
									)}

									{step === "signup" && (
										<motion.div
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
										>
											<h1 className="text-xl font-semibold">
												Create Account
											</h1>
											<div className="mt-5 space-y-4">
												<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
													<Mail
														size={18}
														className="text-gray-500"
													/>
													<input
														type="text"
														placeholder="Name"
														value={name}
														onChange={(e) =>
															setName(
																e.target.value,
															)
														}
														className="w-full bg-transparent outline-none text-sm"
													/>
												</div>
												<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
													<Mail
														size={18}
														className="text-gray-500"
													/>
													<input
														type="email"
														placeholder="Email"
														value={email}
														onChange={(e) =>
															setEmail(
																e.target.value,
															)
														}
														className="w-full bg-transparent outline-none text-sm"
													/>
												</div>
												<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
													<Lock
														size={18}
														className="text-gray-500"
													/>
													<input
														type="password"
														placeholder="Password"
														value={password}
														onChange={(e) =>
															setPassword(
																e.target.value,
															)
														}
														className="w-full bg-transparent outline-none text-sm"
													/>
												</div>

												<button
													disabled={loading}
													onClick={handleSignUp}
													className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center"
												>
													{loading ? (
														<CircleDashed
															size={18}
															color="white"
															className="animate-spin"
														/>
													) : (
														"Send OTP"
													)}
												</button>
												{err && (
													<p className="text-red-500 text-sm">
														{err}
													</p>
												)}
											</div>

											<p className="mt-6 text-center text-sm text-gray-500">
												Already have an account
											</p>
											<button
												onClick={() => setStep("login")}
												className="text-black font-medium hover:underline"
											>
												Login
											</button>
										</motion.div>
									)}

									{step === "otp" && (
										<motion.div
											key="otp"
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{
												duration: 0.35,
												ease: "easeOut",
											}}
										>
											<h2 className="text-xl font-semibold">
												Verify OTP
											</h2>

											<div className="mt-6 flex justify-between gap-2">
												{otp.map((digit, index) => (
													<input
														key={index}
														id={`otp-${index}`}
														maxLength={1}
														value={digit}
														onChange={(e) =>
															handleOtpChange(
																index,
																e.target.value,
															)
														}
														className="w-10 h-12 sm:w-12 text-center text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none"
													/>
												))}
											</div>

											<button onClick={handleVerifyEmail} className="mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition">
												{loading ? (
														<CircleDashed
															size={18}
															color="white"
															className="animate-spin"
														/>
													) : (
														"Verify and Create Account"
													)}
											</button>
											{err && (
													<p className="text-red-500 text-sm">
														{err}
													</p>
												)}
										</motion.div>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default AuthModel;
