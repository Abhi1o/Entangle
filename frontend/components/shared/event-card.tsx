import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  profileImage: string;
  name: string;
  username: string;
  title: string;
  date: string;
  time: string;
  floorPrice: string;
  currentBid: string;
  href?: string;
}

const EventCard = ({
  profileImage,
  name,
  username,
  title,
  date,
  time,
  floorPrice,
  currentBid,
  href
}: EventCardProps) => {
  return (
    <Link href={href || "#"}>
    <div className="font-sans py-12 px-6 bg-surface-level2 rounded-3xl max-w-sm transform transition-transform hover:scale-105 duration-300">
      <div className="flex items-center mb-4">
        <div className="rounded-full overflow-hidden w-12 h-12 mr-3 border-2 border-gray-700 hover:border-primary-500 transition-all duration-300">
          <Image
            width={48}
            height={48}
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="font-[400] text-medium-emphasis">
          <p className="text-bodys">{name}</p>
          <p className="text-bodyxs">@{username}</p>
        </div>
      </div>

      <h2 className="text-white text-titlem font-[700] mb-2">{title}</h2>

      <div className="text-medium-emphasis text-bodys mb-4">
        <p className="text-sm">{date}</p>
        <p className="text-sm">{time}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-white">
        <div>
          <p className="text-xs text-gray-400 mb-1">Floor Price</p>
          <p className="text-lg font-semibold">{floorPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Current Bid</p>
          <p className="text-lg font-semibold">{currentBid}</p>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default EventCard;
