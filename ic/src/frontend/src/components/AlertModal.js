import React, { useState } from "react";
import { X, Search, Filter } from "lucide-react";

function AllAlertsModal({
  alerts = [], // DEFAULT VALUE
  onClose,
  onAlertClick,
  filters = { severity: "all", category: "all", timeRange: "all" }, // DEFAULT VALUE
  onFiltersChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Safety check untuk alerts
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  // Filter alerts based on search and filters
  const filteredAlerts = safeAlerts.filter((alert) => {
    if (!alert) return false;

    const matchesSearch =
      (alert.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            All Recent Alerts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b space-y-4">
          {/* Search and Filter Row */}
          <div className="flex gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors relative"
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

          {/* Filter Panel */}
          {showFilters && onFiltersChange && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={filters.severity || "all"}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, severity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="danger">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || "all"}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="volume">Volume</option>
                    <option value="balance">Balance</option>
                    <option value="gas">Gas</option>
                    <option value="state">State Changes</option>
                  </select>
                </div>

                {/* Time Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Range
                  </label>
                  <select
                    value={filters.timeRange || "all"}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, timeRange: e.target.value })
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
            </div>
          )}

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && onFiltersChange && (
            <div className="flex flex-wrap gap-2">
              {filters.severity !== "all" && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  Severity: {filters.severity}
                  <button
                    onClick={() =>
                      onFiltersChange({ ...filters, severity: "all" })
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
                      onFiltersChange({ ...filters, category: "all" })
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
                      onFiltersChange({ ...filters, timeRange: "all" })
                    }
                    className="ml-1 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Alerts List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm || getActiveFilterCount() > 0 ? (
                  <div>
                    <p className="text-lg">
                      No alerts match your search criteria
                    </p>
                    {onFiltersChange && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          onFiltersChange({
                            severity: "all",
                            category: "all",
                            timeRange: "all",
                          });
                        }}
                        className="text-orange-500 hover:text-orange-600 mt-3 text-sm"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-lg">No recent alerts</p>
                )}
              </div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <div
                  key={alert.id || index}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    alert.severity === "danger"
                      ? "bg-red-50 border-red-400"
                      : alert.severity === "warning"
                        ? "bg-yellow-50 border-yellow-400"
                        : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <span className="text-xl mr-3 mt-1">
                        {alert.icon || "⚠️"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">
                          {alert.title || "Unknown Alert"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.description || "No description available"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Contract: {alert.contract || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">
                        {alert.timestamp || "Unknown time"}
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

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredAlerts.length} of {safeAlerts.length} alerts
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllAlertsModal;
