"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const ResourcesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("blog");

  const posts = [
    {
      title: "How Monkey Sol Inu Reshapes Meme Utility",
      href: "/blog/meme-utility",
      description:
        "Explore how Monkey Sol Inu combines meme culture with real utility, driving innovation in the crypto space.",
      previewImage: "/images/utility.webp",
    },
    {
      title: "The Role of GameFi in the MSI Ecosystem",
      href: "/blog/gamefi-role",
      description:
        "Discover how Monkey Sol Inu introduces fun and rewarding GameFi elements to keep the community engaged.",
      previewImage: "/images/gamefinew.webp",
    },
    {
      title: "The Resilience of Monkey Sol Inu",
      href: "/blog/community-resilience",
      description:
        "Learn how the community bounced back stronger than ever after the GemPad incident.",
      previewImage: "/images/supermonkey.webp",
    },
  ];

  return (
    <section
      className="resources-section py-16 px-4 md:px-8 bg-black relative"
      id="resources"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-black via-green-700 to-purple-700 opacity-50 blur-2xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          Resources
        </h2>
        <div className="h-1 bg-purple-400 mb-8 mx-auto w-1/4 rounded"></div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              activeTab === "blog"
                ? "bg-gradient-to-r from-green-400 to-purple-400 text-black shadow-lg"
                : "bg-black border border-gray-600 hover:bg-purple-700 hover:text-white"
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveTab("documentation")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              activeTab === "documentation"
                ? "bg-gradient-to-r from-purple-400 to-green-400 text-black shadow-lg"
                : "bg-black border border-gray-600 hover:bg-green-700 hover:text-white"
            }`}
          >
            Documentation
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-black/60 rounded-xl backdrop-blur-lg shadow-lg">
          {activeTab === "blog" ? (
            <div>
              <h3 className="text-2xl font-semibold text-green-400 mb-4">
                Explore the Latest from Monkey Sol Inu
              </h3>
              <p className="text-gray-300 mb-6">
                Stay updated with the latest developments, insights, and stories
                from the Monkey Sol Inu ecosystem.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <div
                    key={index}
                    className="p-4 bg-black/80 border border-green-500 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,255,135,0.8)] transform hover:scale-105 transition-transform"
                  >
                    <Link href={post.href} passHref>
                      <div className="flex flex-col items-center text-center cursor-pointer">
                        <Image
                          src={post.previewImage}
                          alt={post.title}
                          width={300}
                          height={200}
                          className="rounded-md mb-4"
                        />
                        <h4 className="text-xl font-semibold text-purple-400 mb-2">
                          {post.title}
                        </h4>
                        <p className="text-gray-300">{post.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-green-400">
                Comprehensive Documentation
              </h3>
              <p className="text-gray-300 mb-6">
                Access guides, technical details, and essential resources to
                fully leverage the Monkey Sol Inu ecosystem.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-black/80 border border-green-500 rounded-lg shadow-lg">
                  <h4 className="text-xl font-semibold italic text-purple-400 mb-2">
                    Monkey Sol Inu Ecosystem Overview
                  </h4>
                  <p className="text-gray-300">
                    Learn about the utilities, vision, and growth plans of Monkey Sol Inu.
                  </p>
                  <Link
                    href="/docs/overview"
                    className="text-white hover:text-green-300 mt-2 inline-block transition"
                  >
                    Read more →
                  </Link>
                </div>
                <div className="p-4 bg-black/80 border border-green-500 rounded-lg shadow-lg">
                  <h4 className="text-xl font-semibold italic text-purple-400 mb-2">
                    Security Best Practices
                  </h4>
                  <p className="text-gray-300">
                    Understand how to interact securely with the Monkey Sol Inu ecosystem.
                  </p>
                  <Link
                    href="/docs/security-best-practices"
                    className="text-white hover:text-green-300 mt-2 inline-block transition"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
