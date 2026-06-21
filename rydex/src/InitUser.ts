"use client";
import React, { useEffect } from "react";
import useGetMe from "./hooks/useGetMe";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSocket } from "@/lib/socket";

function InitUser() {
	const { status } = useSession();
	useGetMe(status == "authenticated");

	const { userData } = useSelector((state: RootState) => state.user);

	useEffect(() => {
		if (!userData?._id) return;
		const socket = getSocket();
		
		// Register identity on mount/user change
		socket.emit("identity", userData._id);

		// Re-register identity on reconnection
		const handleConnect = () => {
			socket.emit("identity", userData._id);
		};
		socket.on("connect", handleConnect);

		return () => {
			socket.off("connect", handleConnect);
		};
	}, [userData?._id]);

	return null;
}

export default InitUser;
