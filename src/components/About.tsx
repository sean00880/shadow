"use client";
import React, { useState } from "react";
import Image from "next/image";

interface AboutSectionProps {
  images: string[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ images }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const topFeatures = [
    {
      title: "The Monkey Who Refused to Quit",
      content:
        "After GemPad's breach cost us $400,000, Monkey Sol Inu stood tall. Failure wasn’t an option. The community rebuilt stronger, proving that resilience is part of our DNA.",
    },
    {
      title: "Banana-Powered Rewards",
      content:
        "Through meme challenges, contests, and fun events, the Monkey Sol Inu community can earn rewards and unlock new opportunities—bananas and tokens alike!",
    },
    {
      title: "Meme Culture Meets Utility",
      content:
        "It’s not just about laughs. Monkey Sol Inu integrates real DeFi tools with viral meme energy, building a platform where community and utility thrive.",
    },
  ];

  const bottomFeatures = [
    {
      title: "Community Resilience",
      content:
        "When others give up, the Monkey Sol Inu community climbs higher. We faced challenges head-on and emerged even stronger.",
    },
    {
      title: "Utility Beyond Memes",
      content:
        "Monkey Sol Inu is more than a token—it’s a revolution. We’re creating mini-games, earning tools, and interactive utilities for long-term growth.",
    },
    {
      title: "The Climb Continues",
      content:
        "We’re unstoppable. Monkey Sol Inu continues to build, evolve, and climb the blockchain jungle with fearless determination.",
    },
  ];

  return (
    <section id="about" className="py-16 px-4 md:px-8 bg-black text-white relative ">
      <div className="bg-[url('/images/monkeybg.png')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-purple-700 via-green-600 opacity-[10%] to-black blur-2xl"></div>

      <div className="max-w-6xl mx-auto relative z-10 ">
        {/* Top Section */}
        <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          What is Monkey Sol Inu?
        </h2>
<div className="flex flex-col md:flex-row">
        <div className="grid grid-cols-1 gap-6 ">
          {topFeatures.map((feature, index) => (
            <div
              key={index}
              onClick={() => toggleExpand(index)}
              className="feature-card p-4 bg-black/80 border border-purple-500 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,255,135,0.7)] transform hover:scale-105 transition-transform cursor-pointer relative"
            >
              {/* Toggle Button */}
              <div
                className={`absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white transition-transform duration-300 ${
                  expandedIndex === index ? "rotate-45" : "rotate-0"
                }`}
              >
                {expandedIndex === index ? "X" : "+"}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                {feature.title}
              </h3>

              {/* Content */}
              <div
                className={`text-sm text-gray-300 transition-all duration-500 overflow-hidden ${
                  expandedIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="pt-2">{feature.content}</p>
              </div>
            </div>
          ))}
        </div>
       
        {/* Top Visual */}
        <div className="mt-8 flex justify-center">
          <Image
            src="/images/monkeyson.jpg"
            alt="Monkey Sol Inu"
            width={400}
            height={300}
            className="rounded-lg shadow-[0_0_20px_rgba(138,43,226,0.8)] hover:scale-105 transition-transform"
          />
        </div>
</div>
        {/* Bottom Section */}
        <h2 className="text-4xl font-bold mt-16 mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
          Why Monkey Sol Inu?
        </h2>
          <div className="flex flex-col md:flex-row-reverse">
        <div className="grid grid-cols-1 gap-6">
          {bottomFeatures.map((feature, index) => (
            <div
              key={index + topFeatures.length}
              onClick={() => toggleExpand(index + topFeatures.length)}
              className="feature-card p-4 bg-black/80 border border-green-500 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(138,43,226,0.8)] transform hover:scale-105 transition-transform cursor-pointer relative"
            >
              {/* Toggle Button */}
              <div
                className={`absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white transition-transform duration-300 ${
                  expandedIndex === index + topFeatures.length
                    ? "rotate-45"
                    : "rotate-0"
                }`}
              >
                {expandedIndex === index + topFeatures.length ? "X" : "+"}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-purple-400 mb-2">
                {feature.title}
              </h3>

              {/* Content */}
              <div
                className={`text-sm text-gray-300 transition-all duration-500 overflow-hidden ${
                  expandedIndex === index + topFeatures.length
                    ? "max-h-96"
                    : "max-h-0"
                }`}
              >
                <p className="pt-2">{feature.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Visual */}
        <div className="mt-8 flex justify-center">
          <Image
            src="/images/1000x.png"
            alt="Why Monkey Sol Inu"
            width={400}
            height={300}
            className="rounded-lg shadow-[0_0_20px_rgba(0,255,135,0.8)] hover:scale-105 transition-transform"
          />
        </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default AboutSection;
