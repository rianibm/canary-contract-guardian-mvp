import React, { useState } from "react";
import {
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  X,
  Filter,
} from "lucide-react";

// Sample alerts data
const sampleAlerts = [
  {
    id: 1,
    icon: "⚠️",
    title: "High Transaction Volume",
    description: "Detected 47 transactions in last hour (normal: 8/hour)",
    contract: "Main DEX Contract",
    nickname: "Main DEX Contract",
    timestamp: "2 minutes ago",
    severity: "warning",
    rule: "Transaction Volume Threshold",
    category: "volume",
  },
  {
    id: 2,
    icon: "🚨",
    title: "Large Balance Change",
    description: "Balance decreased by 65% in last 30 minutes",
    contract: "Main DEX Contract",
    nickname: "Main DEX Contract",
    timestamp: "5 minutes ago",
    severity: "danger",
    rule: "Balance Drop Alert",
    category: "balance",
  },
  {
    id: 3,
    icon: "⚡",
    title: "Unusual Gas Usage",
    description: "Gas consumption 300% above normal",
    contract: "Main DEX Contract",
    nickname: "Main DEX Contract",
    timestamp: "8 minutes ago",
    severity: "warning",
    rule: "Gas Usage Monitor",
    category: "gas",
  },
  {
    id: 4,
    icon: "🔄",
    title: "Contract State Change",
    description: "Critical state variables modified",
    contract: "Main DEX Contract",
    nickname: "Main DEX Contract",
    timestamp: "12 minutes ago",
    severity: "info",
    rule: "State Change Monitor",
    category: "state",
  },
];

// Alert Modal Component
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
            <span className="text-sm font-medium text-gray-700 mr-2">
              Severity:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                alert.severity === "danger"
                  ? "bg-red-100 text-red-700"
                  : alert.severity === "warning"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {alert.severity === "danger"
                ? "🚨 Critical"
                : alert.severity === "warning"
                  ? "⚠️ Warning"
                  : "✅ Info"}
            </span>
          </div>

          {/* Contract Info */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Contract</p>
            <p className="font-medium">{alert.nickname}</p>
            <p className="font-mono text-sm text-gray-600 break-all">
              {alert.contract}
            </p>
          </div>

          {/* Timestamp */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">Time</p>
            <p className="text-sm">{alert.timestamp}</p>
          </div>

          {/* Rule Triggered */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Rule Triggered
            </p>
            <p className="text-sm">{alert.rule}</p>
          </div>

          {/* Recommended Actions */}
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            <p className="text-xs text-blue-700 mb-1 font-medium">
              Recommended Actions
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              {alert.severity === "danger" ? (
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
          <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors">
            View Contract
          </button>
        </div>
      </div>
    </div>
  );
}

// Filter Modal Component
function FilterModal({ filters, onFiltersChange, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      severity: "all",
      category: "all",
      timeRange: "all",
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Alerts
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={localFilters.severity}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, severity: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Severities</option>
              <option value="danger">🚨 Critical</option>
              <option value="warning">⚠️ Warning</option>
              <option value="info">✅ Info</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="volume">📊 Volume</option>
              <option value="balance">💰 Balance</option>
              <option value="gas">⚡ Gas</option>
              <option value="state">🔄 State Changes</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={localFilters.timeRange}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, timeRange: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClearFilters}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

function CanaryContractGuardian() {
  const [contractAddress, setContractAddress] = useState(
    "rdmx6-jaaaa-aaaah-qcaiq-cai"
  );
  const [nickname, setNickname] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    severity: "all",
    category: "all",
    timeRange: "all",
  });

  // Filter alerts based on search term and filters
  const filteredAlerts = sampleAlerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      filters.severity === "all" || alert.severity === filters.severity;
    const matchesCategory =
      filters.category === "all" || alert.category === filters.category;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.severity !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.timeRange !== "all") count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-red-500 text-white p-2 rounded-lg mr-3">🐦</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Canary Contract Guardian
              </h1>
              <p className="text-gray-600">
                Smart contract monitoring made simple
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              💬 Chat with AI Agent
            </button>
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Agent Online
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">📊</div>
            <div>
              <p className="text-gray-600 text-sm">Contracts</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-xl font-bold text-green-600">Healthy</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Alerts Today</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">⏰</div>
            <div>
              <p className="text-gray-600 text-sm">Last Check</p>
              <p className="text-lg font-bold text-purple-600">30s ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Add Contract */}
        <div className="space-y-6">
          {/* Add Contract Form */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              📝 Add Contract
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter contract address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Main DEX Contract"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discord Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get notified in Discord when alerts are triggered
                </p>
              </div>

              <button className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed">
                Start Monitoring
              </button>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
              🎮 Demo Controls
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              For demonstration purposes - trigger test alerts
            </p>

            <div className="space-y-2">
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition-colors">
                ✏️ Trigger Test Alert
              </button>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-100 text-red-700 py-1 px-3 rounded text-sm">
                  🚨 Balance Drop
                </button>
                <button className="flex-1 bg-yellow-100 text-yellow-700 py-1 px-3 rounded text-sm">
                  ⚠️ High Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Monitored Contracts & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monitored Contracts */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              📊 Monitored Contracts
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Main DEX Contract</p>
                    <p className="text-sm text-gray-600 font-mono">
                      rdmx6-jaaaa-aaaah-qcaiq-cai
                    </p>
                    <p className="text-xs text-gray-500">
                      Added 2 hours ago • Last check: 30 seconds ago
                    </p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center">
                🚨 Recent Alerts
              </h2>
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors relative"
              >
                <Filter className="w-4 h-4" />
                Filter
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.severity !== "all" && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    Severity: {filters.severity}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, severity: "all" })
                      }
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.category !== "all" && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    Category: {filters.category}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, category: "all" })
                      }
                      className="ml-1 text-green-500 hover:text-green-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.timeRange !== "all" && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                    Time: {filters.timeRange}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, timeRange: "all" })
                      }
                      className="ml-1 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Alerts List */}
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || getActiveFilterCount() > 0 ? (
                    <div>
                      <p>No alerts match your search criteria</p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilters({
                            severity: "all",
                            category: "all",
                            timeRange: "all",
                          });
                        }}
                        className="text-orange-500 hover:text-orange-600 mt-2"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    "No recent alerts"
                  )}
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      alert.severity === "danger"
                        ? "bg-red-50 border-red-400"
                        : alert.severity === "warning"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <span className="text-xl mr-3 mt-1">{alert.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Contract: {alert.contract}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {alert.timestamp}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                            alert.severity === "danger"
                              ? "bg-red-100 text-red-700"
                              : alert.severity === "warning"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {alert.severity === "danger"
                            ? "Critical"
                            : alert.severity === "warning"
                              ? "Warning"
                              : "Info"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {showFilters && (
        <FilterModal
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

export default CanaryContractGuardian;
