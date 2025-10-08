import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiLoader } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { verifyPayment } from '../utils/paymentService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const verificationStarted = useRef(false); // Prevent multiple verifications

  useEffect(() => {
    // Prevent multiple verification attempts
    if (verificationStarted.current) {
      return;
    }

    const verifyPaymentStatus = async () => {
      try {
        verificationStarted.current = true; // Mark as verification started
        setIsVerifying(true);
        
        // Get invoice_id from URL parameters
        const invoiceId = searchParams.get('invoice_id');
        console.log('PaymentSuccess: Starting verification with invoice_id:', invoiceId);
        
        if (!invoiceId) {
          console.log('PaymentSuccess: No invoice_id found, using fallback logic');
          // Fallback to extracting details from URL parameters (backward compatibility)
          const amount = searchParams.get('amount');
          const status = searchParams.get('status');
          const orderId = searchParams.get('order_id');
          
          if (status === 'success' || status === 'completed') {
            const orderDetails = {
              invoice_id: invoiceId,
              amount: amount,
              status: 'COMPLETED',
              order_id: orderId,
              payment_method: searchParams.get('payment_method') || 'bkash',
              transaction_id: searchParams.get('transaction_id'),
              date: new Date().toLocaleDateString(),
              isVerified: false
            };

            setOrderDetails(orderDetails);
            setVerificationStatus('success');
            
            // Update order status if order ID is available
            if (orderId) {
              try {
                await updateDoc(doc(db, 'orders', orderId), {
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  paymentVerified: false, // Mark as not API-verified
                  paymentDate: new Date(),
                  paymentMethod: 'bkash'
                });
                console.log('Order status updated (fallback method):', orderId);
              } catch (updateError) {
                console.error('Error updating order status (fallback):', updateError);
              }
            }
            
            clearCart();
            toast.success('Payment completed successfully!');
          } else {
            setVerificationStatus('error');
          }
          return;
        }

        console.log('PaymentSuccess: Calling verifyPayment API...');
        // Verify payment using UddoktaPay API
        const verificationResult = await verifyPayment(invoiceId);
        console.log('PaymentSuccess: Verification result:', verificationResult);
        
        if (verificationResult.success && verificationResult.data) {
          const paymentData = verificationResult.data;
          console.log('PaymentSuccess: Payment data received:', paymentData);
          
          if (paymentData.isPaid) {
            // Payment is completed
            const orderDetails = {
              full_name: paymentData.full_name,
              email: paymentData.email,
              amount: paymentData.amount,
              fee: paymentData.fee,
              charged_amount: paymentData.charged_amount,
              invoice_id: paymentData.invoice_id,
              metadata: paymentData.metadata,
              payment_method: paymentData.payment_method,
              sender_number: paymentData.sender_number,
              transaction_id: paymentData.transaction_id,
              date: paymentData.date,
              status: paymentData.status,
              isVerified: true
            };

            setOrderDetails(orderDetails);
            setVerificationStatus('success');

            // Update order status in Firebase if order ID is available
            if (paymentData.metadata?.order_id) {
              try {
                await updateDoc(doc(db, 'orders', paymentData.metadata.order_id), {
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  paymentVerified: true,
                  transactionId: paymentData.transaction_id,
                  paymentDate: new Date(),
                  paymentMethod: paymentData.payment_method,
                  senderNumber: paymentData.sender_number,
                  paidAmount: paymentData.charged_amount
                });
                console.log('Order status updated to confirmed:', paymentData.metadata.order_id);
              } catch (updateError) {
                console.error('Error updating order status:', updateError);
                // Don't fail the whole process if order update fails
              }
            }

            clearCart();
            toast.success('Payment verified successfully! Your order has been confirmed.');
          } else if (paymentData.status === 'PENDING') {
            // Payment is still pending
            setOrderDetails({
              ...paymentData,
              isVerified: true
            });
            setVerificationStatus('pending');
            toast.error('Payment is still pending. Please wait for confirmation.');
          } else {
            // Payment failed
            setVerificationStatus('error');
            toast.error('Payment verification failed.');
          }
        } else {
          // Verification failed - use fallback method
          console.log('PaymentSuccess: API verification failed, trying fallback method');
          
          // Check if URL indicates successful payment
          const status = searchParams.get('status');
          const orderId = searchParams.get('order_id');
          
          if (status === 'completed' || status === 'success') {
            // Process as successful payment even if API verification failed
            const fallbackDetails = {
              invoice_id: invoiceId,
              amount: searchParams.get('amount'),
              status: 'COMPLETED',
              order_id: orderId,
              payment_method: 'bkash',
              transaction_id: searchParams.get('transaction_id'),
              date: new Date().toLocaleDateString(),
              isVerified: false,
              fallbackProcessed: true
            };

            setOrderDetails(fallbackDetails);
            setVerificationStatus('success');
            
            // Update order status
            if (orderId) {
              try {
                await updateDoc(doc(db, 'orders', orderId), {
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  paymentVerified: false,
                  paymentDate: new Date(),
                  paymentMethod: 'bkash',
                  notes: 'Payment processed via fallback method due to API verification issues'
                });
                console.log('Order status updated (fallback after API failure):', orderId);
              } catch (updateError) {
                console.error('Error updating order status (fallback):', updateError);
              }
            }
            
            clearCart();
            toast.success('Payment completed successfully!');
          } else {
            setVerificationStatus('error');
            toast.error(verificationResult.error || 'Failed to verify payment status');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
        toast.error('Failed to verify payment status: ' + error.message);
      } finally {
        setIsVerifying(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('PaymentSuccess: Verification timeout after 30 seconds');
      setIsVerifying(false);
      setVerificationStatus('error');
      toast.error('Payment verification timed out. Please check your orders or contact support.');
    }, 30000); // 30 second timeout

    verifyPaymentStatus();

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchParams, clearCart]); // Simplified dependencies

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 rounded-full p-3">
              <FiLoader className="text-blue-500 text-4xl animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we verify your payment status.
          </p>
          
          {/* Manual continue button after some time */}
          <button
            onClick={() => {
              console.log('Manual continue clicked');
              verificationStarted.current = true;
              setIsVerifying(false);
              setVerificationStatus('success');
              setOrderDetails({
                status: 'COMPLETED',
                payment_method: 'bkash',
                date: new Date().toLocaleDateString(),
                isVerified: false,
                manualContinue: true
              });
              clearCart();
              toast.success('Continuing with your order...');
            }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-3"
          >
            Continue to Orders
          </button>
          
          {/* Reset button for debugging */}
          <button
            onClick={() => {
              console.log('Reset verification clicked');
              verificationStarted.current = false;
              setIsVerifying(true);
              setVerificationStatus('loading');
              setOrderDetails(null);
            }}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Try Again
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Taking too long? Click the button above to continue.
          </p>
        </div>
      </div>
    );
  }

  // Show error state if verification failed
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-3">
              <FiCheckCircle className="text-red-500 text-4xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment status. Please contact support for assistance.
          </p>
          <div className="space-y-3">
            <Link
              to="/contact"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              Contact Support
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              Go to Home
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {verificationStatus === 'pending' ? 'Payment Pending' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {verificationStatus === 'pending' 
            ? 'Your payment is being processed. We will notify you once it is confirmed.'
            : 'Thank you for your purchase. Your order has been confirmed and will be processed shortly.'
          }
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              {orderDetails.isVerified ? 'Verified Payment Details' : 'Order Details'}
            </h3>
            <div className="space-y-2 text-sm">
              {orderDetails.invoice_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-medium">{orderDetails.invoice_id}</span>
                </div>
              )}
              {orderDetails.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">{orderDetails.transaction_id}</span>
                </div>
              )}
              {orderDetails.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">৳{orderDetails.amount}</span>
                </div>
              )}
              {orderDetails.fee && parseFloat(orderDetails.fee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fee:</span>
                  <span className="font-medium">৳{orderDetails.fee}</span>
                </div>
              )}
              {orderDetails.charged_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Charged:</span>
                  <span className="font-medium">৳{orderDetails.charged_amount}</span>
                </div>
              )}
              {orderDetails.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{orderDetails.payment_method}</span>
                </div>
              )}
              {orderDetails.sender_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sender Number:</span>
                  <span className="font-medium">{orderDetails.sender_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  orderDetails.status === 'COMPLETED' ? 'text-green-600' : 
                  orderDetails.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {orderDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{orderDetails.date}</span>
              </div>
              {orderDetails.metadata && orderDetails.metadata.order_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{orderDetails.metadata.order_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderDetails?.metadata?.order_id && (
            <Link
              to={`/track-order/${orderDetails.metadata.order_id}`}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              Track This Order
              <FiArrowRight className="ml-2" />
            </Link>
          )}
          
          <Link
            to="/orders"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            View All Orders
            <FiArrowRight className="ml-2" />
          </Link>
          
          <Link
            to="/"
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            Continue Shopping
            <FiArrowRight className="ml-2" />
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
          <p className="font-medium">support@shopcircuit.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
