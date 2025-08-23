import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🚨';
  
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in max-w-sm`}>
      <div className="flex items-center">
        <span className="mr-2 text-lg">{icon}</span>
        <span className="font-medium flex-1">{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Alert details modal component
const AlertModal = ({ alert, onClose }) => {
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
          <div className="flex items-center">
            <span className="text-3xl mr-3">{alert.icon}</span>
            <div>
              <p className="font-medium text-lg">{alert.title}</p>
              <p className="text-sm text-gray-600">{alert.description}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Contract</p>
            <p className="font-medium">{alert.nickname}</p>
            <p className="font-mono text-sm text-gray-600 break-all">{alert.contract}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Time</p>
            <p className="text-sm">{alert.timestamp}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Rule Triggered</p>
            <p className="text-sm">{alert.rule}</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
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
};

// Contract List Component
const ContractList = ({ contracts }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 md:p-6 border-b">
        <h2 className="text-lg md:text-xl font-bold">📊 Monitored Contracts</h2>
      </div>
      
      {contracts.length === 0 ? (
        <div className="p-6 text-center">
          <span className="text-6xl mb-4 block">📋</span>
          <p className="text-gray-600">No contracts being monitored</p>
          <p className="text-sm text-gray-500">Add a contract to get started</p>
        </div>
      ) : (
        <div className="divide-y">
          {contracts.map((contract) => (
            <div key={contract.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="mb-2 md:mb-0">
                <div className="flex items-center">
                  <p className="font-medium text-sm md:text-base">{contract.nickname}</p>
                  <div className={`ml-2 w-2 h-2 rounded-full ${contract.status === 'healthy' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                </div>
                <p className="font-mono text-xs md:text-sm text-gray-600 break-all">{contract.address}</p>
                <div className="flex flex-col md:flex-row md:items-center text-xs text-gray-500 mt-1">
                  <span>Added {contract.addedAt}</span>
                  <span className="hidden md:inline mx-2">•</span>
                  <span>Last check: {contract.lastCheck}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`text-xs md:text-sm px-3 py-1 rounded-full font-medium ${
                  contract.status === 'healthy' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {contract.status === 'healthy' ? '✅ Healthy' : '🚨 Alert'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Manual Trigger Component
const ManualTrigger = ({ onTrigger }) => {
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async (alertType) => {
    setTriggering(true);
    
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
      </div>
    </div>
  );
};

function Dashboard() {
  const [contracts, setContracts] = useState([
    {
      id: 1,
      address: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
      nickname: 'Main DEX Contract',
      status: 'healthy',
      addedAt: '2 hours ago',
      lastCheck: '30 seconds ago'
    }
  ]);
  
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'High Transaction Volume',
      description: 'Detected 47 transactions in last hour (normal: 8/hour)',
      contract: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
      nickname: 'Main DEX Contract',
      severity: 'warning',
      timestamp: '2 minutes ago',
      icon: '⚠️',
      rule: 'Rule 2: Transaction count > 10 in 1 hour'
    },
    {
      id: 2,
      title: 'Large Balance Change',
      description: 'Balance decreased by 65% in last 30 minutes',
      contract: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
      nickname: 'Main DEX Contract',
      severity: 'danger',
      timestamp: '5 minutes ago',
      icon: '🚨',
      rule: 'Rule 1: Balance dropped > 50%'
    }
  ]);
  
  const [newContract, setNewContract] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertFilter, setAlertFilter] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [agentConnected, setAgentConnected] = useState(true); // Simulated agent connection

  const addContract = () => {
    if (!newContract.trim()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const contract = {
        id: Date.now(),
        address: newContract,
        nickname: newNickname || `Contract ${contracts.length + 1}`,
        status: 'healthy',
        addedAt: 'Just now',
        lastCheck: 'Starting...'
      };
      
      setContracts([...contracts, contract]);
      setNewContract('');
      setNewNickname('');
      setLoading(false);
      setToast({ message: 'Contract monitoring started!', type: 'success' });
    }, 1500);
  };

  const triggerTestAlert = () => {
    const testAlert = {
      id: Date.now(),
      title: 'Test Alert Triggered',
      description: 'Manual test alert for demo purposes',
      contract: contracts[0]?.address || 'rdmx6-jaaaa-aaaah-qcaiq-cai',
      nickname: contracts[0]?.nickname || 'Demo Contract',
      severity: 'warning',
      timestamp: 'Just now',
      icon: '🧪',
      rule: 'Manual Demo Trigger'
    };
    
    setAlerts([testAlert, ...alerts]);
    setToast({ message: 'Test alert generated!', type: 'warning' });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    alert.title.toLowerCase().includes(alertFilter.toLowerCase()) ||
    alert.description.toLowerCase().includes(alertFilter.toLowerCase()) ||
    alert.nickname.toLowerCase().includes(alertFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-4xl mr-3">🐦</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Canary Contract Guardian</h1>
              <p className="text-gray-600 text-sm md:text-base">Smart contract monitoring made simple</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <span className="mr-2">💬</span>
              {showChat ? 'Hide Chat' : 'Chat with AI Agent'}
            </button>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">Agent Online</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl md:text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-xs md:text-sm text-gray-600">Contracts</p>
                <p className="text-lg md:text-2xl font-bold">{contracts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-xl md:text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-xs md:text-sm text-gray-600">Status</p>
                <p className="text-lg md:text-xl font-bold text-green-600">Healthy</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-xl md:text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-xs md:text-sm text-gray-600">Alerts Today</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">{alerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-xl md:text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-xs md:text-sm text-gray-600">Last Check</p>
                <p className="text-sm md:text-base font-bold text-purple-600">30s ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid gap-6 md:gap-8 transition-all duration-300 ${
          showChat ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 xl:grid-cols-3'
        }`}>
          
          {/* Chat Interface - Only show when toggled */}
          {showChat && (
            <div className="xl:col-span-1 h-96 xl:h-auto">
              <ChatInterface 
                onSendMessage={(message) => console.log('Sending message:', message)}
                isConnected={agentConnected}
              />
            </div>
          )}
          
          {/* Add Contract Form */}
          <div className={showChat ? "xl:col-span-1" : "xl:col-span-1"}>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">📝 Add Contract</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Address
                  </label>
                  <input 
                    type="text" 
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value)}
                    placeholder="rdmx6-jaaaa-aaaah-qcaiq-cai"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nickname (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="e.g., Main DEX Contract"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <button 
                  onClick={addContract}
                  disabled={loading || !newContract.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Starting Monitor...' : 'Start Monitoring'}
                </button>
              </div>
            </div>

            {/* Manual Trigger Component */}
            <ManualTrigger onTrigger={triggerTestAlert} />
          </div>

          {/* Right Side - Contracts & Alerts */}
          <div className={`space-y-6 ${showChat ? "xl:col-span-1" : "xl:col-span-2"}`}>
            
            {/* Contract List Component */}
            <ContractList contracts={contracts} />

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 md:p-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-0">🚨 Recent Alerts</h2>
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={alertFilter}
                    onChange={(e) => setAlertFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              {filteredAlerts.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="text-6xl mb-4 block">🔕</span>
                  <p className="text-gray-600">No alerts found</p>
                  <p className="text-sm text-gray-500">All contracts are healthy</p>
                </div>
              ) : (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {filteredAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 md:p-6 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getSeverityColor(alert.severity)}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start">
                        <span className="text-xl md:text-2xl mr-3 flex-shrink-0">{alert.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <p className="font-medium text-sm md:text-base">{alert.title}</p>
                            <span className="text-xs text-gray-500 mt-1 md:mt-0">{alert.timestamp}</span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Contract: {alert.nickname}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Alert Modal */}
      <AlertModal 
        alert={selectedAlert} 
        onClose={() => setSelectedAlert(null)} 
      />

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;