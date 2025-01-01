'use client';

import { useState, useEffect } from 'react';

const Tokenomics = () => {
  const metrics = [
    { label: 'Total Supply', value: '1,000,000,000' },
    { label: 'Circulating Supply', value: '1,000,000,000' },
    { label: 'Burned Liquidity', value: '🔥 100%' },
    { label: 'Tax', value: 'F*** Tax' },
  ];

  const [textValues, setTextValues] = useState(metrics.map(() => ''));

  useEffect(() => {
    metrics.forEach((metric, index) => {
      let charIndex = 0;
      const interval = setInterval(() => {
        setTextValues((prev) =>
          prev.map((val, i) =>
            i === index ? val + metric.value[charIndex] : val
          )
        );
        charIndex++;
        if (charIndex === metric.value.length) clearInterval(interval);
      }, 50); // Typing speed for each character
    });
  }, []);

  return (
    <section className="w-full bg-black text-white py-10 px-6 flex flex-col h-screen">
      <h2 className="text-4xl font-bold text-center mb-10">Tokenomics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mx-auto">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="flex flex-col items-center text-center space-y-2"
          >
            <p className="text-xl font-semibold">{metric.label}</p>
            <p className="text-2xl font-bold">
              {textValues[index] || <span className="animate-pulse">|</span>}
            </p>
          </div>
        ))}
      </div>
      {/* Disclaimer */}
      <p className="mt-12 text-sm text-gray-400 text-center">
        Note: All liquidity is burned forever. There are no transaction taxes because f*** taxes.
      </p>
    </section>
  );
};

export default Tokenomics;
