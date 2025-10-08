import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const [cancelDetails, setCancelDetails] = useState(null);

  useEffect(() => {
    // Extract cancellation details from URL parameters
    const invoiceId = searchParams.get('invoice_id');
    const status = searchParams.get('status');

    if (invoiceId) {
      setCancelDetails({
        invoice_id: invoiceId,
        status: status,
        order_id: searchParams.get('order_id'),
        date: new Date().toLocaleDateString()
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-3">
            <FiAlertCircle className="text-yellow-500 text-4xl" />
          </div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          You have cancelled the payment process. Your order has not been placed and no amount has been charged.
        </p>

        {/* Cancel Details */}
        {cancelDetails && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              {cancelDetails.invoice_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-medium">{cancelDetails.invoice_id}</span>
                </div>
              )}
              {cancelDetails.order_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{cancelDetails.order_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-yellow-600">{cancelDetails.status || 'Cancelled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{cancelDetails.date}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/checkout"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <FiRefreshCw className="mr-2" />
            Complete Payment
          </Link>
          
          <Link
            to="/cart"
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </Link>
        </div>

        {/* Information Box */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your cart items are still saved</li>
            <li>• No payment has been processed</li>
            <li>• You can complete the purchase anytime</li>
            <li>• Items may be subject to availability</li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Need assistance? Contact our support team</p>
          <p className="font-medium">support@shopcircuit.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
