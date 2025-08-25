import Image from "next/image"
import Link from "next/link"

import Hero from "@/components/home-page/Hero"
import MMSection from "@/components/home-page/mm-section"
import Trending from "@/components/home-page/trending"
import Footer from "@/components/layout/footer"

export default function Home() {
  return (
    <main className="min-h-screen text-white font-sans">
      {/* Hero Section */}
      <Hero />

      {/* Moments Section */}
      <MMSection />

      {/* Trending Section */}
      <Trending />

      {/* Steps Section */}
      <section className="mt-12 sm:mt-20 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="container mx-auto">
          <h2 className="mb-6 sm:mb-8 sm:text-d2 text-titlel font-[700] text-center text-gradient-headings">As easy as 123...</h2>

          <div className="mb-4">
            <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-medium">Sell your time...</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-video rounded-lg border border-zinc-800"></div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="aspect-[3/1] rounded-lg border border-zinc-800"></div>
          </div>

          <div className="mb-4 sm:mb-6 text-right">
            <p className="text-gradient-headings font-[700] text-titlel">...or buy someone else's.</p>
          </div>

          <div className="mb-6 sm:mb-8">
            <p className="text-bodyl text-gray-400">
              Write a 3 step way to do it:
              <br />
              <br />
              mint an NFT entanglement, buy an NFT entanglement, do it over decentralized video, self compatible with
              ETH NFTs on all platforms
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-12 sm:mt-16 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="container mx-auto">
          <h2 className="mb-6 sm:mb-8 sm:text-d2 text-titlel font-[700] text-center text-gradient-headings">We're hot on X</h2>

          {/* Mobile: Horizontal scrolling testimonials */}
          <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 scrollbar-hide">
            {[
              { name: "Elon Musk", text: "I just tried Entangle for the first time on Entangle." },
              {
                name: "Sachin Matta",
                text: "OMG, I can't believe this just used our service! Go check out Entangle now!",
              },
              { name: "Akshay Khurana", text: "OMG, I can't believe Sachin's tweet. This is copy crazy." },
              { name: "John Doe", text: "John's tweet goes here" },
            ].map((testimonial, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] sm:w-full rounded-lg p-8 sm:p-4 border-light bg-srf-l2">
                <div className="mb-2 sm:mb-4">
                  <Image
                    src={`/home-page/person.png`}
                    alt={`${testimonial.name} avatar`}
                    width={64}
                    height={64}
                    className="rounded-full sm:w-10 sm:h-10"
                  />
                  <div className="mt-4 sm:text-sm font-[700] text-titlem">{testimonial.name}</div>
                  <div className="mb-4 text-text-med text-bodys">@{testimonial.name}</div>
                </div>
                <p className="text-bodym text-text-med">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}


Home.whyDidYouRender = true;
