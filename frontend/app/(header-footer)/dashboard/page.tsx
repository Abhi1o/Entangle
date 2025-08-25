"use client";

import React, { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DivTable from "@/components/shared/div-table";
import EventPostingModal from "@/components/shared/event-posting-modal";
import TitleHeading from "@/components/shared/TextHeading";

const upcommingTableProps = {
	columns: ["Event Name", "Date", "Time", "Buyer", "Price (in USD)"],
	rows: [
		["Awesome event 1", "01 Jan 2023", "20:00", "Outlook, Jerry", "$399"],
		["Awesome event 2", "02 Feb 2023", "18:30", "Gmail, Anna", "$499"],
	],
};

export default function Dashboard() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<main className="container mx-auto p-4 md:p-6">
			<Tabs defaultValue="host" className="mb-6">
				<TabsList className="bg-transparent p-0 h-auto rounded-md-med border-2 border-primary">
					<TabsTrigger
						value="host"
						className="text-lblm text-primary px-8 py-2 rounded-r-none rounded-l-md-med border-2 border-primary data-[state=active]:bg-primary data-[state=active]:text-black">
						Host
					</TabsTrigger>
					<TabsTrigger
						value="attendee"
						className="text-lblm text-primary px-8 py-2 rounded-l-none rounded-r-md-med border-2 border-primary data-[state=active]:bg-primary data-[state=active]:text-black">
						Attendee
					</TabsTrigger>
				</TabsList>
				<TabsContent value="host" className="mt-6">
					<div className="flex flex-col space-y-8">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<TitleHeading title="Host Dashboard" className="sm:text-h1" />
							<div className="flex flex-col sm:flex-row gap-2">
								<Button
									variant="outline"
									size="sm"
									className="rounded-md-med text-lblm border-action-primary bg-transparent text-action-primary px-4">
									Copy invite code
									<Copy className="h-4 w-4 mr-2" />
								</Button>
								<Button
									onClick={() => setIsModalOpen(true)}
									size="sm"
									className="rounded-md-med px-4">
									<Plus className="h-4 w-4 mr-2" />
									Create a new event
								</Button>
							</div>
						</div>

						{/* My Upcoming Events */}
						<section>
							<TitleHeading title="My Upcoming Events" className="sm:text-h2 mb-4" />
							<div className="overflow-x-auto">
								<DivTable
									columns={upcommingTableProps.columns}
									rows={upcommingTableProps.rows}
									onRowClick={() => null}
								/>
							</div>
						</section>

						{/* Events In Auction */}
						<section>
							<TitleHeading title="Events In Auction" className="sm:text-h2 mb-4" />
							<DivTable
								columns={["Event Name", "URL", "Date", "Time", "Buyer", "Price (in USD)"]}
								rows={[
									[
										"Awesome event 1",
										"huehuehue/1",
										"01 January 2023",
										"20:00",
										"Outlook, Jerry",
										"$399"
									],
									[
										"Awesome event 2",
										"huehuehue/2",
										"01 January 2023",
										"20:00",
										"Outlook, Jerry",
										"$399"
									]
								]}
								showActions={true}
								actionButtons={[
									{
										label: "Cancel event",
										onClick: (row) => console.log("Cancel event", row),
										className: "text-red-500 hover:text-red-400 bg-transparent"
									}
								]}
								hoverColor="hover:bg-surface-level1"
							/>
						</section>

						{/* Past Events */}
						<section>
							<TitleHeading title="Past Events" className="sm:text-h2 mb-4" />
							<div className="overflow-x-auto">
								<DivTable
									columns={["Event Name", "Date", "Time", "Current Bid (in USD)", "Status"]}
									rows={[
										[
											"Awesome event 1", 
											"01 January 2023", 
											"20:00", 
											"$399", 
											{ content: <span className="text-green-500">Confirmed</span> }
										],
										[
											"Awesome event 2", 
											"01 January 2023", 
											"20:00", 
											"$399", 
											{ content: <span className="text-green-500">Confirmed</span> }
										],
										[
											"Awesome event 1", 
											"01 January 2023", 
											"20:00", 
											"$399", 
											{ content: <span className="text-green-500">Confirmed</span> }
										],
										[
											"Awesome event 2", 
											"01 January 2023", 
											"20:00", 
											"$399", 
											{ content: <span className="text-green-500">Confirmed</span> }
										]
									]}
									onRowClick={() => null}
								/>
							</div>
						</section>
					</div>
				</TabsContent>
				<TabsContent value="attendee" className="mt-6">
					<div className="flex flex-col space-y-8">
						<h1 className="text-h1 font-[700] text-medium-emphasis opacity-60">
							Attendee Dashboard
						</h1>

						{/* My Upcoming Events */}
						<section>
							<h2 className="text-h2 font-[700] text-medium-emphasis opacity-60 mb-4">
								My Bids
							</h2>
							<div className="overflow-x-auto">
								<DivTable
									columns={upcommingTableProps.columns}
									rows={upcommingTableProps.rows}
									onRowClick={() => null}
								/>
							</div>
						</section>

						{/* My Upcoming Events */}
						<section>
							<h2 className="text-h2 font-[700] text-medium-emphasis opacity-60 mb-4">
								Past events
							</h2>
							<div className="overflow-x-auto">
								<DivTable
									columns={upcommingTableProps.columns}
									rows={upcommingTableProps.rows}
									onRowClick={() => null}
								/>
							</div>
						</section>
					</div>
				</TabsContent>
			</Tabs>
			<EventPostingModal
				isModalOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</main>
	);
}
