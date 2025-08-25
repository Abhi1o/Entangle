import Container from "@/components/layout/container";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="min-h-screen bg-black text-gray-300 font-sans">
			<main>
				<Container>{children}</Container>
			</main>
		</div>
	);
};

export default DashboardLayout;
