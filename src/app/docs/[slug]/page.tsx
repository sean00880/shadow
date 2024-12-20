"use client";
import React from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";

const docs = [
  {
    title: "Monkey Sol Inu Ecosystem Overview",
    href: "ecosystem-overview",
    content: (
      <>
        <div className="lg:ml-[26%] mt-[10vh] flex flex-col items-center p-6 bg-black/70 rounded-xl shadow-lg backdrop-blur-lg transition-transform hover:shadow-[0_0_20px_rgba(0,255,135,0.8)]">
          <Image
            src="/images/ecosystem-overview.png"
            alt="Monkey Sol Inu Ecosystem Overview"
            width={1000}
            height={400}
            className="rounded-lg shadow-lg transform hover:scale-105 my-10 transition-transform duration-500"
          />
          <h1 className="text-5xl font-extrabold mb-4 text-green-400 text-center">
            Monkey Sol Inu Ecosystem Overview
          </h1>
          <div className="w-full h-[2px] bg-green-500 mb-6"></div>
          <p className="text-lg text-gray-300 mb-6 text-center">
            Discover the vision, utilities, and growth plans of the Monkey Sol
            Inu ecosystem. Learn how it’s driving value and innovation within
            the blockchain space.
          </p>
          <h3 className="text-3xl font-semibold mb-4 text-purple-400">
            Core Features:
          </h3>
          <ul className="list-disc ml-6 text-lg text-gray-300 space-y-2">
            <li>
              <strong>Utility-Driven Ecosystem:</strong> Combines DeFi tools
              with real-world value.
            </li>
            <li>
              <strong>Community-Centric Growth:</strong> A thriving community
              driving the project’s success.
            </li>
            <li>
              <strong>Innovative Initiatives:</strong> Explore utilities like
              TickerTrending, MSI Cards, and GameFi features.
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: "How to Use MSI Cards",
    href: "msi-cards-guide",
    content: (
      <>
        <div className="lg:ml-[26%] mt-[10vh] flex flex-col items-center p-6 bg-black/70 rounded-xl shadow-lg backdrop-blur-lg transition-transform hover:shadow-[0_0_20px_rgba(138,43,226,0.8)]">
          <Image
            src="/images/msi-cards.png"
            alt="MSI Cards Guide"
            width={1000}
            height={400}
            className="rounded-lg shadow-lg transform hover:scale-105 my-10 transition-transform duration-500"
          />
          <h1 className="text-5xl font-extrabold mb-4 text-purple-400 text-center">
            How to Use MSI Cards
          </h1>
          <div className="w-full h-[2px] bg-purple-500 mb-6"></div>
          <p className="text-lg text-gray-300 mb-6 text-center">
            Learn how to seamlessly use MSI Cards for your transactions. From
            virtual prepaid cards to gold-brushed physical options, MSI Cards
            make payments easy and secure.
          </p>
          <h3 className="text-3xl font-semibold mb-4 text-green-400">
            Key Features:
          </h3>
          <ul className="list-disc ml-6 text-lg text-gray-300 space-y-2">
            <li>
              <strong>Customizable Options:</strong> Choose between virtual,
              physical, and gift cards.
            </li>
            <li>
              <strong>Seamless Transactions:</strong> Experience fast, secure
              payments for personal and gift use.
            </li>
            <li>
              <strong>Support for Ecosystem:</strong> Contributions help fund
              Monkey Sol Inu’s growth.
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: "Security Best Practices in Monkey Sol Inu",
    href: "security-best-practices",
    content: (
      <>
        <div className="lg:ml-[26%] mt-[10vh] flex flex-col items-center p-6 bg-black/70 rounded-xl shadow-lg backdrop-blur-lg transition-transform">
          <Image
            src="/images/security.webp"
            alt="Security Best Practices"
            width={1000}
            height={400}
            className="rounded-lg shadow-lg transform hover:scale-105 my-10 transition-transform duration-500"
          />
          <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
            Security Best Practices in Monkey Sol Inu
          </h1>
          <div className="w-full h-[2px] bg-green-500 mb-6"></div>
          <p className="text-lg text-gray-300 mb-6 text-center">
            Learn how to stay secure while interacting with the Monkey Sol Inu
            ecosystem. Protect your tokens and transactions with these best
            practices.
          </p>
          <h3 className="text-3xl font-semibold mb-4 text-purple-400">
            Best Practices:
          </h3>
          <ul className="list-disc ml-6 text-lg text-gray-300 space-y-2">
            <li>
              <strong>Authentication Security:</strong> Use secure methods and
              enable 2FA.
            </li>
            <li>
              <strong>Data Privacy:</strong> Keep your sensitive data
              protected.
            </li>
            <li>
              <strong>Phishing Awareness:</strong> Avoid scams and fraudulent
              activities.
            </li>
          </ul>
        </div>
      </>
    ),
  },
];

export default function DocumentationPage() {
  const params = useParams();
  const slug = params?.slug;

  const docContent = docs.find((doc) => doc.href === slug);

  if (!docContent) {
    return notFound();
  }

  return <div className="p-4">{docContent.content}</div>;
}
