// src/components/Footer.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTelegramPlane, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (

    
    <footer className="bg-black text-white py-12 bottom-0 w-full z-30">
      <div className="text-center items-center flex flex-col">

<Image
  src="/images/MSIonSol.png"
  alt="Banner Image"
  className="w-full rounded-lg"
  width={1500}
  height={500}
/>
</div>
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center">
        {/* Left Section - Logo and Subtitle */}
        <div className="mb-8 md:mb-0 flex flex-col items-center">
          <Image
            src="/images/LOGODARK.png" // Replace with your logo path
            alt="Logo"
            width={200}
            height={40}
            className="mb-2 h-auto w-full"
          />
          <p className="text-gray-400">Connecting Communities through Memes and DeFi.</p>
        </div>

        {/* Center Section - Links */}
        <div className="flex flex-col md:flex-row justify-between w-full md:w-2/3">
          {/* Menu Links */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Menu</h3>
            <ul>
              <li className="mb-1 hover:text-green-400">
                <Link href="/#home">Home</Link>
              </li>
              <li className="mb-1 hover:text-green-300">
                <Link href="/#about">About</Link>
              </li>
              <li className="mb-1 hover:text-green-300">
                <Link href="/#tokenomics">Tokenomics</Link>
              </li>
              <li className="mb-1 hover:text-green-300">
                <Link href="/#roadmap">Roadmap</Link>
              </li>
              <li className="mb-1 hover:text-green-300">
                <Link href="/#whitepaper">Whitepaper</Link>
              </li>
              <li className="mb-1 hover:text-green-300">
                <Link href="/#resources">Resources</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Legal</h3>
            <ul>
              <li className="mb-1 hover:text-green-300">
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li className="mb-1 hover:text-green-300">
                <Link href="/terms-of-use">Terms of Use</Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold mb-2">Connect with Us</h3>
            <div className="flex space-x-4">
              <a href="https://t.me/your-telegram-link" target="_blank" rel="noopener noreferrer" className="hover:text-green-300">
                <FaTelegramPlane size={24} />
              </a>
              <a href="https://twitter.com/your-twitter-link" target="_blank" rel="noopener noreferrer" className="hover:text-green-300">
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mt-8 text-center text-gray-300 border-t border-[#ffbf00] pt-4">
        &copy; PabloCRO | 2024 | Powered by MSI
      </div>
    </footer>
  );
};

export default Footer;
