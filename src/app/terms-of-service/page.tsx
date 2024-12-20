"use client";

import React from "react";

export default function TermsOfService() {
  return (
    <section className="py-16 px-4 md:px-8 bg-black text-white relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-green-700 to-purple-700 opacity-50 blur-2xl animate-pulse"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Title */}
        <h1 className="text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Effective Date: [Insert Date]
        </p>

        {/* Terms of Service Content */}
        <div className="p-6 bg-black/70 border border-green-500 rounded-lg shadow-lg backdrop-blur-lg">
          <h2 className="text-3xl font-semibold text-green-400 mb-4">
            Terms of Service for Monkey Sol Inu
          </h2>
          <p className="text-gray-300 mb-6">
            These Terms of Service (“Terms”) govern your access to and use of
            the Monkey Sol Inu (“MSI”) platform, including our website,
            services, and digital properties (collectively, the “Platform”).
            Please read these Terms carefully before using the Platform. By
            accessing or using the Platform, you agree to these Terms. If you
            do not agree, you must discontinue use immediately.
          </p>

          {/* 1. Acceptance of Terms */}
          <h3 className="text-2xl font-semibold text-purple-400 mb-4">
            1. Acceptance of Terms
          </h3>
          <p className="text-gray-300 mb-4">
            By accessing or using the Platform, you confirm that you are at
            least 18 years old and capable of entering into legally binding
            agreements. Your use of the Platform signifies your acceptance of
            these Terms and any updates or modifications.
          </p>

          {/* 2. Use of the Platform */}
          <h3 className="text-2xl font-semibold text-purple-400 mb-4">
            2. Use of the Platform
          </h3>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>2.1. Permitted Use:</strong> The Platform is for personal
              and non-commercial use only. You agree not to misuse the Platform
              for unauthorized activities.
            </li>
            <li>
              <strong>2.2. Prohibited Activities:</strong> You agree not to:
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>
                  Violate any applicable laws or regulations while using the
                  Platform.
                </li>
                <li>
                  Interfere with or disrupt the security, integrity, or
                  performance of the Platform.
                </li>
                <li>
                  Use the Platform to engage in fraudulent or illegal
                  activities.
                </li>
              </ul>
            </li>
          </ul>

          {/* 3. Intellectual Property */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            3. Intellectual Property
          </h3>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>3.1. Ownership:</strong> All content on the Platform,
              including text, images, graphics, and code, is the property of
              Monkey Sol Inu or its licensors. You may not reproduce,
              distribute, or use this content without permission.
            </li>
            <li>
              <strong>3.2. Trademarks:</strong> Monkey Sol Inu logos, names, and
              trademarks are protected by intellectual property laws. Unauthorized
              use is prohibited.
            </li>
          </ul>

          {/* 4. Transactions */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            4. Transactions
          </h3>
          <p className="text-gray-300 mb-4">
            Transactions made within the Monkey Sol Inu ecosystem are conducted
            using blockchain technology. All transactions are final and cannot
            be reversed. By participating in transactions, you acknowledge the
            risks associated with blockchain technology, including potential
            loss of tokens.
          </p>

          {/* 5. Disclaimers */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            5. Disclaimers
          </h3>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong>5.1. No Warranties:</strong> The Platform is provided “as
              is” without any warranties, express or implied. We do not
              guarantee that the Platform will be error-free or uninterrupted.
            </li>
            <li>
              <strong>5.2. Blockchain Risks:</strong> Transactions within the
              Platform are subject to blockchain-related risks, including
              technical failures, vulnerabilities, and loss of access to
              private keys.
            </li>
          </ul>

          {/* 6. Limitation of Liability */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            6. Limitation of Liability
          </h3>
          <p className="text-gray-300 mb-4">
            Monkey Sol Inu is not liable for any direct, indirect, incidental,
            consequential, or special damages arising from your use of the
            Platform, including but not limited to loss of tokens, data, or
            profits.
          </p>

          {/* 7. Modifications */}
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            7. Modifications
          </h3>
          <p className="text-gray-300 mb-4">
            We reserve the right to update or modify these Terms at any time.
            Changes will be effective upon posting on the Platform, and your
            continued use of the Platform signifies your acceptance of the
            updated Terms.
          </p>

          {/* Contact Information 
          <h3 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">
            Contact Us
          </h3>
          <p className="text-gray-300">
            If you have any questions or concerns regarding these Terms,
            contact us at:
          </p>
          <p className="text-gray-300">
            <strong>Email:</strong> [Insert Email Address]
          </p>
          <p className="text-gray-300">
            <strong>Address:</strong> [Insert Physical Address]
          </p>*/}
        </div>
      </div>
    </section>
  );
}
