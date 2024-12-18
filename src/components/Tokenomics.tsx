"use client";
import React from "react";
import Image from "next/image";

const TokenomicsSection: React.FC = () => {
  return (
    <section
      className="tokenomics-section py-16 px-4 md:px-8 bg-black text-white relative"
      id="tokenomics"
    >
      {/* Holographic Background Gradient */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-black via-purple-700 to-transparent opacity-70 blur-2xl"></div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Tokenomics Content */}
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500 mb-6">
            Tokenomics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Supply */}
            <div className="p-6 bg-black/60 border border-purple-600 rounded-xl shadow-lg backdrop-blur-lg hover:shadow-[0_0_15px_rgba(138,43,226,0.8)] transform hover:scale-105 transition duration-300">
              <h3 className="text-2xl font-semibold text-purple-400 mb-2">
                Total Supply
              </h3>
              <p className="text-3xl font-bold text-green-400">1 Billion</p>
              <p className="mt-2 text-sm text-gray-300">
                Strategically set to ensure a balanced ecosystem and sustainable
                growth.
              </p>
              <Image
                src="/images/ML.gif"
                alt="Monkey Sol Inu Animation"
                width={300}
                height={200}
                className="mt-4 rounded-lg hover:opacity-90 transition duration-500"
              />
            </div>

            {/* Transaction Tax */}
            <div className="p-6 bg-black rounded-xl shadow-lg backdrop-blur-lg hover:shadow-[0_0_15px_rgba(0,255,135,0.7)] transform hover:scale-105 transition duration-300">
              <h3 className="text-2xl font-semibold text-purple-400 mb-2">
                Transaction Tax
              </h3>
              <p className="text-lg">
                <strong className="text-green-400">Buy:</strong> 0%
                <br />
                <strong className="text-green-400">Transfer:</strong> 0%
                <br />
                <strong className="text-green-400">Sell:</strong> 0%
              </p>
              <p className="mt-2 text-sm text-gray-300">
                0% tax for a fair and transparent marketplace. 
              </p>
            </div>
          </div>

          {/* Detailed Overview */}
          <div className="p-6 bg-black/60 border border-purple-600 rounded-xl shadow-lg backdrop-blur-lg hover:shadow-[0_0_15px_rgba(138,43,226,0.8)] transition-transform duration-300">
            <h3 className="text-2xl font-semibold text-green-400 mb-4">
              Detailed Tokenomics Overview
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li>
                <strong className="text-purple-400">1. Total Supply:</strong> 1
                Billion tokens designed for ecosystem sustainability and
                long-term development.
              </li>
              <li>
                <strong className="text-purple-400">2. Transaction Tax:</strong>{" "}
                No tax on transactions.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Parallax Image */}
        <div className="relative flex justify-center items-center">
          <div className="w-full md:w-auto rounded-xl overflow-hidden backdrop-blur-lg h-[80%] shadow-[0_0_25px_rgba(138,43,226,0.9)] transition-transform duration-500 hover:scale-105">
            <Image
              src="/images/inu.webp"
              alt="Tokenomics Visual"
              width={500}
              height={400}
              className="w-full h-auto animate-fade-in hover:opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Animated Parallax Effect */}
      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0.7;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadein 3s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
};

export default TokenomicsSection;
