"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect, FormSelectItem } from "@/components/ui/form-select";
import { FormField } from "@/components/ui/form-field";
import { FormButton } from "@/components/ui/form-button";
import TrendingCard from "../cards/trending-card";

type ModalStep =
	| "invite-code"
	| "create-event"
	| "connect-socials"
	| "preview"
	| "loading"
	| "error"
	| "closed";

interface EventData {
	inviteCode: string;
	eventName: string;
	sellerName: string;
	dateOfEvent: string;
	startTime: string;
	endTime: string;
	closingTime: string;
	floorPrice: string;
	customUrl: string;
	generatedLink: string;
}

export default function EventPostingModal({
	isModalOpen,
	onClose,
}: {
	isModalOpen: boolean;
	onClose: () => void;
}) {
	const [currentStep, setCurrentStep] = useState<ModalStep>("invite-code");
	const [stepNumber, setStepNumber] = useState(1);
	const [eventData, setEventData] = useState<EventData>({
		inviteCode: "",
		eventName: "",
		sellerName: "",
		dateOfEvent: "",
		startTime: "2100 hrs",
		endTime: "2130 hrs",
		closingTime: "",
		floorPrice: "",
		customUrl: "",
		generatedLink: "entangle.club/customURL",
	});

	const handleOpenModal = () => {
		setCurrentStep("invite-code");
		setStepNumber(1);
	};

	const handleCloseModal = () => {
		onClose();
		setCurrentStep("invite-code");
	};

	const handleNextStep = () => {
		switch (currentStep) {
			case "invite-code":
				setCurrentStep("create-event");
				setStepNumber(2);
				break;
			case "create-event":
				setCurrentStep("connect-socials");
				setStepNumber(4);
				break;
			case "connect-socials":
				setCurrentStep("preview");
				setStepNumber(0);
				break;
			case "preview":
				setCurrentStep("loading");
				setStepNumber(0);
				// Simulate loading then error
				setTimeout(() => {
					setCurrentStep("error");
				}, 3000);
				break;
		}
	};

	const handlePrevStep = () => {
		switch (currentStep) {
			case "create-event":
				setCurrentStep("invite-code");
				setStepNumber(1);
				break;
			case "connect-socials":
				setCurrentStep("create-event");
				setStepNumber(2);
				break;
			case "preview":
				setCurrentStep("connect-socials");
				setStepNumber(4);
				break;
		}
	};

	const handleStartOver = () => {
		setCurrentStep("invite-code");
		setStepNumber(1);
		setEventData({
			inviteCode: "",
			eventName: "",
			sellerName: "",
			dateOfEvent: "",
			startTime: "2100 hrs",
			endTime: "2130 hrs",
			closingTime: "",
			floorPrice: "",
			customUrl: "",
			generatedLink: "entangle.club/customURL",
		});
	};

	const updateEventData = (field: keyof EventData, value: string) => {
		setEventData((prev) => ({ ...prev, [field]: value }));
	};

	const renderModalContent = () => {
		switch (currentStep) {
			case "invite-code":
				return (
					<div className="p-8 space-y-6">
						<div className="space-y-2">
							<p className="text-xs text-gray-400 uppercase tracking-wider">
								STEP {stepNumber} OF 6
							</p>
							<h2 className="text-2xl font-semibold text-white">
								Enter an invite code
							</h2>
						</div>

						<div className="space-y-4">
							<FormInput
								label="INVITE CODE"
								required
								placeholder="Paste your invite code here"
								value={eventData.inviteCode}
								onChange={(e) => updateEventData("inviteCode", e.target.value)}
							/>

							<FormButton onClick={handleNextStep} size="lg">
								Validate
							</FormButton>
						</div>
					</div>
				);

			case "create-event":
				return (
					<div className="p-8 space-y-6">
						<div className="flex items-center justify-between">
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevStep}
								className="text-gray-400 hover:text-white">
								<ArrowLeft className="h-5 w-5" />
							</Button>
						</div>

						<div className="space-y-2">
							<p className="text-xs text-gray-400 uppercase tracking-wider">
								STEP {stepNumber} OF 6
							</p>
							<h2 className="text-2xl font-semibold text-white">
								Create an event
							</h2>
						</div>

						<div className="space-y-4">
							<FormInput
								label="EVENT NAME"
								required
								placeholder="Pick a name for your event"
								value={eventData.eventName}
								onChange={(e) => updateEventData("eventName", e.target.value)}
							/>

							<FormInput
								label="SELLER'S NAME"
								required
								placeholder="Who is conducting this event?"
								value={eventData.sellerName}
								onChange={(e) => updateEventData("sellerName", e.target.value)}
							/>

							<FormSelect
								label="DATE OF EVENT"
								required
								placeholder="Pick a date for this event"
								value={eventData.dateOfEvent}
								onValueChange={(value) =>
									updateEventData("dateOfEvent", value)
								}>
								<FormSelectItem value="2024-06-15">
									15th June 2024
								</FormSelectItem>
								<FormSelectItem value="2024-06-16">
									16th June 2024
								</FormSelectItem>
								<FormSelectItem value="2024-06-17">
									17th June 2024
								</FormSelectItem>
							</FormSelect>

							<div className="grid grid-cols-2 gap-4">
								<FormInput
									label="START TIME"
									required
									value={eventData.startTime}
									onChange={(e) => updateEventData("startTime", e.target.value)}
								/>
								<FormInput
									label="END TIME"
									required
									value={eventData.endTime}
									onChange={(e) => updateEventData("endTime", e.target.value)}
								/>
							</div>

							<FormInput
								label="CLOSING TIME"
								required
								placeholder="Close bids X time before start of event"
								value={eventData.closingTime}
								onChange={(e) => updateEventData("closingTime", e.target.value)}
							/>

							<FormInput
								label="FLOOR PRICE"
								required
								placeholder="Starting bid price in USDC"
								value={eventData.floorPrice}
								onChange={(e) => updateEventData("floorPrice", e.target.value)}
							/>

							<FormInput
								label="CUSTOM URL"
								required
								placeholder="Pick a custom URL"
								value={eventData.customUrl}
								onChange={(e) => updateEventData("customUrl", e.target.value)}
							/>

							<FormField label="LIVE LINK" required>
								<div className="flex h-12 w-full items-center rounded-full border border-gray-600 bg-gray-800 px-4 py-3 text-sm text-gray-400">
									{eventData.generatedLink}
								</div>
							</FormField>

							<FormButton onClick={handleNextStep} size="lg">
								Continue
							</FormButton>
						</div>
					</div>
				);

			case "connect-socials":
				return (
					<div className="p-8 space-y-6">
						<div className="flex items-center justify-between">
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevStep}
								className="text-gray-400 hover:text-white">
								<ArrowLeft className="h-5 w-5" />
							</Button>
						</div>

						<div className="space-y-2">
							<p className="text-xs text-gray-400 uppercase tracking-wider">
								STEP {stepNumber} OF 6
							</p>
							<h2 className="text-2xl font-semibold text-white">
								Connect your socials
							</h2>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between py-4">
								<div className="flex items-center space-x-3">
									<div className="w-6 h-6 text-white">𝕏</div>
									<span className="text-white">X Profile</span>
								</div>
								<FormButton variant="secondary" size="sm">
									connect
								</FormButton>
							</div>

							<FormButton variant="outline" onClick={handleNextStep}>
								Next
							</FormButton>
						</div>
					</div>
				);

			case "preview":
				return (
					<div className="p-8 space-y-6">
						<div className="space-y-2">
							<p className="text-xs text-gray-400 uppercase tracking-wider">
								FINAL STEP
							</p>
							<h2 className="text-2xl font-semibold text-white">Looks okay?</h2>
						</div>

						<TrendingCard
							profileImage="/images/avatar.png"
							name="NFT Collection"
							username="username"
							eventTitle={eventData.eventName || "NFT Collection"}
							eventDate={eventData.dateOfEvent || "2024-06-15"}
							eventTime={`${eventData.startTime} - ${eventData.endTime}`}
							floorPrice="0.01 ETH"
							currentBid="0.005 ETH"
						/>

						<div className="text-center space-y-2">
							<p className="text-xs text-gray-400">Published to</p>
							<p className="text-gray-300">{eventData.generatedLink}</p>
						</div>

						<div className="flex space-x-3">
							<FormButton
								variant="outline"
								onClick={handleStartOver}
								className="flex-1">
								No, start over
							</FormButton>
							<FormButton onClick={handleNextStep} className="flex-1">
								Yes, make it live!
							</FormButton>
						</div>
					</div>
				);

			case "loading":
				return (
					<div className="p-8 text-center space-y-6">
						<div className="space-y-4">
							<div className="flex justify-center">
								<Image
									src="/assets/hour_glass.png"
									alt="Loading"
									width={100}
									height={100}
								/>
							</div>
							<h2 className="text-2xl font-semibold text-white">Please wait</h2>
							<p className="text-gray-400">Broadcasting this transaction</p>
							<p className="text-sm">See it on Etherscan</p>
						</div>
					</div>
				);

			case "error":
				return (
					<div className="p-8 text-center space-y-6">
						<div className="space-y-4">
							<div className="flex justify-center">
								<div className="w-16 h-16 bg-orange-500 rounded-full" />
							</div>
							<h2 className="text-2xl font-semibold text-white">Oops!</h2>
							<div className="space-y-2">
								<p className="text-gray-400">Something went wrong.</p>
								<p className="text-gray-400">
									You should probably redo your last actions.
								</p>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	if (currentStep === "closed") {
		return (
			<div className="p-8">
				<Button
					onClick={handleOpenModal}
					className="bg-yellow-500 hover:bg-yellow-600 text-black">
					Open Event Modal
				</Button>
			</div>
		);
	}

	return (
		<Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
			<DialogContent className="font-sans bg-[var(--srf-l2,hsla(0,0%,11%,0.9))] border-light max-w-md mx-auto rounded-[24px] p-0 max-h-[90vh] overflow-y-auto mt-4">
				{renderModalContent()}
			</DialogContent>
		</Dialog>
	);
}
