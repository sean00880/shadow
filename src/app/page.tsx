"use client";
// src/app/page.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import LandingLayout from '../components/LandingLayout';
import Link from 'next/link';
import Footer from '../components/Footer';
import AboutSection from '../components/About';
import HeroSection from '@components/HeroSection';
import Utility from '@components/Utility';
import Tokenomics from '@components/Tokenomics';
import Roadmap from '@components/Roadmap';
import Resources from '@components/Resources';

const posts = [
  {
    title: 'How MemeLinked Integrates DeFi and Social Networking',
    href: '/blog/defi-social-networking',
    description: 'Understand the unique approach that blends DeFi and social interactions...',
    previewImage: '/images/ML7.png',
  },
  {
    title: "GameFi's Role in the MemeLinked Ecosystem",
    href: '/blog/gamefi-role',
    description: 'Explore how GameFi enhances user engagement and contributes to our growth...',
    previewImage: '/images/ML6.png',
  },
  // Add more blog posts with preview images here
];

const HomePage: React.FC = () => {
  

  const [activeTab, setActiveTab] = useState('blog'); // This is for the Blog/Documentation section
  const images = [
    '/images/ML4.png',
    '/images/ML5.png',
    '/images/ML6.png',
    '/images/ML8.png',
    '/images/ML7.png',
  ];



  return (
    <LandingLayout>
      {/* Hero Section */}
      <HeroSection/>

      {/* About Section */}
      <AboutSection images={images} />
       {/* Whitepaper Section */}
     <Utility/> 
  
{/* Tokenomics Section */}
<Tokenomics/>

      {/* Roadmap Section */}
     <Roadmap/>

      {/* Call-to-Action */}

      <Resources/>

<section className="cta-section bg-gradient-to-b from-[#090909] via-[whitesmoke] to-[#ffffff] text-white py-16">
        <div className="text-center items-center flex flex-col">
        <Image
      src="/images/MemeLinked.png"
      alt="MemeLinked Graphic"
      className="w-100 h-100 rounded-lg  bg-opacity-80"
      width={400}
      height={400}
    />
          <h2 className="text-3xl font-bold mb-4 text-black" >Join the Future of Community-Driven DeFi</h2>
          
          <button className="px-8 py-4 bg-yellow-500 text-black rounded-lg  shadow hover:bg-yellow-600">
            Coming Soon
          </button>
          <h5 className='text-black italic font-semibold'>**[Anticipated Launch: 2025]**</h5>
        </div>
       
      </section>
    
  <Footer/>
  
    </LandingLayout>
  );
};

export default HomePage;