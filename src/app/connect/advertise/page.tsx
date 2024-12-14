"use client";

import { useState, useMemo, memo } from "react";
import AlertModal from "../../../components/AlertModal";
import PaymentForm from "../../../components/PaymentForm";
import PaymentPreview from "../../../components/PaymentPreview";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

// Memoized Components
const MemoizedPaymentForm = memo(PaymentForm);
const MemoizedPaymentPreview = memo(PaymentPreview);
const MemoizedAlertModal = memo(AlertModal);

export default function AdvertisePage() {
  const [paymentData, setPaymentData] = useState({
    amount: "0.01",
    adTitle: "",
    adDescription: "",
    image: null as File | null,
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: txHash, sendTransaction } = useSendTransaction();
  const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handlePayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setAlertMessage("Please enter a valid payment amount.");
      return;
    }

    setLoading(true);

    try {
      await sendTransaction({
        to: "0xYourWalletAddress", // Replace with your wallet address
        value: parseEther(paymentData.amount),
      });
      setAlertMessage("Transaction submitted successfully!");
    } catch (error) {
      console.error("Payment failed:", error);
      setAlertMessage(error instanceof Error ? error.message : "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const alertModal = useMemo(() => {
    if (!alertMessage) return null;
    return <MemoizedAlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />;
  }, [alertMessage]);

  return (
    <div className="auth flex flex-col md:flex-row min-h-screen">
      {alertModal}

      {/* Left Section */}
      <div className="w-full md:w-1/2 overflow-auto p-4 mt-40">
        <MemoizedPaymentForm
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          handlePayment={handlePayment}
          loading={loading || isPending}
        />
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex justify-center items-start">
        <div className="sticky top-20 p-6 w-full">
          <MemoizedPaymentPreview paymentData={paymentData} />
        </div>
      </div>
    </div>
  );
}
