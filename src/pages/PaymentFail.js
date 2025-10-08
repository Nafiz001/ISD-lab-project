import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiXCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { verifyPayment } from '../utils/paymentService';
import PaymentVerification from '../components/PaymentVerification';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    // Extract error details from URL parameters
    const invoiceIdParam = searchParams.get('invoice_id');
    const status = searchParams.get('status');
    const errorMessage = searchParams.get('error_message') || 'Payment processing failed';

    setInvoiceId(invoiceIdParam);

    if (invoiceIdParam) {
      setErrorDetails({
        invoice_id: invoiceIdParam,
        status: status,
        error_message: errorMessage,
        order_id: searchParams.get('order_id'),
        date: new Date().toLocaleDateString()
      });
    }
  }, [searchParams]);

  const handleVerificationComplete = (result) => {
    if (result.success && result.status === 'COMPLETED') {
      // Payment was actually successful, redirect to success page
      window.location.href = `/payment-success?invoice_id=${invoiceId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-3">
            <FiXCircle className="text-red-500 text-4xl" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Please try again or use a different payment method.
        </p>

        {/* Error Details */}
        {errorDetails && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Error Details</h3>
            <div className="space-y-2 text-sm">
              {errorDetails.invoice_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-medium">{errorDetails.invoice_id}</span>
                </div>
              )}
              {errorDetails.order_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{errorDetails.order_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-red-600">{errorDetails.status || 'Failed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{errorDetails.date}</span>
              </div>
              <div className="mt-3">
                <span className="text-gray-600">Error:</span>
                <p className="text-red-600 font-medium mt-1">{errorDetails.error_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Verification Section */}
        {invoiceId && (
          <div className="mb-6">
            {!showVerification ? (
              <button
                onClick={() => setShowVerification(true)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Verify Payment Status
              </button>
            ) : (
              <PaymentVerification
                invoiceId={invoiceId}
                onVerificationComplete={handleVerificationComplete}
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/checkout"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </Link>
          
          <Link
            to="/cart"
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </Link>
        </div>

        {/* Common Solutions */}
        <div className="mt-6 text-left">
          <h4 className="font-semibold text-gray-900 mb-2">Common Solutions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your payment details and try again</li>
            <li>• Ensure sufficient balance in your account</li>
            <li>• Try using a different payment method</li>
            <li>• Contact your bank if the issue persists</li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Still having issues? Contact our support team</p>
          <p className="font-medium">support@shopcircuit.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
