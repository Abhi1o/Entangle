import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "../layout/container";

const MMSection = () => {
  return (
    <section className="w-full mt-8 md:mt-16 bg-surface-level2 py-4 md:py-6 min-h-[480px] md:h-[390px]">
      <Container className="grid gap-4 md:gap-6 md:grid-cols-2 h-full">
        {/* Buy Time Card */}
        <div className="rounded-lg p-4 md:p-6 flex flex-col justify-center md:pr-12">
          <div className="mb-1 text-sm md:text-overl uppercase font-[500] text-gradient-headings">
            Buy someone's time
          </div>
          <h2 className="mb-2 md:mb-3 text-xl md:text-h2 font-bold text-gradient-headings">Moments that matter</h2>
          <p className="mb-4 md:mb-6 text-base md:text-bodyl text-gray-400">
            One meeting could spark your next big idea. Land a dream
            collaboration, secure funding, or simply connect with someone you
            admire.
          </p>
          <Link
            href="/market-place"
            className="md:w-fit inline-flex items-center justify-center rounded-full border-2 border-primary px-4 md:px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Buy your first <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Sell Time Card */}
        <div className="rounded-lg p-4 md:p-6 flex flex-col justify-center md:pr-12">
          <div className="mb-1 text-sm md:text-xs uppercase font-[500] text-gradient-headings">
            Sell your time
          </div>
          <h2 className="mb-2 md:mb-3 text-xl md:text-h2 font-bold text-gradient-headings">Monetize your time</h2>
          <p className="mb-4 md:mb-6 text-base md:text-bodyl text-gray-400">
            Don't let your knowledge go untapped. Get compensated for your
            valuable insights and help others achieve their goals.
          </p>
          <Link
            href="/create-event"
            className="md:w-fit inline-flex items-center justify-center rounded-full border-2 border-primary px-4 md:px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Create your first <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default MMSection;
