"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Feature {
  title: string;
  shortText: string;
  expandedText: string;
  image: string;
}

interface AboutSectionProps {
  features: Feature[];
  images: string[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ features, images }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(images[0] || "/images/default_logo.png");

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  return (
    <section
      className="about-section bg-gradient-to-b from-black via-[#1a1a1a] to-black text-white py-16 px-6 lg:px-12 relative"
      id="about"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-600 via-black to-black opacity-80"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <h2 className="text-4xl mb-12 text-center text-transparent w-full bg-clip-text bg-gradient-to-r from-green-500 to-white">
          About $SHADOW
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative bg-black/50 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.8)] cursor-pointer ${
                expandedIndex === index ? "border border-green-500" : ""
              }`}
              onClick={() => toggleExpand(index)}
            >
              {/* Feature Image */}
              <div className="w-full h-40 mb-4 relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-md"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-green-400 mb-2">{feature.title}</h3>

              {/* Short and Expanded Text */}
              <div
                className="text-sm text-gray-300 transition-all duration-300"
                style={{
                  maxHeight: expandedIndex === index ? "200px" : "50px", // Control the height for smooth expansion
                  overflow: "hidden",
                }}
              >
                <p>{expandedIndex === index ? feature.expandedText : feature.shortText}</p>
              </div>

              {/* Placeholder for consistent height */}
              <div className="transition-all duration-300" style={{ height: expandedIndex === index ? "auto" : "0" }}></div>

              {/* Rotating Button Indicator */}
              <div
                className={`absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-black transition-transform duration-300 ${
                  expandedIndex === index ? "rotate-45" : "rotate-0"
                }`}
              >
                {expandedIndex === index ? "−" : "+"}
              </div>
            </div>
          ))}
        </div>

        {/* Image Gallery */}
        <div className="mt-16">
          <h3 className="text-3xl text-center text-green-400 mb-6">Gallery of Memes</h3>
          <div className="carousel-container flex flex-col items-center">
            <Image
              src={selectedImage}
              alt="Selected Meme"
              width={400}
              height={400}
              className="w-full rounded-lg border border-green-500"
            />
            <div className="gallery mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={`Gallery Item ${index + 1}`}
                    className="w-full h-auto cursor-pointer rounded-lg hover:border-2 hover:border-green-500"
                    width={150}
                    height={150}
                    onClick={() => handleImageClick(image)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
