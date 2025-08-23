// for demo and agent integration
import React, { useState } from 'react';
import AgentService from '../services/AgentService';

function ManualTrigger({ onTrigger, showToast }) {
  const [triggering, setTriggering] = useState(false);
  const [mode, setMode] = useState('demo'); // 'demo' or 'live'

  const handleTrigger = async (alertType) => {
    setTriggering(true);
    
    if (mode === 'demo') {
      // Simulate processing delay for demo effect
      setTimeout(() => {
        onTrigger && onTrigger(alertType);
        setTriggering(false);
      }, 1000);
    } else {
      // Live agent integration
      try {
        const response = await AgentService.triggerManualCheck();
        if (response && response.success) {
          showToast && showToast('✅ Manual check completed successfully', 'success');
        } else {
          showToast && showToast('⚠️ Manual check failed', 'error');
        }
      } catch (error) {
        console.error('Manual check error:', error);
        showToast && showToast('❌ Failed to trigger manual check', 'error');
      } finally {
        setTriggering(false);
      }
    }
  };

  const handleClearAlerts = async () => {
    if (mode === 'live') {
      try {
        await AgentService.clearAlerts();
        showToast && showToast('🗑️ Alerts cleared successfully', 'success');
      } catch (error) {
        console.error('Clear alerts error:', error);
        showToast && showToast('❌ Failed to clear alerts', 'error');
      }
    } else {
      // Demo mode - just show toast
      showToast && showToast('🗑️ Demo alerts cleared', 'success');
    }
  };

  return (
    <div className={`border rounded-lg p-4 md:p-6 ${
      mode === 'demo' 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      {/* Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold flex items-center ${
          mode === 'demo' ? 'text-yellow-800' : 'text-blue-800'
        }`}>
          <span className="mr-2">{mode === 'demo' ? '🎬' : '🔧'}</span>
          {mode === 'demo' ? 'Demo Controls' : 'Agent Controls'}
        </h3>
        
        <div className="flex bg-white rounded-lg p-1 border">
          <button
            onClick={() => setMode('demo')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'demo' 
                ? 'bg-yellow-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Demo
          </button>
          <button
            onClick={() => setMode('live')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'live' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Live
          </button>
        </div>
      </div>

      <p className={`text-sm mb-4 ${
        mode === 'demo' ? 'text-yellow-700' : 'text-blue-700'
      }`}>
        {mode === 'demo' 
          ? 'For demonstration purposes - trigger test alerts'
          : 'Live agent controls - interact with real monitoring system'
        }
      </p>
      
      <div className="space-y-3">
        {/* Main Action Button */}
        <button 
          onClick={() => handleTrigger('test')}
          disabled={triggering}
          className={`w-full font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
            mode === 'demo'
              ? 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white'
          }`}
        >
          {triggering ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'demo' ? 'Generating Alert...' : 'Running Check...'}
            </>
          ) : (
            <>
              <span className="mr-2">{mode === 'demo' ? '🧪' : '🔍'}</span>
              {mode === 'demo' ? 'Trigger Test Alert' : 'Run Manual Check'}
            </>
          )}
        </button>
        
        {/* Mode-specific buttons */}
        {mode === 'demo' ? (
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
        ) : (
          <button
            onClick={handleClearAlerts}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🗑️ Clear All Alerts
          </button>
        )}
        
        {/* Status */}
        <div className={`rounded p-3 mt-4 ${
          mode === 'demo' ? 'bg-yellow-100' : 'bg-blue-100'
        }`}>
          <p className={`text-xs font-medium ${
            mode === 'demo' ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            {mode === 'demo' ? 'Demo Status:' : 'Agent Status:'}
          </p>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className={`text-xs ${
              mode === 'demo' ? 'text-yellow-700' : 'text-blue-700'
            }`}>
              {mode === 'demo' ? 'Ready for live demonstration' : 'Connected to monitoring agent'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      {mode === 'demo' && (
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
      )}
    </div>
  );
}

export default ManualTrigger;