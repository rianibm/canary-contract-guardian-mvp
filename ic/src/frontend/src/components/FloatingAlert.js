import React, { useState, useEffect } from "react";
import { X, Info, Search, Filter } from "lucide-react";
import agentService from "../services/AgentService";
import AlertModal from "./AlertModal";

// Modal component for showing all recent alerts
function RecentAlertsModal({ alerts = [], onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    severity: "all",
    category: "all",
    timeRange: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Safety check untuk alerts
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.severity !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.timeRange !== "all") count++;
    return count;
  };

  const filteredAlerts = safeAlerts.filter((alert) => {
    if (!alert) return false;

    const matchesSearch =
      (alert.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (alert.nickname || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      filters.severity === "all" || alert.severity === filters.severity;
    const matchesCategory =
      filters.category === "all" || alert.category === filters.category;

    // Simple time range filter - skip jika timestamp tidak valid
    let matchesTimeRange = true;
    if (filters.timeRange !== "all" && alert.timestamp) {
      try {
        const now = new Date();
        let alertTime;

        // Handle jika timestamp adalah string seperti "3 minutes ago"
        if (
          typeof alert.timestamp === "string" &&
          alert.timestamp.includes("ago")
        ) {
          // Untuk demo, anggap semua dalam range
          matchesTimeRange = true;
        } else {
          alertTime = new Date(alert.timestamp);
          const hoursDiff = (now - alertTime) / (1000 * 60 * 60);

          if (filters.timeRange === "1h") matchesTimeRange = hoursDiff <= 1;
          else if (filters.timeRange === "6h")
            matchesTimeRange = hoursDiff <= 6;
          else if (filters.timeRange === "24h")
            matchesTimeRange = hoursDiff <= 24;
        }
      } catch (e) {
        // Jika parsing timestamp gagal, tetap tampilkan
        matchesTimeRange = true;
      }
    }

    return (
      matchesSearch && matchesSeverity && matchesCategory && matchesTimeRange
    );
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";

    // Jika sudah format string seperti "3 minutes ago", return as is
    if (typeof timestamp === "string" && timestamp.includes("ago")) {
      return timestamp;
    }

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Unknown time";

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 1) return "just now";
      if (diffMins < 60)
        return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24)
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;

      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (e) {
      return "Unknown time";
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                Recent Alerts
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
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
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  maxLength="100"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={filters.severity}
                      onChange={(e) =>
                        setFilters({ ...filters, severity: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">All Severities</option>
                      <option value="danger">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="balance">Balance</option>
                      <option value="volume">Volume</option>
                      <option value="performance">Performance</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Range
                    </label>
                    <select
                      value={filters.timeRange}
                      onChange={(e) =>
                        setFilters({ ...filters, timeRange: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="1h">Last Hour</option>
                      <option value="6h">Last 6 Hours</option>
                      <option value="24h">Last 24 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

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
          </div>

          {/* Modal Body - Alerts List */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
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
                filteredAlerts.map((alert, index) => (
                  <div
                    key={alert.id || index}
                    className={`p-4 rounded-lg border-l-4 hover:bg-gray-50 transition-colors ${
                      alert.severity === "danger"
                        ? "bg-red-50 border-red-400"
                        : alert.severity === "warning"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
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
                            Contract:{" "}
                            {alert.nickname || alert.contract || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
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

          {/* Modal Footer */}
          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredAlerts.length} of {safeAlerts.length} alerts
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* AlertModal - Muncul ketika alert diklik */}
      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  );
}

function FloatingAlert({ alert, onClose, onShowDetails }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const handleClick = () => {
    if (onShowDetails) onShowDetails();
  };

  if (!isVisible || !alert) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-40 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isAnimating ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div
        onClick={handleClick}
        className={`cursor-pointer rounded-lg shadow-lg border-l-4 p-4 bg-white hover:shadow-xl transition-shadow duration-200 ${
          alert.severity === "danger"
            ? "border-red-500 hover:bg-red-50"
            : alert.severity === "warning"
              ? "border-yellow-500 hover:bg-yellow-50"
              : "border-blue-500 hover:bg-blue-50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1 mr-3">
            <span className="text-lg mr-2 flex-shrink-0">
              {alert.icon || "⚠️"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {alert.title || "Unknown Alert"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                alert.severity === "danger"
                  ? "bg-red-100 text-red-700"
                  : alert.severity === "warning"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {alert.severity === "danger"
                ? "Critical"
                : alert.severity === "warning"
                  ? "Warning"
                  : "Info"}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Click indicator */}
        <div className="mt-2 text-xs text-gray-400 flex items-center">
          <Info className="w-3 h-3 mr-1" />
          Click for details
        </div>
      </div>
    </div>
  );
}

// Main component that integrates with AgentService
export default function DynamicFloatingAlertSystem({ agentService }) {
  const [alerts, setAlerts] = useState([]);
  const [displayedAlert, setDisplayedAlert] = useState(null);
  const [showRecentAlertsModal, setShowRecentAlertsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from AgentService
  const fetchAlerts = async () => {
    if (!agentService) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const alertsData = await agentService.getAlerts();

      // Safety check untuk alertsData
      const safeAlertsData = Array.isArray(alertsData) ? alertsData : [];

      // Sort by timestamp (newest first) - handle string timestamps
      const sortedAlerts = safeAlertsData.sort((a, b) => {
        // Untuk timestamp string seperti "3 minutes ago", gunakan ID sebagai fallback
        if (a.id && b.id) {
          return b.id - a.id;
        }
        try {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateB - dateA;
          }
        } catch (e) {
          // Fallback ke urutan array
        }
        return 0;
      });

      setAlerts(sortedAlerts);

      // Show latest critical or warning alert if available
      const latestImportant = sortedAlerts.find(
        (alert) =>
          alert && (alert.severity === "danger" || alert.severity === "warning")
      );
      if (latestImportant && !displayedAlert) {
        setDisplayedAlert(latestImportant);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const closeFloatingAlert = () => {
    setDisplayedAlert(null);
  };

  const showRecentAlerts = () => {
    setShowRecentAlertsModal(true);
  };

  const closeRecentAlerts = () => {
    setShowRecentAlertsModal(false);
  };

  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, [agentService]);

  // Poll for new alerts every 30 seconds
  useEffect(() => {
    if (agentService) {
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [agentService]);

  if (!agentService) {
    return (
      <div className="fixed top-20 right-4 z-40 max-w-sm w-full">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">AgentService not provided</p>
        </div>
      </div>
    );
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="fixed top-20 right-4 z-40 max-w-sm w-full">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <p className="text-sm text-blue-700">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Alert - Shows latest important alert */}
      {displayedAlert && (
        <FloatingAlert
          alert={displayedAlert}
          onClose={closeFloatingAlert}
          onShowDetails={showRecentAlerts}
        />
      )}

      {/* Recent Alerts Modal */}
      {showRecentAlertsModal && (
        <RecentAlertsModal alerts={alerts} onClose={closeRecentAlerts} />
      )}
    </>
  );
}
