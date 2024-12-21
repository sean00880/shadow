"use client";
import React from "react";
import Image from "next/image";

const TokenomicsSection: React.FC = () => {
  return (
    <section
      className="tokenomics-section py-20 px-6 md:px-12 bg-gradient-to-b from-black via-[#1a1a1a] to-black text-white relative overflow-hidden"
      id="tokenomics"
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-black to-black opacity-60 blur-2xl"></div>
      <div className="absolute top-[-100px] left-[50%] transform -translate-x-1/2 w-[1200px] h-[1200px] bg-red-700/10 rounded-full animate-pulse"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-5xl font-extrabold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
          Shadow Tokenomics
        </h2>

        {/* Interactive Rotational Layout */}
        <div className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center">
          {/* Rotational Centerpiece */}
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-black/70 rounded-full shadow-lg flex flex-col items-center justify-center backdrop-blur-lg">
            <div className="absolute inset-0 animate-spin-slow border-t-4 border-red-500 rounded-full"></div>
            <div className="absolute inset-4 animate-spin-reverse border-t-2 border-white rounded-full"></div>
            <h3 className="text-xl font-semibold text-red-400 mb-2 text-center">
              Total Supply
            </h3>
            <p className="text-3xl font-bold text-white">1 Billion</p>
            <p className="text-sm text-gray-400 mt-1 text-center">
              A robust supply fueling growth and scalability.
            </p>
          </div>

          {/* Rotational Elements */}
          <div className="absolute w-full h-full flex items-center justify-center">
            {/* Point 1 */}
            <div
              className="absolute w-[150px] h-[150px] bg-black/70 backdrop-blur-lg rounded-lg shadow-lg flex flex-col items-center justify-center text-center transform hover:scale-110 transition-all duration-300"
              style={{ transform: "translate(-250px, -50px)" }}
            >
              <h4 className="text-md font-semibold text-red-400">
                Transaction Tax
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                <strong className="text-white">Buy:</strong> 0% <br />
                <strong className="text-white">Sell:</strong> 0%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ensuring fairness and transparency.
              </p>
            </div>

            {/* Point 2 */}
            <div
              className="absolute w-[150px] h-[150px] bg-black/70 backdrop-blur-lg rounded-lg shadow-lg flex flex-col items-center justify-center text-center transform hover:scale-110 transition-all duration-300"
              style={{ transform: "translate(250px, -50px)" }}
            >
              <h4 className="text-md font-semibold text-red-400">
                Chaos Energy
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                Powering unmatched scalability and speed.
              </p>
            </div>

            {/* Point 3 */}
            <div
              className="absolute w-[150px] h-[150px] bg-black/70 backdrop-blur-lg rounded-lg shadow-lg flex flex-col items-center justify-center text-center transform hover:scale-110 transition-all duration-300"
              style={{ transform: "translate(-250px, 150px)" }}
            >
              <h4 className="text-md font-semibold text-red-400">
                Community Rewards
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                Incentives and rewards for active participants.
              </p>
            </div>

            {/* Point 4 */}
            <div
              className="absolute w-[150px] h-[150px] bg-black/70 backdrop-blur-lg rounded-lg shadow-lg flex flex-col items-center justify-center text-center transform hover:scale-110 transition-all duration-300"
              style={{ transform: "translate(250px, 150px)" }}
            >
              <h4 className="text-md font-semibold text-red-400">
                Future Expansion
              </h4>
              <p className="text-sm text-gray-300 mt-2">
                Scaling the ecosystem with innovative utilities.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Reveal Animation */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative p-6 bg-black/70 rounded-xl shadow-lg backdrop-blur-lg hover:scale-105 transition-transform duration-300">
            <h4 className="text-xl font-semibold text-red-400 mb-4">
              Zero Transaction Tax
            </h4>
            <p className="text-gray-300">
              Ensures a fair and open environment, maximizing community participation.
            </p>
          </div>
          <div className="relative p-6 bg-black/70 rounded-xl shadow-lg backdrop-blur-lg hover:scale-105 transition-transform duration-300">
            <h4 className="text-xl font-semibold text-red-400 mb-4">
              Chaos Energy Utility
            </h4>
            <p className="text-gray-300">
              Harnesses the power of Chaos Energy to fuel DeFi and GameFi with
              unmatched speed and scalability.
            </p>
          </div>
        </div>

        {/* Bottom Visual */}
        <div className="mt-16 flex justify-center">
          <Image
            src="/images/shadow.gif"
            alt="Shadow Tokenomics Hero Art"
            width={500}
            height={400}
            className="rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.8)] hover:scale-105 transition-transform"
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
          animation: spin-slow 12s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </section>
  );
};

export default TokenomicsSection;
