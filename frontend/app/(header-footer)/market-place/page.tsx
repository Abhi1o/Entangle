"use client"

import Link from "next/link";

import Container from "@/components/layout/container";
import TextHeading from "@/components/shared/TextHeading";
import TrendingCard from "@/components/cards/trending-card";

const trendingEvents = [
    {
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
        profileImage: "/home-page/person.png",
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
 
    return (
        <div className="w-full min-h-screen font-sans">
            <main>
                <Container>

                    <div className="w-full my-8">
                        <TextHeading title="Trending/Top" className="text-h1" />

                        <div className="mt-4">
                            <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-hide">
                                {
                                    trendingEvents.map((v, i) => (
                                        <div className="flex-shrink-0 w-[280px] sm:w-full" key={i}>
                                            <Link href={v.href}>
                                                <TrendingCard
                                                    profileImage={v.profileImage}
                                                    name={v.name}
                                                    username={v.username}
                                                    eventTitle={v.title}
                                                    eventDate={v.date}
                                                    eventTime={v.time}
                                                    floorPrice={v.floorPrice}
                                                    currentBid={v.currentBid}
                                                />
                                            </Link>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="w-full my-8">
                        <TextHeading title="All Events" className="text-h1" />

                        <div className="mt-4">
                            <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-hide">
                                {
                                    all.map((v, i) => (
                                        <div className="flex-shrink-0 w-[280px] sm:w-full" key={i}>
                                            <TrendingCard
                                                profileImage={v.profileImage}
                                                name={v.name}
                                                username={v.username}
                                                eventTitle={v.title}
                                                eventDate={v.date}
                                                eventTime={v.time}
                                                floorPrice={v.floorPrice}
                                                currentBid={v.currentBid}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                </Container>
            </main>
        </div>
    )
}

export default MarketPlace;