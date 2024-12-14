"use client";

import React from "react";

interface PaymentFormProps {
  paymentData: {
    amount: string;
    adTitle: string;
    adDescription: string;
    image: File | null;
  };
  setPaymentData: React.Dispatch<
    React.SetStateAction<{
      amount: string;
      adTitle: string;
      adDescription: string;
      image: File | null;
    }>
  >;
  handlePayment: () => Promise<void>;
  loading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentData,
  setPaymentData,
  handlePayment,
  loading,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentData((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePayment();
      }}
    >
      <div>
        <label>Ad Title</label>
        <input
          type="text"
          name="adTitle"
          value={paymentData.adTitle}
          onChange={handleInputChange}
          placeholder="Enter your ad title"
          required
        />
      </div>

      <div>
        <label>Ad Description</label>
        <textarea
          name="adDescription"
          value={paymentData.adDescription}
          onChange={handleInputChange}
          placeholder="Enter your ad description"
          required
        />
      </div>

      <div>
        <label>Ad Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <div>
        <label>Amount (ETH)</label>
        <input
          type="number"
          name="amount"
          value={paymentData.amount}
          onChange={handleInputChange}
          placeholder="0.01"
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Submit Payment"}
      </button>
    </form>
  );
};

export default PaymentForm;
