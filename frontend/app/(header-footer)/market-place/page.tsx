"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { MeetingAuctionService } from "@/lib/contract";
import { toast } from "sonner";

import Container from "@/components/layout/container";
import TextHeading from "@/components/shared/TextHeading";
import TrendingCard from "@/components/cards/trending-card";

const trendingEvents = [
    {
        profileImage: "/assets/home-page/person.png",
        name: "Alice Johnson",
        username: "alicej",
        title: "Tech Conference 2025",
        date: "20th May 2025",
        time: "10:00 - 12:00 GMT",
        floorPrice: "1.5 ETH",
        currentBid: "2.1 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Bob Smith",
        username: "bobsmith",
        title: "Web3 Meetup",
        date: "21st May 2025",
        time: "18:00 - 20:00 GMT",
        floorPrice: "0.5 ETH",
        currentBid: "0.7 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Clara Bell",
        username: "clarabell",
        title: "Design Jam",
        date: "22nd May 2025",
        time: "15:00 - 16:30 GMT",
        floorPrice: "0.8 ETH",
        currentBid: "1.0 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "David Lee",
        username: "davidl",
        title: "React Summit",
        date: "23rd May 2025",
        time: "09:00 - 11:30 GMT",
        floorPrice: "2.0 ETH",
        currentBid: "2.4 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Eva Green",
        username: "evagreen",
        title: "Crypto Panel",
        date: "24th May 2025",
        time: "13:00 - 14:00 GMT",
        floorPrice: "1.2 ETH",
        currentBid: "1.6 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Frank Ocean",
        username: "franko",
        title: "Blockchain Basics",
        date: "25th May 2025",
        time: "17:00 - 19:00 GMT",
        floorPrice: "0.9 ETH",
        currentBid: "1.3 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Grace Hall",
        username: "gracehall",
        title: "NFT Workshop",
        date: "26th May 2025",
        time: "11:00 - 13:00 GMT",
        floorPrice: "1.0 ETH",
        currentBid: "1.4 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Henry Wu",
        username: "henrywu",
        title: "Startup Pitch",
        date: "27th May 2025",
        time: "20:00 - 22:00 GMT",
        floorPrice: "3.0 ETH",
        currentBid: "3.6 ETH",
        href: "/event/random-event-id"
    },
];

const all = [
    {
        profileImage: "/assets/home-page/person.png",
        name: "Isabella Ray",
        username: "isabellar",
        title: "AI Hackathon",
        date: "10th April 2025",
        time: "09:00 - 18:00 GMT",
        floorPrice: "2.2 ETH",
        currentBid: "2.9 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Jack Tran",
        username: "jacktran",
        title: "Product Demo Day",
        date: "11th April 2025",
        time: "14:00 - 16:00 GMT",
        floorPrice: "0.7 ETH",
        currentBid: "0.9 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Karen Watts",
        username: "karenwatts",
        title: "UX Review Session",
        date: "12th April 2025",
        time: "12:00 - 13:30 GMT",
        floorPrice: "0.6 ETH",
        currentBid: "0.85 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Leo Park",
        username: "leopark",
        title: "Frontend Fireside",
        date: "13th April 2025",
        time: "16:00 - 18:00 GMT",
        floorPrice: "1.1 ETH",
        currentBid: "1.3 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Mia Chen",
        username: "miachen",
        title: "Web3 vs Web2 Debate",
        date: "14th April 2025",
        time: "19:00 - 20:00 GMT",
        floorPrice: "1.5 ETH",
        currentBid: "1.7 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Nathan Cole",
        username: "nathanc",
        title: "Crypto Q&A",
        date: "15th April 2025",
        time: "08:00 - 09:00 GMT",
        floorPrice: "0.4 ETH",
        currentBid: "0.6 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Olivia Zhang",
        username: "oliviaz",
        title: "Dev Showcase",
        date: "16th April 2025",
        time: "11:00 - 12:30 GMT",
        floorPrice: "1.8 ETH",
        currentBid: "2.0 ETH",
        href: "/event/random-event-id"
    },
    {
        profileImage: "/assets/home-page/person.png",
        name: "Peter Kim",
        username: "peterkim",
        title: "Solidity Bootcamp",
        date: "17th April 2025",
        time: "10:00 - 13:00 GMT",
        floorPrice: "2.5 ETH",
        currentBid: "2.9 ETH",
        href: "/event/random-event-id"
    },
];


