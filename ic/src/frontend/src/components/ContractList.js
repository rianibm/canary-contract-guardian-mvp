import React from "react";

function ContractList({ contracts = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">
          Monitored Contracts
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your smart contract health
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-600 font-medium">
            No contracts being monitored
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Add a contract address to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {contracts.map((contract) => (
            <div
              key={contract.id || contract.address}
              className="p-6 hover:bg-gray-25 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Status Indicator */}
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !contract.isActive
                          ? "bg-gray-300"
                          : contract.isPaused
                            ? "bg-amber-400"
                            : contract.status === "healthy"
                              ? "bg-emerald-400"
                              : "bg-red-400"
                      }`}
                    >
                      {contract.status === "healthy" &&
                        contract.isActive &&
                        !contract.isPaused && (
                          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                        )}
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {contract.nickname ||
                          `Contract ${contract.id?.toString().substring(0, 8)}...`}
                      </h3>
                    </div>
                    <p className="font-mono text-sm text-gray-500 mt-1">
                      {contract.id || contract.address}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 mt-2 space-x-4">
                      <span>Added {contract.addedAt}</span>
                      <span>•</span>
                      <span>Last check: {contract.lastCheck}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Status Badge */}
                  <div className="flex items-center">
                    {!contract.isActive || contract.isActive === "false" ? (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                        Not Monitored
                      </span>
                    ) : contract.isPaused === true ||
                      contract.isPaused === "true" ? (
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                        Paused
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          contract.status === "healthy"
                            ? "bg-emerald-100 text-emerald-700"
                            : contract.status === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {contract.status === "healthy"
                          ? "Healthy"
                          : contract.status === "warning"
                            ? "Warning"
                            : "Error"}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      Details
                    </button>
                    {!contract.isActive || contract.isActive === "false" ? (
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                        Start
                      </button>
                    ) : contract.isPaused === true ||
                      contract.isPaused === "true" ? (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        Resume
                      </button>
                    ) : (
                      <>
                        <button className="text-amber-600 hover:text-amber-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                          Pause
                        </button>
                        <button className="text-gray-400 hover:text-red-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {contracts && contracts.length > 0 && (
        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Total:</span>
                <span className="font-semibold text-gray-900">
                  {contracts.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-600 font-medium">
                  {
                    contracts.filter(
                      (c) => c.isActive && !c.isPaused && c.status === "healthy"
                    ).length
                  }{" "}
                  Healthy
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-amber-600 font-medium">
                  {contracts.filter((c) => c.isActive && c.isPaused).length}{" "}
                  Paused
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-600 font-medium">
                  {
                    contracts.filter(
                      (c) =>
                        c.isActive &&
                        !c.isPaused &&
                        (c.status === "critical" || c.status === "warning")
                    ).length
                  }{" "}
                  Issues
                </span>
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
              <span>Monitoring active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractList;
