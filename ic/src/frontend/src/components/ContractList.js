// contract management table
import React from 'react';

function ContractList({ contracts = [] }) {
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
            <div key={contract.id || contract.address} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="mb-2 md:mb-0">
                <div className="flex items-center">
                  <p className="font-medium text-sm md:text-base">{contract.nickname || `Contract ${contract.id?.substring(0, 8)}...`}</p>
                  <div className={`ml-2 w-2 h-2 rounded-full ${contract.status === 'healthy' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                </div>
                <p className="font-mono text-xs md:text-sm text-gray-600 break-all">{contract.id || contract.address}</p>
                <div className="flex flex-col md:flex-row md:items-center text-xs text-gray-500 mt-1">
                  <span>Added {contract.addedAt}</span>
                  <span className="hidden md:inline mx-2">•</span>
                  <span>Last check: {contract.lastCheck}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Status Badge */}
                <span className={`text-xs md:text-sm px-3 py-1 rounded-full font-medium ${
                  contract.status === 'healthy' 
                    ? 'bg-green-100 text-green-700' 
                    : contract.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {contract.status === 'healthy' ? '✅ Healthy' : 
                   contract.status === 'warning' ? '⚠️ Warning' : '🚨 Alert'}
                </span>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-gray-400 hover:text-red-600 text-xs md:text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary Footer */}
      {contracts && contracts.length > 0 && (
        <div className="p-4 md:p-6 bg-gray-50 border-t">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <span className="text-gray-600">
                Total: <span className="font-medium">{contracts.length}</span> contract{contracts.length !== 1 ? 's' : ''}
              </span>
              <span className="text-green-600">
                Healthy: <span className="font-medium">{contracts.filter(c => c.status === 'healthy').length}</span>
              </span>
              <span className="text-red-600">
                Alerts: <span className="font-medium">{contracts.filter(c => c.status !== 'healthy').length}</span>
              </span>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span>Monitoring active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractList;