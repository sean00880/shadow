"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const UtilitySection: React.FC = () => {
  return (
    <section id="utilities" className="py-16 px-4 md:px-8 bg-gradient-to-b from-black via-[#1a1a1a] to-black text-white relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-black to-black opacity-60 blur-2xl animate-pulse"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white glitch-text">
          Virtual Website Game Emulator
        </h2>

        {/* Utility Content */}
        <div className="flex flex-col gap-8 items-center">

             {/* Right: Visual */}
             <div className="relative flex justify-center">
            {/* Glitch Animation */}
            <div className="glitch-container">
              <Image
                src="/images/virtual-emulator.png"
                alt="Virtual Website Game Emulator"
                width={500}
                height={400}
                className="rounded-lg bg-[#0d0d0d] shadow-[0_0_20px_rgba(255,0,0,0.8)] hover:scale-105 transition-transform glitch-image"
              />
              <div className="glitch-overlay"></div>
            </div>
          </div>
          
          {/* Left: Content */}
          <div className="space-y-6 p-6 bg-black/70 rounded-xl backdrop-blur-lg shadow-lg glitch-box">
            <h3 className="text-3xl font-semibold text-red-400 mb-4 glitch-title">Coming Soon</h3>
            <p className="text-gray-300 leading-relaxed">
              Step into the future with the Virtual Website Game Emulator—an immersive platform on the Sonic Chain. Seamlessly
              blending interactive web-based gaming with blockchain integration, this utility pushes the boundaries of GameFi.
            </p>
            <ul className="list-disc list-inside space-y-3 text-gray-300 mt-4">
              <li>Explore virtual gaming environments with real-time interaction.</li>
              <li>Integrate blockchain-powered features seamlessly with Chaos Energy.</li>
              <li>Experience ultra-fast transactions for GameFi projects.</li>
              <li>Leverage community-driven enhancements for a dynamic experience.</li>
            </ul>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-white text-black font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform neon-button"
              >
                Coming Soon
              </Link>
            </div>
          </div>

       
        </div>

        {/* Bottom Visual */}
        <div className="mt-12 p-4 text-center text-black bg-gradient-to-r from-red-500 to-white rounded-lg shadow-lg animate-glow">
          <p className="text-sm font-mono glitch-text">
            The Sonic Chain: Gaming meets blockchain in the most revolutionary way.
          </p>
        </div>
      </div>

      {/* Styling for Glitch Effects */}
      <style jsx>{`
        .glitch-text {
          animation: glitch 1s infinite;
          text-shadow: 2px 2px 5px rgba(255, 0, 0, 0.8), -2px -2px 5px rgba(0, 255, 255, 0.8);
        }

        @keyframes glitch {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-1px, -1px);
          }
          50% {
            transform: translate(1px, -1px);
          }
          75% {
            transform: translate(-1px, 1px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        .glitch-box {
          position: relative;
          overflow: hidden;
        }

        .glitch-title {
          animation: glitch-title 1s infinite;
        }

        @keyframes glitch-title {
          0% {
            text-shadow: 2px 2px 5px rgba(255, 0, 0, 0.8), -2px -2px 5px rgba(255, 255, 255, 0.8);
          }
          50% {
            text-shadow: 1px 1px 2px rgba(255, 0, 0, 0.5), -1px -1px 2px rgba(168, 255, 144, 0.97);
          }
          100% {
            text-shadow: 2px 2px 5px rgba(255, 0, 0, 0.8), -2px -2px 5px rgba(44, 41, 41, 0.8);
          }
        }

        .glitch-container {
          position: relative;
        }

        .glitch-image {
          animation: glitch-image 0.5s infinite;
        }

        @keyframes glitch-image {
          0% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(-2px, 1px);
          }
          66% {
            transform: translate(2px, -1px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        .glitch-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(235, 235, 235, 0.9), rgba(234, 234, 234, 0.87));
          mix-blend-mode: overlay;
          animation: glitch-overlay 1s infinite;
        }

        @keyframes glitch-overlay {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.5;
          }
        }

        .neon-button {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.4);
        }

        .animate-glow {
          animation: glow 2s infinite alternate;
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 0, 0, 1);
          }
        }
      `}</style>
    </section>
  );
};

export default UtilitySection;
