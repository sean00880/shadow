"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="topbar flex items-center justify-between px-4 py-4 shadow-lg border-b border-[#ffbf00] relative z-50">
      {/* Hamburger Menu for Mobile */}
      <div className="flex md:hidden z-[60]">
        <button
          className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </button>
      </div>

      {/* Centered Logo Container */}
      <div className="flex-1 md:flex-none flex justify-center items-center">
        <Link href="#">
          <Image
            src="/images/LOGODARK.png"
            alt="Logo"
            width={240}
            height={40}
            className="glitch-effect"
          />
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex w-1/3 justify-end items-center space-x-4 lg:space-x-6">
        <Link href="/#home" className="hover:text-yellow-500 transition">
          Home
        </Link>
        <div className="group relative">
          <Link href="/#about" className="hover:text-yellow-500 transition">
            About
          </Link>
          {/* Submenu for About */}
          <div className="absolute left-[-120%] transform bg-black text-white p-2 rounded shadow-lg hidden group-hover:block">
            <Link
              href="/#defi-social-network"
              className="block px-2 py-1 hover:bg-gray-800 rounded"
            >
              DeFi Social Network
            </Link>
            <Link
              href="/#gamefi"
              className="block px-2 py-1 hover:bg-gray-800 rounded"
            >
              GameFi
            </Link>
            <Link
              href="/#memes"
              className="block px-2 py-1 hover:bg-gray-800 rounded"
            >
              Memes
            </Link>
          </div>
        </div>
        <Link href="/#tokenomics" className="hover:text-yellow-500 transition">
          Tokenomics
        </Link>
        <Link href="/#roadmap" className="hover:text-yellow-500 transition">
          Roadmap
        </Link>
        <Link href="/#whitepaper" className="hover:text-yellow-500 transition">
          Whitepaper
        </Link>
        <div className="group relative">
          <Link href="/#resources" className="hover:text-yellow-500 transition">
            Resources
          </Link>
          {/* Submenu for Resources */}
          <div className="absolute left-[-120%] transform bg-black text-white p-2 rounded shadow-lg hidden group-hover:block">
            <Link
              href="#blog"
              className="block px-2 py-1 hover:bg-gray-800 rounded"
            >
              Blog
            </Link>
            <Link
              href="#documentation"
              className="block px-2 py-1 hover:bg-gray-800 rounded"
            >
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="block absolute top-16 left-0 w-full bg-gray-900 text-white p-4 shadow-lg rounded-lg z-40">
          <Link
            href="/#home"
            className="block px-4 py-2 hover:bg-gray-800 rounded"
          >
            Home
          </Link>
          <div className="group relative">
            <Link
              href="/#about"
              className="block px-4 py-2 hover:bg-gray-800 rounded"
            >
              About
            </Link>
            <div className="pl-4 mt-2 hidden group-hover:block">
              <Link
                href="/#defi-social-network"
                className="block px-2 py-1 hover:bg-gray-800 rounded"
              >
                DeFi Social Network
              </Link>
              <Link
                href="/#gamefi"
                className="block px-2 py-1 hover:bg-gray-800 rounded"
              >
                GameFi
              </Link>
              <Link
                href="/#memes"
                className="block px-2 py-1 hover:bg-gray-800 rounded"
              >
                Memes
              </Link>
            </div>
          </div>
          <Link
            href="/#tokenomics"
            className="block px-4 py-2 hover:bg-gray-800 rounded"
          >
            Tokenomics
          </Link>
          <Link
            href="/#roadmap"
            className="block px-4 py-2 hover:bg-gray-800 rounded"
          >
            Roadmap
          </Link>
          <Link
            href="/#whitepaper"
            className="block px-4 py-2 hover:bg-gray-800 rounded"
          >
            Whitepaper
          </Link>
          <div className="group relative">
            <Link
              href="/#resources"
              className="block px-4 py-2 hover:bg-gray-800 rounded"
            >
              Resources
            </Link>
            <div className="pl-4 mt-2 hidden group-hover:block">
              <Link
                href="#blog"
                className="block px-2 py-1 hover:bg-gray-800 rounded"
              >
                Blog
              </Link>
              <Link
                href="#documentation"
                className="block px-2 py-1 hover:bg-gray-800 rounded"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hamburger Button Styling */}
      <style jsx>{`
        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 60;
        }
        .line {
          width: 100%;
          height: 2px;
          background-color: #ffffff;
          transition: all 0.3s ease;
        }
        .hamburger.open .line:nth-child(1) {
          transform: rotate(45deg) translateY(6px);
        }
        .hamburger.open .line:nth-child(2) {
          opacity: 0;
        }
        .hamburger.open .line:nth-child(3) {
          transform: rotate(-45deg) translateY(-6px);
        }
      `}</style>
    </div>
  );
}
