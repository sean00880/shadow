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
    title: 'How MSI Integrates DeFi and Social Networking',
    href: '/blog/defi-social-networking',
    description: 'Understand the unique approach that blends DeFi and social interactions...',
    previewImage: '/images/ML7.png',
  },
  {
    title: "GameFi's Role in the MSI Ecosystem",
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
    
  <Footer/>
  
    </LandingLayout>
  );
};

export default HomePage;