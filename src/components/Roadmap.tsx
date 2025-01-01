'use client';

import { useState, useEffect } from 'react';

const Roadmap = () => {
  const [text, setText] = useState('');
  const displayText = `Phase 1: Initialization
- Launch social channels
- Develop website
- Deploy contract and burn liquidity
- Create marketing strategy`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText((prev) => prev + displayText[index]);
      index++;
      if (index === displayText.length) clearInterval(interval);
    }, 50); // Typing speed
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full flex flex-col bg-black text-white py-10 px-6">
      {/* Title */}
      <h2 className="text-4xl font-bold text-center mb-10">Roadmap</h2>

      {/* Roadmap Phase */}
      <div className="max-w-4xl mx-auto bg-gray-900 text-green-400 font-mono text-sm p-6 rounded-md shadow-lg">
        <pre>{text || <span className="animate-pulse">|</span>}</pre>
      </div>

      {/* Animated Image */}
      <div className="flex justify-center mt-10">
        <div className="w-48 h-48 animation-translate">
          <img
            src="/images/fuck.jpg"
            alt="Animated"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
