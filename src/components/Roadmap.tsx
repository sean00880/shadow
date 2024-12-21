"use client";
import React from "react";
import Image from "next/image";

const RoadmapSection: React.FC = () => {
  const roadmapPhases = [
    {
      phase: "Chaos is Online",
      description:
        "Shadow’s power awakens! Launch the Sonic Chain’s official website and socials with an edgy twist, ensuring the memes hit faster than a Chaos Spear.",
    },
    {
      phase: "Coin Listings of Ultimate Lifeforms",
      description:
        "Get listed on CoinMarketCap and CoinGecko faster than Shadow can say 'Maria.' These platforms will ensure every hedgehog enthusiast can track $SHADOW’s rise.",
    },
    {
      phase: "Chaos Blasts of Marketing",
      description:
        "Unleash meme campaigns that rival the strength of a Chaos Control. Partner with influencers who understand the meaning of edgy greatness.",
    },
    {
      phase: "Shadow vs Centralized Exchanges",
      description:
        "Take the fight to CEXs like a true ultimate lifeform. Listings on centralized exchanges will bring global attention to the Sonic Chain.",
    },
    {
      phase: "Chaos-Driven NFTs",
      description:
        "Launch NFT collections featuring Shadow in iconic poses: Chaos Control, ultimate grins, and memes like 'I am all of me!' A portion of proceeds will fuel development and community incentives.",
    },
    {
      phase: "Infinite Speed DeFi Network",
      description:
        "Release a decentralized network on the Sonic Chain that redefines speed and chaos. Meme creators, gamers, and hedgehog fans will unite in a space where innovation and fun collide.",
    },
  ];

  return (
    <section
      className="roadmap-section py-20 px-6 md:px-12 bg-gradient-to-b from-black via-[#1a1a1a] to-black text-white relative"
      id="roadmap"
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-black to-black opacity-60 blur-2xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-5xl font-extrabold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
          Roadmap of Chaos
        </h2>

        {/* Circular Roadmap Layout */}
        <div className="relative w-full h-[600px] md:h-[700px] mx-auto flex items-center justify-center">
          {/* Central Display */}
          <div className="relative w-[250px] h-[250px] md:w-[300px] md:h-[300px] bg-black/70 rounded-full shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold text-red-400 text-center">
              Current Phase
            </h3>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Explore Shadow’s roadmap to chaos and ultimate domination.
            </p>
            <div className="absolute inset-0 animate-spin-slow border-t-4 border-red-500 rounded-full"></div>
            <div className="absolute inset-4 animate-spin-reverse border-t-2 border-white rounded-full"></div>
          </div>

          {/* Interactive Phases */}
          {roadmapPhases.map((item, index) => (
            <div
              key={index}
              className={`absolute w-[200px] h-[200px] flex flex-col items-center justify-center text-center p-4 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg hover:scale-105 transition-all duration-300`}
              style={{
                transform: `rotate(${index * (360 / roadmapPhases.length)}deg) translate(300px) rotate(-${index * (360 / roadmapPhases.length)}deg)`,
              }}
            >
              <h4 className="text-md font-semibold text-red-400">
                {item.phase}
              </h4>
              <p className="text-sm text-gray-300 mt-2">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom Visual */}
        <div className="mt-16 flex justify-center">
          <Image
            src="/images/shadow2.gif"
            alt="Shadow Roadmap Art"
            width={500}
            height={400}
            className="rounded-[12vh] shadow-[0_0_30px_rgba(255,0,0,0.8)] hover:scale-105 transition-transform"
          />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 25s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default RoadmapSection;
