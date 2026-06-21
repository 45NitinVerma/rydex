"use client";
import React, { useState } from "react";
import HeroSection from "./HeroSection";
import VehicleSlider from "./VehicleSlider";
import AuthModel from "./AuthModel";

const PublicHome = () => {
	const [authOpen, setAuthOpen] = useState(false);
	return (
		<>
			<HeroSection onAuthRequired={() => setAuthOpen(true)} />{" "}
			{/* when user is not logged in and clicks on book now button, open the auth model using onAuthRequired prop*/}
			<VehicleSlider />
			<AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />
		</>
	);
};

export default PublicHome;
