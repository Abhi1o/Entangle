import Image from "next/image";

interface TrendingCardProps {
  profileImage: string;
  name: string;
  username: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  floorPrice: string;
  currentBid: string;
}

const TrendingCard = ({
  profileImage,
  name,
  username,
  eventTitle,
  eventDate,
  eventTime,
  floorPrice,
  currentBid,
}: TrendingCardProps) => {
  return (
    <div className="py-8 md:py-12 px-4 md:px-6 border-light bg-surface-level2 rounded-2xl md:rounded-3xl transform transition-transform hover:scale-105 duration-300">
      <div className="flex items-center mb-3 md:mb-4">
        <div className="rounded-full overflow-hidden w-10 md:w-12 h-10 md:h-12 mr-3 border-2 border-gray-700 hover:border-primary-500 transition-all duration-300">
          <Image
            width={48}
            height={48}
            src={profileImage}
            alt={`${name}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="font-[400] text-text-med">
          <p className="text-sm md:text-bodys">{name}</p>
          <p className="text-xs md:text-bodyxs">@{username}</p>
        </div>
      </div>

      <h2 className="text-white text-lg md:text-titlem font-[700] mb-2">
        {eventTitle}
      </h2>

      <div className="text-medium-emphasis text-sm md:text-bodys mb-3 md:mb-4">
        <p className="text-sm text-text-med">{eventDate}</p>
        <p className="text-sm text-text-med">{eventTime}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 text-white">
        <div className="">
          <p className="text-xs text-text-med mb-1">Floor Price</p>
          <p className="text-base md:text-lg font-semibold">{floorPrice}</p>
        </div>
        <div className="">
          <p className="text-xs text-text-med mb-1">Current Bid</p>
          <p className="text-base md:text-lg font-semibold">{currentBid}</p>
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
