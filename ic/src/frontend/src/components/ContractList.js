import React from "react";
import { useTheme } from "../contexts/ThemeContext";

function ContractList({ contracts = [] }) {
  const { isDarkMode } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Monitored Contracts
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your smart contract health
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            No contracts being monitored
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add a contract address to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
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
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {contract.nickname ||
                          `Contract ${contract.id?.toString().substring(0, 8)}...`}
                      </h3>
                    </div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {contract.id || contract.address}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-2 space-x-4">
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
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium">
                        Not Monitored
                      </span>
                    ) : contract.isPaused === true ||
                      contract.isPaused === "true" ? (
                      <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 rounded-lg text-sm font-medium">
                        Paused
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          contract.status === "healthy"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200"
                            : contract.status === "warning"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200"
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
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Details
                    </button>
                    {!contract.isActive || contract.isActive === "false" ? (
                      <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                        Start
                      </button>
                    ) : contract.isPaused === true ||
                      contract.isPaused === "true" ? (
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                        Resume
                      </button>
                    ) : (
                      <>
                        <button className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                          Pause
                        </button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
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
        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {contracts.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
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
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {contracts.filter((c) => c.isActive && c.isPaused).length}{" "}
                  Paused
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-600 dark:text-red-400 font-medium">
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

            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
