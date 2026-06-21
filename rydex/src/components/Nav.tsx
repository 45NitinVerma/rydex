"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthModel from "./AuthModel";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import { getSocket } from "@/lib/socket";


const Nav = () => {
	const [authOpen, setAuthOpen] = useState(false);
	const pathName = usePathname();
	const { userData } = useSelector((state: RootState) => state.user);
	
	const [profileOpen, setProfileOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [pendingCount, setPendingCount] = useState(0);
	const Nav_Items = userData?.role!="partner" ? ["Home", "Bookings", "About Us", "Contact"] : ["Home", "Pending Requests", "Bookings", "Active Ride"];

	const dispatch = useDispatch();
	const router = useRouter();

	const handleLogOut = async () => {
		await signOut({ redirect: false });
		dispatch(setUserData(null));
		setProfileOpen(false);
	};

	const fetchCount = async () => {
		try {
			const {data} = await axios.get("/api/partner/bookings/pending-request-count")
			setPendingCount(data)
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if(userData?.role === "partner"){
			fetchCount()
		}
	}, [userData?.role])

	useEffect(() =>{
			const socket = getSocket()
			socket.on("new-booking", (data) => {
				setPendingCount((prev) => prev + 1);
			})
	
			return ()=>{
				socket.off("new-booking");
			} 
		}, [])
	
	return (
		<>
			<motion.div
				initial={{ y: -60, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
			>
				<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
					{/* Logo */}
					<Image
						src={"/logo.jpeg"}
						alt="Rydex Logo"
						width={44}
						height={44}
						priority
					/>

					{/* Nav Items */}
					<div className="hidden md:flex items-center gap-10">
						{userData?.role === "partner" ? (
							<>
								<Link
									className="relative text-sm font-medium text-gray-300 hover:text-white transition"
									href={"/"}
								>
									Home
								</Link>
								<Link
									className="relative text-sm font-medium text-gray-300 hover:text-white transition"
									href={"/partner/pending-requests"}
								>
									Pending Requests
									<span className="absolute -top-2 -right-5 w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">{pendingCount ?? 0}</span>
								</Link>
								<Link
									className="relative text-sm font-medium text-gray-300 hover:text-white transition"
									href={"/partner/bookings"}
								>
									Bookings
								</Link>
								<Link
									className="relative text-sm font-medium text-gray-300 hover:text-white transition"
									href={"/partner/active-ride"}
								>
									Active Ride
								</Link>
							</>
						) : (
							Nav_Items.map((i, id) => {
								let href = "";
								if (i === "Home") {
									href = "/";
								} else {
									href = `/user/${i.toLowerCase()}`;
								}
								const active = href === pathName;
								return (
									<Link
										key={id}
										href={href}
										className={`text-sm font-medium transition ${
											active
												? "text-white"
												: "text-gray-400 hover:text-white"
										}`}
									>
										{i}
									</Link>
								);
							})
						)}
					</div>

					{/* Profile */}
					<div className="flex item-center gap-3 relative">
						<div className="hidden md:block relative">
							{!userData ? (
								<button
									onClick={() => setAuthOpen(true)}
									className="px-4 py-1.5 rounded-full bg-white text-black text-sm"
								>
									Login
								</button>
							) : (
								<>
									<button
										onClick={() =>
											setProfileOpen(!profileOpen)
										}
										className="w-11 h-11 rounded-full bg-white text-black font-bold"
									>
										{userData.name.charAt(0).toUpperCase()}
									</button>
									<AnimatePresence>
										{profileOpen && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												className="absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-xl border"
											>
												<div className="p-5">
													<p className="font-semibold text-lg">
														{userData.name}
													</p>
													<p className="text-xs uppercase text-gray-500 mb-4">
														{userData.role}
													</p>
													{userData.role !=
														"partner" && (
														<div
															onClick={() =>
																router.push(
																	"/partner/onboarding/vehicle",
																)
															}
															className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
														>
															<div className="flex -space-x-2">
																<div className="w-6 h-6 flex items-center justify-center bg-black rounded-full text-white">
																	<Bike
																		size={
																			16
																		}
																	/>
																</div>
																<div className="w-6 h-6 flex items-center justify-center bg-black rounded-full text-white">
																	<Car
																		size={
																			16
																		}
																	/>
																</div>
																<div className="w-6 h-6 flex items-center justify-center bg-black rounded-full text-white">
																	<Truck
																		size={
																			16
																		}
																	/>
																</div>
															</div>
															Become a partner
															<ChevronRight
																size={16}
																className="ml-auto"
															/>
														</div>
													)}

													<button
														onClick={handleLogOut}
														className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
													>
														<LogOut size={16} />
														Logout
													</button>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</>
							)}
						</div>

						{/* mobile view */}
						<div className="md:hidden">
							{!userData ? (
								<button
									onClick={() => setAuthOpen(true)}
									className="px-4 py-1.5 rounded-full bg-white text-black text-sm"
								>
									Login
								</button>
							) : (
								<>
									<button
										onClick={() =>
											setProfileOpen(!profileOpen)
										}
										className="w-11 h-11 rounded-full bg-white text-black font-bold"
									>
										{userData.name.charAt(0).toUpperCase()}
									</button>
								</>
							)}
						</div>

						<button
							className="md:hidden text-white"
							onClick={() => setMenuOpen(!menuOpen)}
						>
							{menuOpen ? <X size={26} /> : <Menu size={26} />}
						</button>
					</div>
				</div>
			</motion.div>

			<AnimatePresence>
				{menuOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.4 }}
							exit={{ opacity: 0 }}
							onClick={() => setMenuOpen(false)}
							className="fixed inset-0 bg-black z-30 md:hidden"
						/>

						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
							className="fixed top-[85px] left-1/2 -translate-x-1/2 w-[92%] bg-[#0b0b0b] rounded-2xl shadow-xl z-40 md:hidden overflow-hidden"
						>
							<div className="flex flex-col divide-y divide-white/10">
								<Link
									className="px-6 py-4 text-gray-300 hover:bg-white/5"
									href={"/"}
								>
									Home
								</Link>
								<Link
									className="flex items-center relative px-6 py-4 text-gray-300 hover:bg-white/5"
									href={"/partner/pending-requests"}
								>
									Pending Requests
									<span className="w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">{pendingCount ?? 0}</span>
								</Link>
								<Link
									className="px-6 py-4 text-gray-300 hover:bg-white/5"
									href={"/partner/bookings"}
								>
									Bookings
								</Link>
								<Link
									className="px-6 py-4 text-gray-300 hover:bg-white/5"
									href={"/partner/active-ride"}
								>
									Active Ride
								</Link>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{profileOpen && userData && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.4 }}
							exit={{ opacity: 0 }}
							onClick={() => setProfileOpen(false)}
							className="fixed inset-0 bg-black z-30 md:hidden"
						/>

						<motion.div
							initial={{ y: 400 }}
							animate={{ y: 0 }}
							exit={{ y: 400 }}
							transition={{ type: "spring", damping: 25 }}
							className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
						>
							<div className="p-5">
								<p className="font-semibold text-lg">
									{userData.name}
								</p>
								<p className="text-xs uppercase text-gray-500 mb-4">
									{userData.role}
								</p>
								{userData.role != "partner" && (
									<div
										onClick={() =>
											router.push(
												"/partner/onboarding/vehicle",
											)
										}
										className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
									>
										<div className="flex -space-x-2">
											<div className="w-6 h-6 flex items-center justify-center bg-black rounded-full text-white">
												<Bike size={16} />
											</div>
											<div className="w-6 h-6 flex items-center justify-center bg-black rounded-full text-white">
												<Car size={16} />
											</div>
											<div className="w-6 h-6 flex items-center justify-center bg-black rounded-full text-white">
												<Truck size={16} />
											</div>
										</div>
										Become a partner
										<ChevronRight
											size={16}
											className="ml-auto"
										/>
									</div>
								)}

								<button
									onClick={handleLogOut}
									className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
								>
									<LogOut size={16} />
									Logout
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />
		</>
	);
};

export default Nav;
