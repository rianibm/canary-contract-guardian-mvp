// alert details
import React from 'react';

function AlertModal({ alert, onClose }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Alert Details</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Alert Header */}
          <div className="flex items-center">
            <span className="text-3xl mr-3">{alert.icon}</span>
            <div>
              <p className="font-medium text-lg">{alert.title}</p>
              <p className="text-sm text-gray-600">{alert.description}</p>
            </div>
          </div>
          
          {/* Severity Badge */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Severity:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              alert.severity === 'danger' 
                ? 'bg-red-100 text-red-700' 
                : alert.severity === 'warning'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {alert.severity === 'danger' ? '🚨 Critical' : alert.severity === 'warning' ? '⚠️ Warning' : '✅ Info'}
            </span>
          </div>
          
          {/* Contract Info */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Contract</p>
            <p className="font-medium">{alert.nickname}</p>
            <p className="font-mono text-sm text-gray-600 break-all">{alert.contract}</p>
          </div>
          
          {/* Timestamp */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Time</p>
            <p className="text-sm">{alert.timestamp}</p>
          </div>
          
          {/* Rule Triggered */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Rule Triggered</p>
            <p className="text-sm">{alert.rule}</p>
          </div>
          
          {/* Recommended Actions */}
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            <p className="text-xs text-blue-700 mb-1 font-medium">Recommended Actions</p>
            <ul className="text-sm text-blue-600 space-y-1">
              {alert.severity === 'danger' ? (
                <>
                  <li>• Investigate contract immediately</li>
                  <li>• Check transaction history</li>
                  <li>• Consider pausing contract if possible</li>
                </>
              ) : (
                <>
                  <li>• Monitor contract closely</li>
                  <li>• Review recent activity</li>
                  <li>• Set up additional monitoring</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            View Contract
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;