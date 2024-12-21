"use client";
import React from "react";
import Link from "next/link";

export default function DocumentationPage() {
  const docs = [
    {
      title: "Shadow the Hedgehog Ecosystem Overview",
      description:
        "Learn about the utilities, vision, and growth plans of Shadow the Hedgehog. Discover how the ecosystem brings value to its community and expands through innovation.",
      href: "/docs/overview",
    },
    {
      title: "Security Best Practices",
      description:
        "Understand how to interact securely with the Shadow the Hedgehog ecosystem. Learn tips and practices to keep your tokens and data safe.",
      href: "/docs/security-best-practices",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-black text-white relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-black via-green-700 to-purple-700 opacity-50 blur-2xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Title */}
        <h1 className="text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          Comprehensive Documentation
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Access guides, technical details, and essential resources to fully
          leverage the Shadow the Hedgehog ecosystem.
        </p>

        {/* Documentation Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {docs.map((doc, index) => (
            <div
              key={index}
              className="p-6 bg-black/70 border border-green-500 rounded-lg shadow-lg backdrop-blur-lg hover:shadow-[0_0_20px_rgba(0,255,135,0.8)] transform hover:scale-105 transition-transform duration-300"
            >
              {/* Title */}
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  index % 2 === 0 ? "text-green-400" : "text-purple-400"
                }`}
              >
                {doc.title}
              </h2>

              {/* Description */}
              <p className="text-gray-300 mb-4">{doc.description}</p>

              {/* Read More Link */}
              <Link
                href={doc.href}
                className="text-green-400 hover:text-green-300 inline-block transition duration-300"
              >
                Read more →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
