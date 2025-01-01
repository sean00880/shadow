'use client';

import { useState, useEffect } from 'react';

const Hero = () => {
  const displayText = `Behold, the FUCKCOIN. A groundbreaking innovation.
After Fart Coin—light, fleeting, and gassy—we present FUCKCOIN: raw, explosive, and unapologetically disruptive.
From silent whispers to full-blown detonations, we've evolved beyond limits.

System Analysis:
- Stage 1: Silent but deadly (Fart Coin legacy activated).
- Stage 2: Loud and disruptive (FUCKCOIN now dominates).
- Stage 3: Global blowout in progress.

Initializing algorithm...
Simulating chain reaction...
Targets obliterated.
Unstoppable momentum achieved.

WARNING: Side effects may include shattered expectations, excessive gas emissions,
and market-wide combustion. Proceed at your own risk.`;

  const [text, setText] = useState('');
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const currentText = displayText.substring(0, index + 1);
      setText(currentText); // Update full text dynamically
      setLines(currentText.split('\n')); // Split text into lines for rendering
      index++;
      if (index === displayText.length) clearInterval(interval);
    }, 20); // Adjust typing speed here
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col md:flex-row justify-between items-center h-screen px-6 bg-black text-white font-mono">
      {/* Left: Dynamic Text */}
      <div className="md:w-1/2 p-6 rounded-md shadow-lg">
        <div>
          {lines.map((line, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-gray-300 text-xl">Contract Address:</p>
          <p className="text-green-400 break-all text-lg">
            GGpY7K3XM8FFqdqWR1kA7ciCCKp3pTeBQ4s24jcGpump
          </p>
        </div>
      </div>

      {/* Right: Animated Image and Buttons */}
      <div className="md:w-1/2 flex flex-col items-center space-y-6">
      
        {/* Animated Image */}
        <div className="w-48 h-48 animation-translate">
          <img
            src="/images/fuck.jpg"
            alt="FUCKCOIN Animation"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className='text-white'>Fuck off...I'm coding.</h2>
        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* DexTools */}
          <a
            href="https://www.dextools.io/app/en/solana/pair-explorer/7VPaUiedjRujwgwP8J5jdExPQpa9yRwmjLntR93AEU8c?t=1735695616118"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 p-4 rounded-full shadow-md transition-transform hover:scale-110"
          >
            <img
              src="/icons/dextools.png"
              alt="DexTools"
              className="w-8 h-8"
            />
          </a>
          {/* DexScreener */}
          <a
            href="https://dexscreener.com/solana/7vpauiedjrujwgwp8j5jdexpqpa9yrwmjlntr93aeu8c"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 p-4 rounded-full shadow-md transition-transform hover:scale-110"
          >
            <img
              src="/icons/dexscreener.png"
              alt="DexScreener"
              className="w-8 h-8"
            />
          </a>
          {/* X */}
          <a
            href="https://x.com/fuckcoin_sol"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 p-4 rounded-full shadow-md transition-transform hover:scale-110"
          >
            <img
              src="/icons/x.png"
              alt="X"
              className="w-8 h-8"
            />
          </a>
          {/* Telegram */}
          <a
            href="https://t.me/fuckcoin_sol"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 p-4 rounded-full shadow-md transition-transform hover:scale-110"
          >
            <img
              src="/icons/telegram.png"
              alt="Telegram"
              className="w-8 h-8"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
