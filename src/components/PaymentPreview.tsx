"use client";

import React from "react";

interface PaymentPreviewProps {
  paymentData: {
    adTitle: string;
    adDescription: string;
    image: File | null;
  };
}

const PaymentPreview: React.FC<PaymentPreviewProps> = ({ paymentData }) => {
  return (
    <div className="preview">
      <h2>Preview</h2>
      <p><strong>Title:</strong> {paymentData.adTitle}</p>
      <p><strong>Description:</strong> {paymentData.adDescription}</p>
      {paymentData.image && (
        <img
          src={URL.createObjectURL(paymentData.image)}
          alt="Ad Preview"
          style={{ maxWidth: "100%" }}
        />
      )}
    </div>
  );
};

export default PaymentPreview;
