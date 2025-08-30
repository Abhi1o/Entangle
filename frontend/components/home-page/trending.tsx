import Link from "next/link";

import Container from "../layout/container";
import TrendingCard from "../cards/trending-card";

const Trending = () => {
  return (
    <section className="mt-8 md:mt-16 w-full">
      <Container className="w-full px-4 md:px-6 py-4 md:py-6">
        <div className="mb-4 md:mb-6 flex flex-row sm:items-center gap-3 sm:gap-4">
          <h2 className="text-[24px] sm:text-d2 font-bold text-gradient-headings font-[700]">
            Trending/Top
          </h2>
          <Link
            href="/market-place"
            className="w-fit inline-flex items-center justify-center rounded-full border border-accented-text px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-lblm font-[700] text-accented-text transition-colors"
          >
            See all
          </Link>
        </div>

        {/* Mobile: Horizontal scrolling container */}
        <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-hide">
          {[...Array(8)].map((_, i) => (
            <div className="flex-shrink-0 w-[280px] sm:w-full" key={i}>
              <Link
                href={`/event/${i}`}
                className="w-full"
              >
                <TrendingCard
                  profileImage="/assets/home-page/person.png"
                  name="John Doe"
                  username="JohnDoe"
                  eventTitle="Another fun event"
                eventDate="15th June 1989"
                eventTime="21:00-21:30 GMT"
                floorPrice="9.99 ETH"
                currentBid="9.99 ETH"
              />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Trending;
