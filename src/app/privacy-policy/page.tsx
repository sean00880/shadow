"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <section className="py-16 px-4 md:px-8 bg-black text-white relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-green-700 to-purple-700 opacity-50 blur-2xl animate-pulse"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Title */}
        <h1 className="text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Effective Date: 12/20/2024
        </p>

        {/* Privacy Policy Content */}
        <div className="p-6 bg-black/70 border border-green-500 rounded-lg shadow-lg backdrop-blur-lg">
          <h2 className="text-3xl font-semibold text-green-400 mb-4">
            Privacy Policy for Shadow the Hedgehog (MSI Token Ecosystem)
          </h2>
          <p className="text-gray-300 mb-6">
            Shadow the Hedgehog (“we,” “our,” or “us”) is committed to protecting the
            privacy of its users (“users,” “you,” or “your”). This Privacy
            Policy outlines how we collect, use, disclose, and safeguard your
            information when you interact with the Shadow the Hedgehog token
            ecosystem, including our website, services, and other digital
            properties (collectively, the "Platform").
          </p>
          <p className="text-gray-300 mb-6">
            By accessing or using our Platform, you agree to the terms of this
            Privacy Policy. If you do not agree with the terms, please
            discontinue use of the Platform.
          </p>

          {/* Information We Collect */}
          <h3 className="text-2xl font-semibold text-purple-400 mb-4">
            1. Information We Collect
          </h3>
          <p className="text-gray-300 mb-4">
            We may collect the following categories of information:
          </p>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>1.1. Personal Information:</strong> Name, email address,
              wallet address, and social media handles (if provided).
            </li>
            <li>
              <strong>1.2. Non-Personal Information:</strong> Browser type,
              operating system, device information, geographic location, and
              usage data.
            </li>
            <li>
              <strong>1.3. Blockchain Data:</strong> Wallet addresses,
              transaction IDs, and token balances stogreen on public blockchain
              networks.
            </li>
          </ul>

          {/* How We Use Your Information */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            2. How We Use Your Information
          </h3>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>2.1. To Provide and Improve Services:</strong> Facilitate
              transactions, enhance user experience, and optimize platform
              performance.
            </li>
            <li>
              <strong>2.2. To Communicate with You:</strong> Respond to
              inquiries, send updates, and notify about security changes.
            </li>
            <li>
              <strong>2.3. To Ensure Security:</strong> Detect, prevent, and
              mitigate fraudulent or unauthorized activities.
            </li>
            <li>
              <strong>2.4. Legal Compliance:</strong> Fulfill legal obligations
              and comply with applicable laws and regulations.
            </li>
          </ul>

          {/* Information Sharing */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            3. Information Sharing and Disclosure
          </h3>
          <p className="text-gray-300 mb-4">
            We do not sell or rent your personal information. However, we may
            share it under the following circumstances:
          </p>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>3.1. With Service Providers:</strong> Vendors assisting
              with hosting, analytics, and customer support.
            </li>
            <li>
              <strong>3.2. With Legal Authorities:</strong> To comply with legal
              obligations or protect our rights and safety.
            </li>
            <li>
              <strong>3.3. With Your Consent:</strong> If explicitly authorized
              by you.
            </li>
            <li>
              <strong>3.4. In Case of Business Transfer:</strong> During mergers
              or acquisitions.
            </li>
          </ul>

          {/* Cookies and Tracking */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            4. Cookies and Tracking Technologies
          </h3>
          <p className="text-gray-300 mb-6">
            We use cookies to enhance functionality, track usage, and measure
            marketing campaign effectiveness. You can manage your cookie
            preferences through your browser settings.
          </p>

          {/* User Rights */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            7. Your Rights and Choices
          </h3>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>Access and Update:</strong> Request access to or updates
              of your personal information.
            </li>
            <li>
              <strong>Delete:</strong> Request deletion of your personal
              information, subject to legal requirements.
            </li>
            <li>
              <strong>Opt-Out:</strong> Unsubscribe from marketing
              communications.
            </li>
          </ul>

          {/* Contact Information
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            12. Contact Us
          </h3>
          <p className="text-gray-300">
            If you have any questions, contact us at:
          </p>
          <p className="text-gray-300">
            <strong>Telegram:</strong> [Insert Email Address]
          </p>
          <p className="text-gray-300">
            <strong>Address:</strong> [Insert Physical Address]
          </p> */}
        </div>
      </div>
    </section>
  );
}
