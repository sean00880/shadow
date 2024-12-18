"use client";
import React, { useState } from "react";
import Image from "next/image";

const TabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("utility");

  const tabs = [
    { id: "utility", title: "TickerTrending" },
    { id: "msicards", title: "MSI Cards" },
    { id: "msishop", title: "MSI Shop" },
  ];

  const content = {
    utility: {
      title: "Key Features of TickerTrending",
      features: [
        "Real-Time Price and Market Data: Stay ahead of the market with up-to-the-minute price data for meme coins.",
        "Advanced Analytics and Sentiment Analysis: Gain insights into market trends with powerful analytics.",
        "Community-Driven Voting System: Influence token rankings through upvotes and downvotes.",
        "Comprehensive Token Listings: Discover trending meme coins with real-time performance data.",
        "And More: Explore influencer profiles and secret features for a complete tracking experience.",
      ],
      image: "/images/tickertrending.png",
    },
    msicards: {
      title: "Key Features of MSI Cards",
      features: [
        "Exclusive and Customizable MSI Cards: Virtual and physical crypto-funded cards for top global brands.",
        "Seamless Payment Experience: Simple and secure transactions for personal and gift purposes.",
        "Direct Support for the MSI Ecosystem: A portion of proceeds supports community projects and utilities.",
        "Exciting Perks and Collaborations: Special editions, brand collaborations, and secret perks.",
      ],
      image: "/images/msicard.webp",
    },
    msishop: {
      title: "Key Features of MSI Shop",
      features: [
        "Unique and Customizable MSI Merchandise: TurdShirts, Poodies, CrapCaps, and more creative swag.",
        "Seamless Shopping Experience: Intuitive interface, secure payments, and fast delivery.",
        "Direct Support for the MSI Ecosystem: A portion of proceeds helps fund MSI community initiatives.",
        "And More: Limited-edition items, collaborations, and surprises for the MSI community.",
      ],
      image: "/images/MSISHOP.gif",
    },
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-black text-white relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-black via-green-600 to-purple-600 opacity-50 blur-2xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          Explore MSI Utilities
        </h2>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8 space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-green-400 text-black shadow-lg"
                  : "bg-black border border-gray-600 hover:bg-purple-700 hover:text-white"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Content Based on Active Tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Content */}
          <div className="space-y-4 p-6 bg-white/70 rounded-xl backdrop-blur-lg shadow-lg">
  <h3 className="text-3xl font-semibold text-black mb-4">
    {content[activeTab as keyof typeof content].title}
  </h3>
  <ul className="list-disc list-inside space-y-2 text-black">
    {content[activeTab as keyof typeof content].features.map(
      (feature, index) => (
        <li
          key={index}
          className="hover:text-green-800 transition duration-300"
        >
          {feature}
        </li>
      )
    )}
  </ul>
</div>


          {/* Right: Visual */}
          <div className="flex justify-center">
            <Image
              src={content[activeTab as keyof typeof content].image}
              alt={content[activeTab as keyof typeof content].title}
              width={500}
              height={400}
              className="rounded-lg bg-[#0d0d0d] shadow-[0_0_20px_rgba(138,43,226,0.8)] hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Bottom Visual */}
        <div className="mt-8 p-4 text-center text-black bg-gradient-to-r from-green-400 to-purple-400 rounded-lg shadow-lg animate-pulse">
          <p className="text-sm font-mono">
            Monkey Sol Inu: Utilities that drive real value and community growth.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
