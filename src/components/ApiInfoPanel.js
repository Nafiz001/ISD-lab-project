import React, { useState, useEffect } from 'react';
import { FiInfo, FiCheck, FiLink, FiSettings } from 'react-icons/fi';

const ApiInfoPanel = () => {
  const [apiInfo, setApiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApiInfo();
  }, []);

  const fetchApiInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/payment/api-info');
      const data = await response.json();

      if (data.success) {
        setApiInfo(data.api_info);
      } else {
        setError(data.message || 'Failed to fetch API info');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={fetchApiInfo}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FiSettings className="text-blue-500 text-xl" />
        <h2 className="text-2xl font-bold text-gray-900">UddoktaPay API Configuration</h2>
      </div>

      {/* Base URL */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FiLink className="mr-2" />
          Base URL
        </h3>
        <code className="text-blue-800 bg-blue-100 px-2 py-1 rounded">
          {apiInfo.base_url}
        </code>
      </div>

      {/* API Versions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(apiInfo.available_versions).map(([version, details]) => (
          <div 
            key={version} 
            className={`border rounded-lg p-4 ${
              version === apiInfo.recommended_version 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">
                API {version.toUpperCase()}
                {version === apiInfo.recommended_version && (
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    Recommended
                  </span>
                )}
              </h3>
              <FiInfo className="text-gray-500" />
            </div>

            <p className="text-gray-600 mb-3">{details.name}</p>

            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Endpoint:</h4>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                {details.endpoint}
              </code>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Features:</h4>
              <ul className="space-y-1">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Verification */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold text-lg mb-3">Payment Verification</h3>
        <p className="text-gray-600 mb-3">{apiInfo.verify_payment.name}</p>
        
        <div className="mb-3">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Endpoint:</h4>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
            {apiInfo.verify_payment.endpoint}
          </code>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <FiCheck className="text-green-500 mr-2" />
          {apiInfo.verify_payment.compatibility}
        </div>
      </div>

      {/* Implementation Status */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Implementation Status</h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-green-800">
            <FiCheck className="text-green-600 mr-2" />
            API v1 and v2 endpoints configured
          </div>
          <div className="flex items-center text-sm text-green-800">
            <FiCheck className="text-green-600 mr-2" />
            Payment verification endpoint active
          </div>
          <div className="flex items-center text-sm text-green-800">
            <FiCheck className="text-green-600 mr-2" />
            Webhook validation implemented
          </div>
          <div className="flex items-center text-sm text-green-800">
            <FiCheck className="text-green-600 mr-2" />
            Enhanced features support (v2)
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Quick Links</h3>
        <div className="space-y-2">
          <a 
            href={apiInfo.available_versions.v1.full_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-800 text-sm"
          >
            📋 API v1 Endpoint: {apiInfo.available_versions.v1.full_url}
          </a>
          <a 
            href={apiInfo.available_versions.v2.full_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-800 text-sm"
          >
            🚀 API v2 Endpoint: {apiInfo.available_versions.v2.full_url}
          </a>
          <a 
            href={apiInfo.verify_payment.full_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-800 text-sm"
          >
            ✅ Verify Payment: {apiInfo.verify_payment.full_url}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiInfoPanel;
