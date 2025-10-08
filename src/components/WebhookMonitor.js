import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiEye } from 'react-icons/fi';

const WebhookMonitor = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWebhook, setSelectedWebhook] = useState(null);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/payment/webhooks/logs');
      const data = await response.json();

      if (data.success) {
        setWebhooks(data.logs);
      } else {
        setError(data.message || 'Failed to fetch webhooks');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWebhooks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <FiCheckCircle className="text-green-500" />;
      case 'PENDING':
        return <FiClock className="text-yellow-500" />;
      case 'ERROR':
      case 'FAILED':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'ERROR':
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Webhook Monitor</h2>
        <button
          onClick={fetchWebhooks}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading webhooks...' : 'No webhook notifications received yet'}
          </div>
        ) : (
          webhooks.map((webhook, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {webhook.data && getStatusIcon(webhook.data.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {webhook.data?.invoice_id || 'Unknown Invoice'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(webhook.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {webhook.data && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(webhook.data.status)}`}>
                      {webhook.data.status}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedWebhook(webhook)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <FiEye />
                  </button>
                </div>
              </div>

              {webhook.data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-medium">৳{webhook.data.amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <p className="font-medium capitalize">{webhook.data.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">{webhook.data.full_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Transaction:</span>
                    <p className="font-medium text-xs">{webhook.data.transaction_id || 'N/A'}</p>
                  </div>
                </div>
              )}

              {webhook.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 text-sm">Error: {webhook.error}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Webhook Details Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-full overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Webhook Details</h3>
              <button
                onClick={() => setSelectedWebhook(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Timestamp</h4>
                <p className="bg-gray-100 p-2 rounded">{formatTimestamp(selectedWebhook.timestamp)}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Webhook Data</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(selectedWebhook.data, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Headers</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(selectedWebhook.headers, null, 2)}
                </pre>
              </div>

              {selectedWebhook.ip && (
                <div>
                  <h4 className="font-semibold mb-2">Source IP</h4>
                  <p className="bg-gray-100 p-2 rounded">{selectedWebhook.ip}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookMonitor;
