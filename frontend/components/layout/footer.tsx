import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="font-sans rounded-t-3xl border-t-2 border-light mt-16 sm:mt-20 bg-surface-level2 px-4 py-8 md:px-8 lg:px-16 xl:px-24">
      <div className="container mx-auto">
        <div className="flex flex-col items-start justify-between gap-4 sm:gap-6 md:flex-row md:items-center">
          <div>
            <Image src="/logos/hero_logo.svg" alt="Carpe Tempus Logo" width={60} height={60} className="mb-3 sm:mb-4 sm:w-10 sm:h-10 w-auto h-auto" />
            <p className="mb-3 sm:mb-4 max-w-xs text-bodys text-text-med">
              Entangle makes it possible to trade your time on the open market using blockchain.
            </p>
            <p className="text-bodym text-high-emphasis font-[400]">Have questions? Reach us at: <br /> info@entangle.club</p>
          </div>

          <div className="flex flex-col items-start gap-3 self-end">
            <Link href="#" className="text-lbll text-text-med hover:text-white font-[700]">
              Join the community
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              {["x", "telegram", "discord", "reddit", "github", "linkedin"].map((social) => (
                <Link key={social} href="#" className="text-text-med hover:text-white">
                  <Image 
                    src={`/home-page/socials/${social}.svg`} 
                    alt={social} 
                    width={15}
                    height={15}
                    className="w-auto h-auto"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-xs text-text-med">© 2025 Entangle. All Rights Reserved</div>
      </div>
    </footer>
  );
};

export default Footer;
