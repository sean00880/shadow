"use client";
import React from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";

const posts = [
  {
    title: "How Monkey Sol Inu Reshapes Meme Utility",
    href: "meme-utility",
    content: (
      <>
        <div className="lg:ml-[26%] mt-[10vh] flex flex-col items-center p-6 glassmorphism rounded-xl shadow-2xl backdrop-blur-lg transition-transform">
          <Image
            src="/images/utility.webp"
            alt="Meme Utility"
            width={1000}
            height={400}
            className="rounded-lg shadow-lg transform hover:scale-105 my-10 transition-transform duration-500"
          />
          <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
            How Monkey Sol Inu Reshapes Meme Utility
          </h1>
          <div className="w-full h-[2px] bg-green-400 mb-6"></div>
          <p className="text-lg mb-6 text-gray-200 text-center">
            Explore how Monkey Sol Inu blends meme culture with real-world
            utility, pushing the boundaries of what a meme token can achieve in
            the blockchain space.
          </p>

          <h3 className="text-3xl font-semibold mb-4 text-green-400">
            Key Features:
          </h3>
          <ul className="list-disc ml-6 space-y-2 text-gray-200 text-lg">
            <li>
              <strong>Utility Integration:</strong> Real tools that serve the
              community and ecosystem.
            </li>
            <li>
              <strong>Community Support:</strong> Memes, rewards, and engagement
              fuel the growth of the Monkey Sol Inu token.
            </li>
            <li>
              <strong>Creative Initiatives:</strong> Viral campaigns that bring
              utility and memes together.
            </li>
          </ul>

          <Image
            src="/images/LOGODARK.png"
            alt="MSI Logo"
            width={500}
            height={500}
            className="my-8 rounded-lg transform hover:scale-105 transition duration-500"
          />

          <p className="text-lg text-gray-200 mt-6">
            By combining viral meme energy with tangible blockchain utilities,
            Monkey Sol Inu is reshaping the perception of meme coins. This is a
            token built to entertain and deliver real value.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "The Role of GameFi in the MSI Ecosystem",
    href: "gamefi-role",
    content: (
      <>
        <div className="lg:ml-[26%] mt-[10vh] flex flex-col items-center p-6 glassmorphism rounded-xl shadow-2xl backdrop-blur-lg transition-transform">
          <Image
            src="/images/gamefi.png"
            alt="GameFi Role"
            width={1000}
            height={400}
            className="rounded-lg shadow-lg transform hover:scale-105 my-10 transition-transform duration-500"
          />
          <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
            The Role of GameFi in the MSI Ecosystem
          </h1>
          <div className="w-full h-[2px] bg-purple-400 mb-6"></div>
          <p className="text-lg mb-6 text-gray-200 text-center">
            Monkey Sol Inu introduces GameFi elements to enhance engagement,
            offering fun, interactive mini-games with tangible rewards for
            community members.
          </p>

          <h3 className="text-3xl font-semibold mb-4 text-purple-400">
            Key GameFi Features:
          </h3>
          <ul className="list-disc ml-6 space-y-2 text-gray-200 text-lg">
            <li>
              <strong>TAP to EARN Mini-Games:</strong> Earn $MSI and partner
              tokens while playing addictive games.
            </li>
            <li>
              <strong>Marketing Missions:</strong> Engage in community-driven
              missions to earn rewards.
            </li>
            <li>
              <strong>Collaborations:</strong> Partnerships that expand the
              GameFi experience.
            </li>
          </ul>

          <Image
            src="/images/gamefi.gif"
            alt="MSI GameFi"
            width={500}
            height={500}
            className="my-8 rounded-lg transform hover:scale-105 transition duration-500"
          />

          <p className="text-lg text-gray-200 mt-6">
            GameFi within Monkey Sol Inu is about creating an experience where
            users can play, earn, and engage—all while contributing to the
            growth of the ecosystem. This isn't just gaming—it's GameFi with
            purpose.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "The Resilience of Monkey Sol Inu",
    href: "community-resilience",
    content: (
      <>
        <div className="lg:ml-[26%] mt-[10vh] flex flex-col items-center p-6 glassmorphism rounded-xl shadow-2xl backdrop-blur-lg transition-transform ">
          <Image
            src="/images/supermonkey.webp"
            alt="Community Resilience"
            width={1000}
            height={400}
            className="rounded-lg shadow-lg transform hover:scale-105 my-10 transition-transform duration-500"
          />
          <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
            The Resilience of Monkey Sol Inu
          </h1>
          <div className="w-full h-[2px] bg-green-400 mb-6"></div>
          <p className="text-lg mb-6 text-gray-200 text-center">
            Despite the challenges, the Monkey Sol Inu community proved its
            strength and determination by bouncing back stronger after the
            GemPad incident.
          </p>

          <h3 className="text-3xl font-semibold mb-4 text-green-400">
            Lessons in Resilience:
          </h3>
          <ul className="list-disc ml-6 space-y-2 text-gray-200 text-lg">
            <li>
              <strong>Community First:</strong> Supportive members rallied
              together, showing unmatched dedication.
            </li>
            <li>
              <strong>Adapting and Growing:</strong> The project restructured,
              introducing new utilities and features.
            </li>
            <li>
              <strong>Looking Forward:</strong> Monkey Sol Inu remains focused
              on delivering long-term value and innovation.
            </li>
          </ul>
        </div>
      </>
    ),
  },
];

export default function BlogPost() {
  const params = useParams();
  const slug = params?.slug;

  const postContent = posts.find((post) => post.href === slug);

  if (!postContent) {
    return notFound();
  }

  return <div className="p-4">{postContent.content}</div>;
}
