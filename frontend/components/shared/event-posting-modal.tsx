"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect, FormSelectItem } from "@/components/ui/form-select";
import { FormField } from "@/components/ui/form-field";
import { FormButton } from "@/components/ui/form-button";
import TrendingCard from "../cards/trending-card";
import { MeetingAuctionService } from "@/lib/contract";
import { useAccount } from "@getpara/react-sdk";
import { toast } from "sonner";

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
	closingDate: string;
	closingTime: string;
	floorPrice: string;
	
	generatedLink: string;
}

export default function EventPostingModal({
	isModalOpen,
	onClose,
}: {
	isModalOpen: boolean;
	onClose: () => void;
}) {
	const account = useAccount();
	const [contractService, setContractService] = useState<MeetingAuctionService | null>(null);
	const [isContractInitialized, setIsContractInitialized] = useState(false);
	
	const [currentStep, setCurrentStep] = useState<ModalStep>("create-event");
	const [stepNumber, setStepNumber] = useState(1);
	const [eventData, setEventData] = useState<EventData>({
		inviteCode: "",
		eventName: "",
		sellerName: "",
		dateOfEvent: "",
		startTime: "",
		endTime: "",
		closingDate: "",
		closingTime: "",
		floorPrice: "",
		
		generatedLink: "entangle.club/customURL",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Initialize contract service when user is authenticated
	useEffect(() => {
		const initContract = async () => {
			if (account.isConnected && account.embedded.wallets?.length && account.embedded.wallets.length > 0) {
				try {
					const service = new MeetingAuctionService('FUJI');
					const initialized = await service.initialize();
					setContractService(service);
					setIsContractInitialized(initialized);
					
					if (initialized) {
						console.log('✅ Contract service initialized for auction creation');
					}
				} catch (error) {
					console.error('❌ Failed to initialize contract service:', error);
					toast.error('Failed to connect to blockchain. Please refresh and try again.');
				}
			}
		};

		initContract();
	}, [account.isConnected, account.embedded.wallets]);

	const handleOpenModal = () => {
		setCurrentStep("create-event");
		setStepNumber(1);
	};

	const handleCloseModal = () => {
		onClose();
		setCurrentStep("create-event");
		setStepNumber(1);
		setEventData({
			inviteCode: "",
			eventName: "",
			sellerName: "",
			dateOfEvent: "",
			startTime: "",
			endTime: "",
			closingDate: "",
			closingTime: "",
			floorPrice: "",
			
			generatedLink: "entangle.club/customURL",
		});
	};

	const validateCreateEvent = () => {
		const newErrors: Record<string, string> = {};

		if (!eventData.eventName.trim()) {
			newErrors.eventName = "Event name is required";
		}

		if (!eventData.sellerName.trim()) {
			newErrors.sellerName = "Seller's name is required";
		}

		if (!eventData.dateOfEvent) {
			newErrors.dateOfEvent = "Date of event is required";
		} else {
			const selectedDate = new Date(eventData.dateOfEvent);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			if (selectedDate < today) {
				newErrors.dateOfEvent = "Date must be in the future";
			}
		}

		if (!eventData.startTime.trim()) {
			newErrors.startTime = "Start time is required";
		}

		if (!eventData.endTime.trim()) {
			newErrors.endTime = "End time is required";
		} else if (eventData.startTime && eventData.endTime) {
			// Validate that end time is after start time
			const startTime = new Date(`2000-01-01T${eventData.startTime}`);
			const endTime = new Date(`2000-01-01T${eventData.endTime}`);
			
			if (endTime <= startTime) {
				newErrors.endTime = "End time must be after start time";
			}
		}

		if (!eventData.closingDate.trim()) {
			newErrors.closingDate = "Closing date is required";
		} else {
			const selectedDate = new Date(eventData.closingDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			if (selectedDate < today) {
				newErrors.closingDate = "Closing date must be in the future";
			}
		}

		if (!eventData.closingTime.trim()) {
			newErrors.closingTime = "Closing time is required";
		}

		if (!eventData.floorPrice.trim()) {
			newErrors.floorPrice = "Floor price is required";
		} else if (isNaN(Number(eventData.floorPrice)) || Number(eventData.floorPrice) <= 0) {
			newErrors.floorPrice = "Floor price must be a positive number";
		}

		

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNextStep = async () => {
		switch (currentStep) {
			case "create-event":
				if (validateCreateEvent()) {
					// Check if user is authenticated
					if (!account.isConnected || !account.embedded.wallets?.length) {
						toast.error('Please connect your wallet first');
						return;
					}

					// Check if contract is initialized
					if (!isContractInitialized) {
						toast.error('Connecting to blockchain... Please wait');
						return;
					}

					setCurrentStep("preview");
					setStepNumber(2);
				}
				break;
			case "preview":
				setCurrentStep("loading");
				setStepNumber(0);
				
				try {
					// Create auction on blockchain
					const tx = await createAuctionOnChain();
					
					// Show success (tx is already the receipt from contract service)
					toast.success('Auction created successfully!');
					
					// Redirect to auctions page after a short delay
					setTimeout(() => {
						window.location.href = '/auctions';
					}, 2000);
					
				} catch (error: any) {
					console.error('Failed to create auction:', error);
					
					// Show specific error messages
					if (error.message.includes('insufficient funds')) {
						toast.error('Insufficient funds for gas fees');
					} else if (error.message.includes('user rejected')) {
						toast.error('Transaction was cancelled');
					} else if (error.message.includes('Twitter ID already used')) {
						toast.error('Twitter ID conflict detected. Please try again.');
					} else if (error.message.includes('execution reverted')) {
						// Extract the specific revert reason
						const revertReason = error.message.match(/reason="([^"]+)"/)?.[1] || 'Transaction failed';
						toast.error(`Transaction failed: ${revertReason}`);
					} else if (error.message.includes('value out-of-bounds')) {
						toast.error('Invalid input values. Please check your form data.');
					} else {
						toast.error(error.message || 'Failed to create auction');
					}
					
					setCurrentStep("error");
				}
				break;
		}
	};

	const handlePrevStep = () => {
		switch (currentStep) {
			case "preview":
				setCurrentStep("create-event");
				setStepNumber(1);
				break;
		}
	};

	const handleStartOver = () => {
		setCurrentStep("create-event");
		setStepNumber(1);
		setEventData({
			inviteCode: "",
			eventName: "",
			sellerName: "",
			dateOfEvent: "",
			startTime: "",
			endTime: "",
			closingDate: "",
			closingTime: "",
			floorPrice: "",
			
			generatedLink: "entangle.club/customURL",
		});
		setErrors({});
	};

	const handleRetry = () => {
		setCurrentStep("preview");
		setStepNumber(2);
	};

	const updateEventData = (field: keyof EventData, value: string) => {
		setEventData((prev) => ({ ...prev, [field]: value }));
	};

	// Create auction on blockchain
	const createAuctionOnChain = async () => {
		if (!contractService || !isContractInitialized) {
			throw new Error('Contract service not initialized');
		}

		if (!account.embedded.wallets?.[0]?.address) {
			throw new Error('No wallet address found');
		}

		// Calculate auction duration in blocks (assuming 2 second block time)
		const auctionEndDate = new Date(`${eventData.closingDate}T${eventData.closingTime}`);
		const now = new Date();
		const durationInSeconds = Math.floor((auctionEndDate.getTime() - now.getTime()) / 1000);
		const durationInBlocks = Math.max(Math.floor(durationInSeconds / 2), 100); // Minimum 100 blocks

		// Calculate meeting duration in minutes
		const meetingStart = new Date(`${eventData.dateOfEvent}T${eventData.startTime}`);
		const meetingEnd = new Date(`${eventData.dateOfEvent}T${eventData.endTime}`);
		let meetingDurationMinutes = Math.floor((meetingEnd.getTime() - meetingStart.getTime()) / (1000 * 60));
		
		// Ensure positive duration (handle cases where end time is before start time)
		if (meetingDurationMinutes < 0) {
			// If end time is before start time, assume it's the next day
			const nextDayEnd = new Date(`${eventData.dateOfEvent}T${eventData.endTime}`);
			nextDayEnd.setDate(nextDayEnd.getDate() + 1);
			meetingDurationMinutes = Math.floor((nextDayEnd.getTime() - meetingStart.getTime()) / (1000 * 60));
		}
		
		// Ensure minimum duration of 1 minute
		meetingDurationMinutes = Math.max(meetingDurationMinutes, 1);

		// Create metadata IPFS hash (simplified for demo)
		const metadataIPFS = `ipfs://event_${Date.now()}_${eventData.eventName.replace(/\s+/g, '_')}`;

		// Generate unique Twitter ID (combine user ID with timestamp)
		const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const twitterId = account.embedded.userId ? 
			`${account.embedded.userId}_${uniqueId}` : 
			`user_${uniqueId}`;

		try {
			console.log('🚀 Creating auction with parameters:', {
				host: account.embedded.wallets[0].address,
				twitterId,
				duration: durationInBlocks,
				reservePrice: eventData.floorPrice,
				metadataIPFS,
				meetingDuration: meetingDurationMinutes
			});
			
			console.log('📊 Form data for debugging:', {
				dateOfEvent: eventData.dateOfEvent,
				startTime: eventData.startTime,
				endTime: eventData.endTime,
				meetingStart: meetingStart.toISOString(),
				meetingEnd: meetingEnd.toISOString(),
				calculatedDuration: meetingDurationMinutes
			});

			const tx = await contractService.createAuction(
				account.embedded.wallets[0].address, // host
				twitterId, // twitterId
				durationInBlocks, // duration in blocks
				eventData.floorPrice, // reserve price
				metadataIPFS, // metadata IPFS
				meetingDurationMinutes // meeting duration in minutes
			);

			console.log('✅ Auction created successfully:', tx);
			return tx;
		} catch (error) {
			console.error('❌ Failed to create auction:', error);
			throw error;
		}
	};

	const renderModalContent = () => {
		switch (currentStep) {
 			// case "invite-code":
			// 	return (
			// 		<div className="p-8 space-y-6">
			// 			<div className="flex items-center justify-between">
			// 				<div className="space-y-2">
			// 					<p className="text-xs text-gray-400 uppercase tracking-wider">
			// 						STEP {stepNumber} OF 6
			// 					</p>
			// 					<h2 className="text-2xl font-semibold text-white">
			// 						Enter an invite code
			// 					</h2>
			// 				</div>
			// 				<Button
			// 					variant="ghost"
			// 					size="icon"
			// 					onClick={handleCloseModal}
			// 					className="text-gray-400 hover:text-white">
			// 					<svg
			// 						xmlns="http://www.w3.org/2000/svg"
			// 						width="24"
			// 						height="24"
			// 						viewBox="0 0 24 24"
			// 						fill="none"
			// 						stroke="currentColor"
			// 						strokeWidth="2"
			// 						strokeLinecap="round"
			// 						strokeLinejoin="round"
			// 						className="h-5 w-5"
			// 					>
			// 						<line x1="18" y1="6" x2="6" y2="18" />
			// 						<line x1="6" y1="6" x2="18" y2="18" />
			// 					</svg>
			// 				</Button>
			// 			</div>

			// 			<div className="space-y-4">
			// 				<FormInput
			// 					label="INVITE CODE"
			// 					required
			// 					placeholder="Paste your invite code here"
			// 					value={eventData.inviteCode}
			// 					onChange={(e) => updateEventData("inviteCode", e.target.value)}
			// 				/>

			// 				<FormButton onClick={handleNextStep} size="lg">
			// 					Validate
			// 				</FormButton>
			// 			</div>
			// 		</div>
			// 	);

			case "create-event":
				return (
					<div className="p-4 md:p-8 space-y-4 md:space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1 md:space-y-2">
								<p className="text-xs text-gray-400 uppercase tracking-wider">
									STEP {stepNumber} OF 2
								</p>
								<h2 className="text-xl md:text-2xl font-semibold text-white">
									Create an event
								</h2>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleCloseModal}
								className="text-gray-400 hover:text-white p-2 md:p-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4 md:h-5 md:w-5"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</Button>
						</div>

						{/* Authentication Status */}
						{!account.isConnected && (
							<div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
								<p className="text-red-400 text-sm">
									⚠️ Please connect your wallet to create an auction
								</p>
							</div>
						)}

						{account.isConnected && !isContractInitialized && (
							<div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
								<p className="text-yellow-400 text-sm">
									🔄 Connecting to blockchain...
								</p>
							</div>
						)}

						{account.isConnected && isContractInitialized && (
							<div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
								<p className="text-green-400 text-sm">
									✅ Connected to Avalanche Fuji Testnet
								</p>
								<p className="text-green-400/70 text-xs mt-1">
									Wallet: {account.embedded.wallets?.[0]?.address?.slice(0, 6)}...{account.embedded.wallets?.[0]?.address?.slice(-4)}
								</p>
							</div>
						)}

						<div className="space-y-3 md:space-y-4">
							<FormInput
								label="EVENT NAME"
								required
								placeholder="Pick a name for your event"
								value={eventData.eventName}
								onChange={(e) => updateEventData("eventName", e.target.value)}
								className={`h-10 md:h-12 text-sm md:text-base ${errors.eventName ? 'border-red-500' : ''}`}
							/>
							{errors.eventName && (
								<p className="text-red-500 text-xs mt-1">{errors.eventName}</p>
							)}

							<FormInput
								label="SELLER'S NAME"
								required
								placeholder="Who is conducting this event?"
								value={eventData.sellerName}
								onChange={(e) => updateEventData("sellerName", e.target.value)}
								className={`h-10 md:h-12 text-sm md:text-base ${errors.sellerName ? 'border-red-500' : ''}`}
							/>
							{errors.sellerName && (
								<p className="text-red-500 text-xs mt-1">{errors.sellerName}</p>
							)}

							<FormInput
								label="DATE OF EVENT"
								required
								type="date"
								placeholder="Pick a date for this event"
								value={eventData.dateOfEvent}
								onChange={(e) => updateEventData("dateOfEvent", e.target.value)}
								min={new Date().toISOString().split('T')[0]}
								className={`h-10 md:h-12 text-sm md:text-base ${errors.dateOfEvent ? 'border-red-500' : ''}`}
							/>
							{errors.dateOfEvent && (
								<p className="text-red-500 text-xs mt-1">{errors.dateOfEvent}</p>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
								<FormInput
									label="START TIME"
									required
									type="time"
									value={eventData.startTime}
									onChange={(e) => updateEventData("startTime", e.target.value)}
									className={`h-10 md:h-12 text-sm md:text-base ${errors.startTime ? 'border-red-500' : ''}`}
								/>
								<FormInput
									label="END TIME"
									required
									type="time"
									value={eventData.endTime}
									onChange={(e) => updateEventData("endTime", e.target.value)}
									className={`h-10 md:h-12 text-sm md:text-base ${errors.endTime ? 'border-red-500' : ''}`}
								/>
							</div>
							{(errors.startTime || errors.endTime) && (
								<div className="space-y-1">
									{errors.startTime && (
										<p className="text-red-500 text-xs">{errors.startTime}</p>
									)}
									{errors.endTime && (
										<p className="text-red-500 text-xs">{errors.endTime}</p>
									)}
								</div>
							)}

							<div className="space-y-3">
								<label className="text-xs md:text-[12px] font-medium text-gray-400">
									BIDDING CLOSING DATE & TIME <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
									<FormInput
										label=""
										required
										type="date"
										placeholder="Closing date"
										value={eventData.closingDate || ""}
										onChange={(e) => updateEventData("closingDate", e.target.value)}
										min={new Date().toISOString().split('T')[0]}
										className={`h-10 md:h-12 text-sm md:text-base ${errors.closingDate ? 'border-red-500' : ''}`}
									/>
									<FormInput
										label=""
										required
										type="time"
										placeholder="Closing time"
										value={eventData.closingTime}
										onChange={(e) => updateEventData("closingTime", e.target.value)}
										className={`h-10 md:h-12 text-sm md:text-base ${errors.closingTime ? 'border-red-500' : ''}`}
									/>
								</div>
								{(errors.closingDate || errors.closingTime) && (
									<div className="space-y-1">
										{errors.closingDate && (
											<p className="text-red-500 text-xs">{errors.closingDate}</p>
										)}
										{errors.closingTime && (
											<p className="text-red-500 text-xs">{errors.closingTime}</p>
										)}
									</div>
								)}
								<p className="text-xs text-gray-400">
									When should bidding close for this event?
								</p>
							</div>

							<FormInput
								label="FLOOR PRICE"
								required
								type="number"
								placeholder="Starting bid price in USDC"
								value={eventData.floorPrice}
								onChange={(e) => updateEventData("floorPrice", e.target.value)}
								className={`h-10 md:h-12 text-sm md:text-base ${errors.floorPrice ? 'border-red-500' : ''}`}
							/>
							{errors.floorPrice && (
								<p className="text-red-500 text-xs mt-1">{errors.floorPrice}</p>
							)}

							<FormButton 
								onClick={handleNextStep} 
								size="lg"
								className="w-full md:w-auto h-10 md:h-10 text-sm md:text-base font-medium"
							>
								Continue
							</FormButton>
						</div>
					</div>
				);

			// case "connect-socials":
			// 	return (
			// 		<div className="p-8 space-y-6">
			// 			<div className="flex items-center justify-between">
			// 				<Button
			// 					variant="ghost"
			// 					size="icon"
			// 					onClick={handlePrevStep}
			// 					className="text-gray-400 hover:text-white">
			// 				<ArrowLeft className="h-5 w-5" />
			// 			</Button>
			// 		</div>

			// 		<div className="space-y-2">
			// 			<p className="text-xs text-gray-400 uppercase tracking-wider">
			// 				STEP {stepNumber} OF 6
			// 			</p>
			// 			<h2 className="text-2xl font-semibold text-white">
			// 				Connect your socials
			// 			</h2>
			// 		</div>

			// 		<div className="space-y-4">
			// 			<div className="flex items-center justify-between py-4">
			// 				<div className="flex items-center space-x-3">
			// 				<div className="w-6 h-6 text-white">𝕏</div>
			// 				<span className="text-white">X Profile</span>
			// 			</div>
			// 			<FormButton variant="secondary" size="sm">
			// 				connect
			// 			</FormButton>
			// 		</div>

			// 		<FormButton variant="outline" onClick={handleNextStep}>
			// 			Next
			// 		</FormButton>
			// 	</div>
			// </div>
			// );

			case "preview":
				return (
					<div className="p-4 md:p-8 space-y-4 md:space-y-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1 md:space-y-2">
								<p className="text-xs text-gray-400 uppercase tracking-wider">
									STEP {stepNumber} OF 2
								</p>
								<h2 className="text-xl md:text-2xl font-semibold text-white">Looks okay?</h2>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevStep}
								className="text-gray-400 hover:text-white p-2 md:p-3">
								<ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
							</Button>
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
							<p className="text-gray-300 text-sm md:text-base">{eventData.generatedLink}</p>
						</div>

						<div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
							<FormButton
								variant="outline"
								onClick={handleStartOver}
								className="flex-1 h-12 md:h-14 text-sm md:text-base font-medium">
								No, start over
							</FormButton>
							<FormButton 
								onClick={handleNextStep} 
								className="flex-1 h-12 md:h-14 text-sm md:text-base font-medium">
								Yes, make it live!
							</FormButton>
						</div>
					</div>
				);

			case "loading":
				return (
					<div className="p-4 md:p-8 text-center space-y-4 md:space-y-6">
						<div className="space-y-3 md:space-y-4">
							<div className="flex justify-center">
								<Image
									src="/assets/hour_glass.png"
									alt="Loading"
									width={80}
									height={80}
									className="md:w-[100px] md:h-[100px] animate-pulse"
								/>
							</div>
							<h2 className="text-xl md:text-2xl font-semibold text-white">Creating Auction</h2>
							<p className="text-gray-400 text-sm md:text-base">Broadcasting transaction to Avalanche</p>
							<p className="text-xs md:text-sm">This may take a few moments...</p>
							<div className="mt-4">
								<div className="w-full bg-gray-700 rounded-full h-2">
									<div className="bg-yellow-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
								</div>
							</div>
						</div>
					</div>
				);

			case "error":
				return (
					<div className="p-4 md:p-8 text-center space-y-4 md:space-y-6">
						<div className="space-y-3 md:space-y-4">
							<div className="flex justify-center">
								<div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-full" />
							</div>
							<h2 className="text-xl md:text-2xl font-semibold text-white">Oops!</h2>
							<div className="space-y-2">
								<p className="text-gray-400 text-sm md:text-base">Something went wrong.</p>
								<p className="text-gray-400 text-sm md:text-base">
									You should probably redo your last actions.
								</p>
							</div>
							<div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 pt-4">
								<FormButton
									variant="outline"
									onClick={handleRetry}
									className="flex-1 h-12 md:h-14 text-sm md:text-base font-medium">
									Try Again
								</FormButton>
								<FormButton 
									onClick={handleCloseModal} 
									className="flex-1 h-12 md:h-14 text-sm md:text-base font-medium">
									Close
								</FormButton>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	if (!isModalOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 -z-10 flex items-center justify-center p-4 mt-14 md:mt-7">
			<div className="font-sans bg-[var(--srf-l2,hsla(0,0%,11%,0.9))] border border-light w-full max-w-[600px] mx-auto rounded-3xl p-0 max-h-[80vh] md:max-h-[80vh] overflow-y-auto no-scrollbar">
				{renderModalContent()}
			</div>
		</div>
	);
}