const MarketPlace = () => {
    const [contractService, setContractService] = useState<MeetingAuctionService | null>(null);
    const [isContractInitialized, setIsContractInitialized] = useState(false);
    const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize contract service
    useEffect(() => {
        const initContract = async () => {
            try {
                const service = new MeetingAuctionService('FUJI');
                const initialized = await service.initialize();
                setContractService(service);
                setIsContractInitialized(initialized);
                
                if (initialized) {
                    console.log('✅ Contract service initialized for marketplace');
                }
            } catch (error) {
                console.error('❌ Failed to initialize contract service:', error);
                toast.error('Failed to connect to blockchain');
            }
        };

        initContract();
    }, []);

    // Fetch active auctions
    useEffect(() => {
        const fetchAuctions = async () => {
            if (!contractService || !isContractInitialized) return;

            try {
                setIsLoading(true);
                const auctions = await contractService.getActiveAuctions(20); // Get up to 20 auctions
                console.log('📊 Fetched auctions:', auctions);
                setActiveAuctions(auctions);
            } catch (error) {
                console.error('❌ Failed to fetch auctions:', error);
                toast.error('Failed to load auctions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAuctions();
    }, [contractService, isContractInitialized]);

    // Format auction data for TrendingCard
    const formatAuctionForCard = (auction: any, index: number) => {
        const startTime = new Date(auction.startTime * 1000);
        const endTime = new Date((auction.startTime + auction.meetingDuration * 60) * 1000);
        
        return {
            profileImage: "/assets/home-page/person.png",
            name: `Host ${auction.host.slice(0, 6)}...${auction.host.slice(-4)}`,
            username: auction.twitterId || "anonymous",
            eventTitle: auction.metadataIPFS || `Meeting ${index + 1}`,
            eventDate: startTime.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }),
            eventTime: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
            floorPrice: `${auction.reservePrice} AVAX`,
            currentBid: auction.highestBid ? `${auction.highestBid} AVAX` : "No bids yet",
            href: `/event/${auction.id}?auctionId=${auction.id}`
        };
    };

    // Split auctions into trending (first 8) and all (remaining)
    const trendingAuctions = activeAuctions.slice(0, 8);
    const allAuctions = activeAuctions.slice(8);

    return (
        <div className="w-full min-h-screen font-sans">
            <main>
                <Container>
                    <div className="w-full my-8">
                        <TextHeading title="Trending/Top" className="text-h1" />

                        <div className="mt-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                                    <span className="ml-3 text-gray-400">Loading auctions...</span>
                                </div>
                            ) : trendingAuctions.length > 0 ? (
                                <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-hide">
                                    {trendingAuctions.map((auction, i) => {
                                        const cardData = formatAuctionForCard(auction, i);
                                        return (
                                            <div className="flex-shrink-0 w-[280px] sm:w-full" key={auction.id}>
                                                <Link href={cardData.href}>
                                                    <TrendingCard
                                                        profileImage={cardData.profileImage}
                                                        name={cardData.name}
                                                        username={cardData.username}
                                                        eventTitle={cardData.eventTitle}
                                                        eventDate={cardData.eventDate}
                                                        eventTime={cardData.eventTime}
                                                        floorPrice={cardData.floorPrice}
                                                        currentBid={cardData.currentBid}
                                                    />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No active auctions found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full my-8">
                        <TextHeading title="All Events" className="text-h1" />

                        <div className="mt-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                                    <span className="ml-3 text-gray-400">Loading auctions...</span>
                                </div>
                            ) : allAuctions.length > 0 ? (
                                <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-hide">
                                    {allAuctions.map((auction, i) => {
                                        const cardData = formatAuctionForCard(auction, i + 8);
                                        return (
                                            <div className="flex-shrink-0 w-[280px] sm:w-full" key={auction.id}>
                                                <Link href={cardData.href}>
                                                    <TrendingCard
                                                        profileImage={cardData.profileImage}
                                                        name={cardData.name}
                                                        username={cardData.username}
                                                        eventTitle={cardData.eventTitle}
                                                        eventDate={cardData.eventDate}
                                                        eventTime={cardData.eventTime}
                                                        floorPrice={cardData.floorPrice}
                                                        currentBid={cardData.currentBid}
                                                    />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No more auctions to show</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
};

export default MarketPlace;