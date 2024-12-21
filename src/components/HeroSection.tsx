"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroSection: React.FC = () => {
  return (
    <section
      className="hero-section flex items-center md:mt-0 h-screen justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/sonic.gif')" }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a1a1a] to-[#000] opacity-60"></div>

      {/* Foreground Content */}
      <div className="z-10 flex  w-full h-full">
      
        {/* Right Column */}
        <div
          className="relative pt-0 md:pt-[20vh] flex flex-col justify-center items-center text-white h-full w-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.9))",
          }}
        >
          {/* Hero Image */}
          <Image
            src="/images/ShadowLogo.png"
            width={300}
            height={300}
            alt="Shadow the Hedgehog Icon"
            className="w-[230px] mb-6 animate-pulse"
          />

          {/* Subtitle */}
          <p className="text-lg mb-6 leading-relaxed text-gray-300">
            Harness the power of <strong className="text-red-600">Shadow</strong>. 
            Embrace the <span className="text-red-600">Sonic Chain.</span>
          </p>

          {/* Contract Address with Animated Glow */}
          <div className="relative flex items-center justify-center">
            <div className="relative bg-white text-black px-6 py-3 rounded-lg font-bold shadow-xl z-10">
              <span className="font-mono text-sm">
                0xa115DD97F66d63cD44d56f6B4d100C9efdd2203b
              </span>
            </div>
            {/* Glowing Animated Ring */}
            <div
              className="absolute inset-0 rounded-full animate-spin-slow -z-10"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, #FF0000, #8A2BE2, #FF0000)",
                filter: "blur(15px)",
              }}
            ></div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-2xl flex justify-center space-x-4 w-full mt-6">
            <Link href="https://x.com/shadow_token/">
              <Image
                src="/icons/x.png"
                width={50}
                height={50}
                alt="Twitter"
                className="rounded-full hover:scale-105 border-2 border-red-500 transition"
              />
            </Link>
            <Link href="https://t.me/shadowthehedgehog">
              <Image
                src="/icons/telegram.png"
                width={50}
                height={50}
                alt="Telegram"
                className="rounded-full hover:scale-105 border-2 border-red-500 transition"
              />
            </Link>
            <Link href="https://dexscreener.com/sonic/shadow">
              <Image
                src="/icons/dexscreener.png"
                width={50}
                height={50}
                alt="DexScreener"
                className="rounded-full bg-white hover:scale-105 transition border-2 border-red-500"
              />
            </Link>
            <Link href="https://www.dextools.io/app/en/sonic/pair-explorer/SHADOW">
              <Image
                src="/icons/dextools.png"
                width={50}
                height={50}
                alt="DexTools"
                className="rounded-full hover:scale-105 border-2 border-red-500"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
