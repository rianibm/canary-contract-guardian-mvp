// for demo
import React, { useState } from 'react';

function ManualTrigger({ onTrigger }) {
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async (alertType) => {
    setTriggering(true);
    
    // Simulate processing delay for demo effect
    setTimeout(() => {
      onTrigger(alertType);
      setTriggering(false);
    }, 1000);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6">
      <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center">
        <span className="mr-2">🎬</span>
        Demo Controls
      </h3>
      <p className="text-sm text-yellow-700 mb-4">
        For demonstration purposes - trigger test alerts
      </p>
      
      <div className="space-y-3">
        {/* Main Test Alert Button */}
        <button 
          onClick={() => handleTrigger('test')}
          disabled={triggering}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {triggering ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Alert...
            </>
          ) : (
            <>
              <span className="mr-2">🧪</span>
              Trigger Test Alert
            </>
          )}
        </button>
        
        {/* Specific Alert Type Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button 
            onClick={() => handleTrigger('balance')}
            disabled={triggering}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded text-sm transition-colors"
          >
            🚨 Balance Drop
          </button>
          
          <button 
            onClick={() => handleTrigger('transaction')}
            disabled={triggering}
            className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-3 rounded text-sm transition-colors"
          >
            ⚠️ High Activity
          </button>
        </div>
        
        {/* Demo Status */}
        <div className="bg-yellow-100 rounded p-3 mt-4">
          <p className="text-xs text-yellow-800 font-medium">Demo Status:</p>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-yellow-700">Ready for live demonstration</span>
          </div>
        </div>
      </div>
      
      {/* Demo Instructions */}
      <div className="mt-4 pt-4 border-t border-yellow-200">
        <p className="text-xs text-yellow-600 font-medium mb-2">Demo Flow:</p>
        <ol className="text-xs text-yellow-600 space-y-1">
          <li>1. Show dashboard with existing monitoring</li>
          <li>2. Add new contract address</li>
          <li>3. Click "Trigger Test Alert" for guaranteed demo</li>
          <li>4. Show alert appears in dashboard</li>
          <li>5. Demonstrate alert details modal</li>
        </ol>
      </div>
    </div>
  );
}

export default ManualTrigger;