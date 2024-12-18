"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroSection: React.FC = () => {
  return (
    <section
      className="hero-section flex items-center md:mt-0 h-screen justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/monkeybg.webp')" }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#000] bg-opacity-70"></div>

      {/* Foreground Content */}
      <div className="z-10  grid grid-cols-1 md:grid-cols-2 w-full h-full">
        {/* Left Column */}
        <div className="hidden md:flex items-center justify-center text-left w-full">
          <Image
            src="/images/MSITOKEN.png"
            width={1000}
            height={1000}
            alt="Monkey Shit Inu Logo"
            className="w-full max-w-[400px]"
          />
        </div>

        {/* Right Column */}
        <div
          className="relative pt-0 md:pt-[20vh] flex flex-col justify-center items-center text-white h-full w-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.8))",
          }}
        >
          {/* Hero Image */}
          <Image
            src="/images/MSIblue.png"
            width={300}
            height={300}
            alt="Monkey Shit Inu Logo"
            className="w-[230px] mb-6"
          />

          {/* Subtitle */}
          <p className="text-lg mb-6 leading-relaxed">
            A monkey who never quits with the last name <strong>INU</strong>.
          </p>

          {/* Contract Address with Rotating Glow */}
          <div className="relative flex items-center justify-center">
            <div className="relative bg-white text-black px-6 py-3 rounded-md font-bold shadow-lg z-10">
              <span className="font-mono">0xYourContractAddressHere</span>
            </div>
            {/* Glowing Rotating Ring */}
            <div
              className="absolute inset-0 rounded-full animate-spin-slow -z-10"
              style={{
                background: "conic-gradient(#00FF87, #8A2BE2, #00FF87)",
                filter: "blur(10px)",
              }}
            ></div>
          </div>

          {/* Social Media Links */}
          <div className="bg-black/50 backdrop-blur-lg p-4 rounded-xl shadow-lg flex justify-center space-x-4 w-full mt-6">
            <Link href="https://x.com/MonkeyShitInu">
              <Image
                src="/icons/x.png"
                width={50}
                height={50}
                alt="Twitter"
                className="rounded-full hover:scale-105 transition"
              />
            </Link>
            <Link href="https://t.me/MonkeyShitInu">
              <Image
                src="/icons/telegram.png"
                width={50}
                height={50}
                alt="Telegram"
                className="rounded-full hover:scale-105 transition"
              />
            </Link>
            <Link href="https://www.dextools.io/">
              <Image
                src="/icons/dextools.png"
                width={50}
                height={50}
                alt="DexTools"
                className="rounded-full hover:scale-105 transition"
              />
            </Link>
            <Link href="https://www.linktree.com/msi">
              <Image
                src="/icons/linktree.png"
                width={50}
                height={50}
                alt="Linktree"
                className="rounded-full bg-white hover:scale-105 transition"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
