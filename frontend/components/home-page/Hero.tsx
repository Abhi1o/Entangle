import Image from "next/image";
import Link from "next/link";

import Container from "@/components/layout/container";

const Hero = () => {
  return (
    <section className="w-full relative min-h-screen bg-[url('/home-page/hero-bg.svg')] bg-cover">
      <Container className="h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center h-full">
          <div className="mb-8 md:mb-0 md:max-w-[460px] px-4 md:px-0">
            <div className="mb-4 md:mb-6 h-full mt-24 md:mt-0">
              <Image
                src="/logos/hero_logo.svg"
                alt="Carpe Tempus Logo"
                width={120}
                height={120}
                className="mb-4 md:mb-6 w-[80px] h-[80px] md:w-[120px] md:h-[120px]"
              />
              <h1 className="font-sans mb-2 text-[44px] md:text-d1 font-[700] text-gradient-headings">
                Carpe Tempus
              </h1>
              <p className="text-base md:text-[21px] font-[400] text-medium-emphasis text-[#F9F9F9A8] leading-7 md:leading-8">
                <i>Seize time</i>, your ultimate asset.
                <br className="hidden md:block" />
                Entangle opens the door for you to trade your time on the open
                market, turning every moment into an opportunity.
              </p>

              <Link
                href="/market-place"
                className="mt-6 bg-action-primary inline-flex items-center rounded-full px-4 md:px-6 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
              >
                Go to app
              </Link>
            </div>
          </div>
          <div className="w-3/4"></div>
          <div className="absolute right-0 md:-bottom-20 bottom-0 top-1/2 md:top-auto">
            <Image
              src="/home-page/hero-hand.png"
              alt="Hand holding hourglass"
              width={800}
              height={800}
              className="ml-auto hidden md:block"
            />
            <Image
              src="/home-page/hero-hand.png"
              alt="Hand holding hourglass"
              width={400}
              height={400}
              className="ml-auto md:hidden max-w-[80%]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
