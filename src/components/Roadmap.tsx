"use client";
import React from "react";
import Image from "next/image";

const RoadmapSection: React.FC = () => {
  const roadmapPhases = [
    {
      phase: "Phase 1: Website and Socials",
      description:
        "The foundation begins with the launch of our official website and social media platforms. Building a strong online presence ensures that the Monkey Sol Inu community stays informed, engaged, and connected from day one.",
    },
    {
      phase: "Phase 2: CoinMarketCap & CoinGecko Listings",
      description:
        "Achieving visibility on leading platforms like CoinMarketCap (CMC) and CoinGecko (CG) is critical. These listings will allow investors and community members to track real-time price data, market performance, and project growth metrics.",
    },
    {
      phase: "Phase 3: KeyShiBros Release",
      description:
        "KeyShiBros, an exciting addition to the Monkey Sol Inu ecosystem, will bring entertainment, community engagement, and potential rewards. Expect unique gameplay, challenges, and integration with the MSI ecosystem.",
    },
    {
      phase: "Phase 4: Centralized Exchanges (CEXs)",
      description:
        "Expand reach and accessibility by securing listings on major centralized exchanges. CEXs will provide seamless trading, liquidity, and exposure to a broader global audience.",
    },
    {
      phase: "Phase 5: TickerTrending.com Revenue Integration",
      description:
        "The integration of TickerTrending.com revenue streams will add a sustainable financial layer to the Monkey Sol Inu ecosystem. A portion of the platform's revenue will be directed to support future developments, community incentives, and overall project growth.",
    },
  ];

  return (
    <section
      className="roadmap-section py-16 px-4 md:px-8 bg-black text-white relative"
      id="roadmap"
    >
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 animate-pulse bg-black via-green-700 to-purple-700 opacity-50 blur-2xl"></div>

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Section Title */}
        <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          Roadmap
        </h2>

        {/* Roadmap Timeline */}
        <div className="roadmap-container relative">
          {/* Vertical Timeline Line */}
          <div className="timeline absolute left-1/2 transform -translate-x-1/2 w-1 bg-green-500 h-full"></div>

          {/* Roadmap Phases */}
          <ul className="space-y-12 flex items-center flex-col">
            {roadmapPhases.map((item, index) => (
              <li
                key={index}
                className="relative flex items-center group transition-all duration-300"
              >
                {/* Phase Marker */}
                <div className="phase-marker w-16 h-16 flex items-center justify-center rounded-full shadow-lg border-2 border-green-500 bg-black/70 backdrop-blur-md transition-transform group-hover:scale-110">
                  <span className="text-green-400 text-2xl font-bold">
                    {index + 1}
                  </span>
                </div>

                {/* Phase Card */}
                <div className="phase-card ml-6 p-6 bg-black/60 border border-green-500 rounded-lg shadow-lg backdrop-blur-lg group-hover:scale-105 transition-transform duration-300">
                  <h3 className="text-2xl font-semibold text-purple-400 mb-2">
                    {item.phase}
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Left Image */}
      <div className="absolute bottom-4 left-4">
        <Image
          src="/images/roadmap.png"
          alt="Monkey Sol Inu Roadmap"
          width={192}
          height={192}
          className="rounded-lg shadow-[0_0_15px_rgba(0,255,135,0.7)] backdrop-blur-md"
        />
      </div>
    </section>
  );
};

export default RoadmapSection;
