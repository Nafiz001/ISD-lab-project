import React, { useState, useEffect } from 'react';
import { verifyPayment } from '../utils/paymentService';
import { FiLoader, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const PaymentVerification = ({ invoiceId, onVerificationComplete }) => {
  const [status, setStatus] = useState('loading'); // loading, success, error, pending
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceId) {
      setStatus('error');
      setError('No invoice ID provided');
      return;
    }

    const performVerification = async () => {
      try {
        setStatus('loading');
        
        const result = await verifyPayment(invoiceId);
        
        if (result.success && result.data) {
          setPaymentData(result.data);
          
          if (result.data.status === 'COMPLETED') {
            setStatus('success');
          } else if (result.data.status === 'PENDING') {
            setStatus('pending');
          } else {
            setStatus('error');
            setError(`Payment status: ${result.data.status}`);
          }
          
          // Notify parent component
          if (onVerificationComplete) {
            onVerificationComplete({
              success: result.success,
              status: result.data.status,
              data: result.data
            });
          }
        } else {
          setStatus('error');
          setError(result.error || 'Verification failed');
          
          if (onVerificationComplete) {
            onVerificationComplete({
              success: false,
              error: result.error
            });
          }
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
        setError(err.message || 'Verification failed');
        
        if (onVerificationComplete) {
          onVerificationComplete({
            success: false,
            error: err.message
          });
        }
      }
    };

    performVerification();
  }, [invoiceId, onVerificationComplete]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <FiLoader className="text-blue-500 text-2xl animate-spin" />;
      case 'success':
        return <FiCheckCircle className="text-green-500 text-2xl" />;
      case 'pending':
        return <FiAlertCircle className="text-yellow-500 text-2xl" />;
      case 'error':
        return <FiXCircle className="text-red-500 text-2xl" />;
      default:
        return <FiLoader className="text-gray-500 text-2xl" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return 'Verifying payment status...';
      case 'success':
        return 'Payment verified successfully!';
      case 'pending':
        return 'Payment is being processed';
      case 'error':
        return error || 'Payment verification failed';
      default:
        return 'Checking payment status...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center space-x-3 mb-3">
        {getStatusIcon()}
        <div>
          <h3 className="font-semibold text-gray-900">Payment Verification</h3>
          <p className={`text-sm ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {paymentData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${getStatusColor()}`}>
                {paymentData.status}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium">৳{paymentData.amount}</span>
            </div>
            {paymentData.payment_method && (
              <div>
                <span className="text-gray-600">Method:</span>
                <span className="ml-2 font-medium capitalize">
                  {paymentData.payment_method}
                </span>
              </div>
            )}
            {paymentData.transaction_id && (
              <div>
                <span className="text-gray-600">Transaction:</span>
                <span className="ml-2 font-medium text-xs">
                  {paymentData.transaction_id}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Your payment is being processed. This may take a few minutes. 
            Please refresh the page to check for updates.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Payment verification failed. Please contact support if you believe 
            this is an error.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
