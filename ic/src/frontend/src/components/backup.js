import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  X,
  Filter,
  BarChart3,
  Clock,
  FileText,
  MessageCircle,
  Play,
  Pause,
  Snowflake,
  AlertCircle,
  Info,
  TrendingUp,
  Activity,
  Zap,
  RotateCcw,
  DollarSign,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Mock AgentService for demo
const AgentService = {
  checkAgentStatus: () => Promise.resolve({ connected: true }),
  getMonitoringData: () =>
    Promise.resolve({
      contracts: [
        {
          id: "uxrrr-q7777-77774-qaaaq-cai",
          nickname: "Contract-uxrrr-q7",
          status: "healthy",
          isActive: true,
          isPaused: false,
          addedAt: "Recently added",
          lastCheck: "Recently",
          uniqueKey: "uxrrr-q7777-77774-qaaaq-cai-0",
        },
      ],
      stats: {
        totalContracts: 1,
        healthyContracts: 1,
        alertsToday: 0,
      },
    }),
  getAlerts: () => Promise.resolve([]),
  startMonitoring: (address, nickname) => Promise.resolve({ success: true }),
  pauseMonitoring: (id) => Promise.resolve({ success: true }),
  resumeMonitoring: (id) => Promise.resolve({ success: true }),
};

// Alert Modal Component
function AlertModal({ alert, onClose }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Alert Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Alert Header */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">{alert.icon}</span>
            <div className="flex-1">
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
            </div>
          </div>

          {/* Severity Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
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
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1 font-medium">Contract</p>
            <p className="font-medium text-sm">{alert.nickname}</p>
            <p className="font-mono text-xs text-gray-600 break-all">
              {alert.contract}
            </p>
          </div>

          {/* Timestamp */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1 font-medium">Time</p>
            <p className="text-sm">{alert.timestamp}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Close
          </button>
          <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg transition-colors text-sm">
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
      <div className="bg-white rounded-lg max-w-sm w-full mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter Alerts
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-4 h-4" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleClearFilters}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={`p-4 rounded-lg shadow-lg border-l-4 ${
          type === "success"
            ? "bg-green-50 border-green-500 text-green-700"
            : type === "error"
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo Controls Component
function DemoControls({ onTrigger, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [demoStatus, setDemoStatus] = useState("Ready for live demonstration");

  const handleDemoTrigger = (alertType, alertName) => {
    onTrigger(alertType);
    setDemoStatus(`${alertName} triggered successfully!`);
    setTimeout(() => {
      setDemoStatus("Ready for live demonstration");
    }, 3000);
  };

  return (
    <div
      className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <h3 className="font-semibold text-gray-800 text-sm">Demo Controls</h3>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Demo
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Live
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-800 p-1"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          <p className="text-xs text-gray-600 mt-2 mb-4">
            For demonstration purposes - trigger test alerts
          </p>

          <div className="space-y-2 mb-4">
            <button
              onClick={() => handleDemoTrigger("test", "Test Alert")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Trigger Test Alert
            </button>

            <button
              onClick={() => handleDemoTrigger("balance", "Balance Drop")}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Balance Drop
            </button>

            <button
              onClick={() => handleDemoTrigger("activity", "High Activity")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              High Activity
            </button>
          </div>

          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-yellow-800">
                Demo Status:
              </p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">{demoStatus}</p>
          </div>
        </>
      )}
    </div>
  );
}

function CanaryContractGuardian() {
  const [contractAddress, setContractAddress] = useState("");
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

  // State for agent data
  const [agentStatus, setAgentStatus] = useState({ connected: false });
  const [monitoringData, setMonitoringData] = useState({
    contracts: [],
    stats: {
      totalContracts: 0,
      healthyContracts: 0,
      alertsToday: 0,
    },
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [activeTab, setActiveTab] = useState("monitored");
  const [mobileView, setMobileView] = useState("dashboard"); // 'dashboard', 'add', 'contracts', 'alerts'

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Input validation functions
  const validateContractAddress = (address) => {
    const canisterPattern =
      /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
    return canisterPattern.test(address);
  };

  const validateDiscordWebhook = (url) => {
    if (!url) return true;
    const discordPattern =
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
    return discordPattern.test(url);
  };

  const validateNickname = (nickname) => {
    if (!nickname) return true;
    const nicknamePattern = /^[a-zA-Z0-9\s\-_]{1,50}$/;
    return nicknamePattern.test(nickname);
  };

  const sanitizeInput = (input, maxLength = 100) => {
    return input
      .replace(/[<>\"'&]/g, "")
      .slice(0, maxLength)
      .trim();
  };

  // Enhanced input handlers with validation
  const handleContractAddressChange = (e) => {
    const value = e.target.value;
    const filtered = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const limited = filtered.slice(0, 29);
    setContractAddress(limited);
  };

  const handleNicknameChange = (e) => {
    const value = sanitizeInput(e.target.value, 50);
    const filtered = value.replace(/[^a-zA-Z0-9\s\-_]/g, "");
    setNickname(filtered);
  };

  const handleDiscordWebhookChange = (e) => {
    const value = sanitizeInput(e.target.value, 200);
    setDiscordWebhook(value);
  };

  const handleSearchChange = (e) => {
    const value = sanitizeInput(e.target.value, 100);
    const filtered = value.replace(/[^a-zA-Z0-9\s\-_\.]/g, "");
    setSearchTerm(filtered);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      contractAddress.trim() &&
      validateContractAddress(contractAddress.trim()) &&
      (nickname === "" || validateNickname(nickname)) &&
      (discordWebhook === "" || validateDiscordWebhook(discordWebhook))
    );
  };

  // Fetch data from AgentService
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const status = await AgentService.checkAgentStatus();
        setAgentStatus(status);

        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }

        const alertsData = await AgentService.getAlerts();
        setAlerts(alertsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle starting monitoring for a contract
  const handleStartMonitoring = async () => {
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      showToast("Please wait before submitting again", "error");
      return;
    }
    setLastSubmitTime(now);

    if (!contractAddress.trim()) {
      showToast("Please enter a contract address", "error");
      return;
    }

    if (!validateContractAddress(contractAddress.trim())) {
      showToast("Invalid contract address format", "error");
      return;
    }

    if (nickname && !validateNickname(nickname)) {
      showToast("Invalid nickname format", "error");
      return;
    }

    if (discordWebhook && !validateDiscordWebhook(discordWebhook)) {
      showToast("Invalid Discord webhook URL format", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await AgentService.startMonitoring(
        contractAddress.trim(),
        nickname.trim() || null
      );

      if (result.success) {
        showToast("✅ Successfully started monitoring contract!", "success");
        setContractAddress("");
        setNickname("");
        setDiscordWebhook("");
        setMobileView("contracts"); // Switch to contracts view on mobile

        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }
      } else {
        showToast(result.message || "Failed to start monitoring", "error");
      }
    } catch (error) {
      console.error("Error starting monitoring:", error);
      showToast("❌ Error starting monitoring", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle stopping monitoring
  const handleStopMonitoring = async (contractId) => {
    try {
      const result = await AgentService.pauseMonitoring(contractId);
      if (result.success) {
        showToast("🧊 Contract monitoring paused successfully", "success");

        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }
      } else {
        showToast(result.message || "Failed to pause monitoring", "error");
      }
    } catch (error) {
      console.error("Error pausing monitoring:", error);
      showToast("❌ Error pausing monitoring", "error");
    }
  };

  const handleResumeMonitoring = async (contractId) => {
    try {
      const result = await AgentService.resumeMonitoring(contractId);
      if (result.success) {
        showToast("✅ Contract monitoring resumed successfully", "success");
        setActiveTab("monitored");
        setMonitoringData((prev) => ({
          ...prev,
          contracts: prev.contracts.map((c) =>
            c.id === contractId
              ? { ...c, isActive: true, status: "healthy", isPaused: false }
              : c
          ),
        }));
      } else {
        showToast(result.message || "Failed to resume monitoring", "error");
      }
    } catch (error) {
      console.error("Error resuming monitoring:", error);
      showToast("❌ Error resuming monitoring", "error");
    }
  };

  // Filter alerts based on search term and filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      filters.severity === "all" || alert.severity === filters.severity;
    const matchesCategory =
      filters.category === "all" || alert.category === filters.category;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  // Remove duplicate contracts and ensure unique keys
  const uniqueContracts = monitoringData.contracts.reduce(
    (acc, contract, index) => {
      const existingContract = acc.find((c) => c.id === contract.id);
      if (!existingContract) {
        acc.push({ ...contract, uniqueKey: `${contract.id}-${index}` });
      }
      return acc;
    },
    []
  );

  // Filter contracts based on active tab
  const filteredContracts = uniqueContracts.filter((contract) => {
    const isMonitored =
      contract.isActive !== undefined
        ? contract.isActive === true || contract.isActive === "true"
        : contract.status !== "inactive" && contract.status !== "paused";

    if (activeTab === "monitored") {
      return isMonitored;
    } else {
      return !isMonitored;
    }
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.severity !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.timeRange !== "all") count++;
    return count;
  };

  // Mobile navigation component
  const MobileNavigation = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="grid grid-cols-4 gap-1 p-2">
        <button
          onClick={() => setMobileView("dashboard")}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            mobileView === "dashboard"
              ? "bg-orange-100 text-orange-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button
          onClick={() => setMobileView("add")}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            mobileView === "add"
              ? "bg-orange-100 text-orange-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs mt-1">Add</span>
        </button>
        <button
          onClick={() => setMobileView("contracts")}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            mobileView === "contracts"
              ? "bg-orange-100 text-orange-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs mt-1">Contracts</span>
        </button>
        <button
          onClick={() => setMobileView("alerts")}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
            mobileView === "alerts"
              ? "bg-orange-100 text-orange-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs mt-1">Alerts</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-4">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">🐦</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Canary Contract Guardian
              </h1>
              <p className="text-xs text-gray-600 leading-tight">
                Smart contract monitoring made simple
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat with AI</span>
              <span className="sm:hidden">AI</span>
            </button>
            <div className="flex items-center text-sm">
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  agentStatus.connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-xs ${
                  agentStatus.connected ? "text-green-600" : "text-red-600"
                }`}
              >
                Agent {agentStatus.connected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats Cards - Always Visible */}
      {(mobileView === "dashboard" || window.innerWidth >= 768) && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Contracts</p>
                  <p className="text-xl font-bold">
                    {monitoringData.stats.totalContracts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Healthy</p>
                  <p className="text-xl font-bold text-green-600">
                    {monitoringData.stats.healthyContracts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Alerts Today</p>
                  <p className="text-xl font-bold text-red-600">
                    {monitoringData.stats.alertsToday}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Last Check</p>
                  <p className="text-sm font-bold text-purple-600">
                    {agentStatus.connected ? "30s ago" : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content Areas */}
      <div className="px-4">
        {/* Add Contract Form - Mobile View */}
        {mobileView === "add" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Add Contract
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Address *
                  </label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={handleContractAddressChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base ${
                      contractAddress &&
                      !validateContractAddress(contractAddress)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                    maxLength="29"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                  {contractAddress &&
                    !validateContractAddress(contractAddress) && (
                      <p className="text-red-500 text-xs mt-1">
                        Invalid format. Use: xxxxx-xxxxx-xxxxx-xxxxx-xxx
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={handleNicknameChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base ${
                      nickname && !validateNickname(nickname)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., Main DEX Contract"
                    maxLength="50"
                    autoComplete="off"
                    spellCheck="true"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discord Webhook URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={discordWebhook}
                    onChange={handleDiscordWebhookChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base ${
                      discordWebhook && !validateDiscordWebhook(discordWebhook)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="https://discord.com/api/webhooks/..."
                    maxLength="200"
                    autoComplete="url"
                    spellCheck="false"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get notified in Discord when alerts are triggered
                  </p>
                </div>

                <button
                  onClick={handleStartMonitoring}
                  disabled={loading || !isFormValid()}
                  className={`w-full py-3 rounded-lg font-medium transition-colors text-base ${
                    loading || !isFormValid()
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                  type="button"
                >
                  {loading ? "Processing..." : "Start Monitoring"}
                </button>
              </div>
            </div>

            {/* Demo Controls for Mobile */}
            <DemoControls
              onTrigger={(alertType) => {
                const alertMessages = {
                  test: "🧪 Demo test alert generated!",
                  balance: "🚨 Demo balance drop alert created!",
                  activity: "⚠️ Demo high activity alert triggered!",
                };

                const message =
                  alertMessages[alertType] || "Demo alert triggered!";
                showToast(message, "success");

                const demoAlert = {
                  id: Date.now(),
                  icon:
                    alertType === "balance"
                      ? "🚨"
                      : alertType === "activity"
                        ? "⚠️"
                        : "🧪",
                  title: `Demo ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} Alert`,
                  description: `This is a demonstration alert for ${alertType} monitoring`,
                  contract: contractAddress || "demo-contract",
                  nickname: "Demo Contract",
                  timestamp: "Just now",
                  severity: alertType === "balance" ? "danger" : "warning",
                  rule: `Demo ${alertType} Rule`,
                  category: alertType,
                };

                setAlerts((prev) => [demoAlert, ...prev]);
                setMobileView("alerts"); // Switch to alerts view to show the new alert
              }}
            />
          </div>
        )}

        {/* Contracts View - Mobile */}
        {mobileView === "contracts" && (
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Smart Contract Monitoring
              </h2>
              <span className="text-sm text-gray-500">
                Total: {uniqueContracts.length}
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab("monitored")}
                className={`flex-1 py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "monitored"
                    ? "border-orange-500 text-orange-600 bg-orange-50"
                    : "border-transparent text-gray-500"
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Monitored (
                {
                  uniqueContracts.filter((c) =>
                    c.isActive !== undefined
                      ? c.isActive === true || c.isActive === "true"
                      : c.status !== "inactive" && c.status !== "paused"
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setActiveTab("not-monitored")}
                className={`flex-1 py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "not-monitored"
                    ? "border-gray-500 text-gray-600 bg-gray-50"
                    : "border-transparent text-gray-500"
                }`}
              >
                <Pause className="w-4 h-4 inline mr-1" />
                Not Monitored (
                {
                  uniqueContracts.filter((c) =>
                    c.isActive !== undefined
                      ? !(c.isActive === true || c.isActive === "true")
                      : c.status === "inactive" || c.status === "paused"
                  ).length
                }
                )
              </button>
            </div>

            {loading ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">Loading contracts...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                {activeTab === "monitored" ? (
                  <>
                    <p className="text-gray-500">
                      No contracts currently being monitored
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add a contract to start monitoring
                    </p>
                    <button
                      onClick={() => setMobileView("add")}
                      className="mt-2 text-orange-500 hover:text-orange-600 text-sm"
                    >
                      Go to Add Contract
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">No paused contracts</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Paused contracts will appear here
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.uniqueKey}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 mt-1 flex-shrink-0 ${
                            !contract.isActive || contract.isActive === "false"
                              ? "bg-gray-500"
                              : contract.isPaused === true ||
                                  contract.isPaused === "true"
                                ? "bg-orange-500"
                                : contract.status === "healthy"
                                  ? "bg-green-500"
                                  : contract.status === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {contract.nickname ||
                              `Contract ${contract.id?.substring(0, 8)}...`}
                          </p>
                          <p className="text-xs text-gray-600 font-mono break-all">
                            {contract.id}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Added {contract.addedAt} • Last check:{" "}
                            {contract.lastCheck}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                            !contract.isActive || contract.isActive === "false"
                              ? "bg-gray-100 text-gray-700"
                              : contract.isPaused === true ||
                                  contract.isPaused === "true"
                                ? "bg-orange-100 text-orange-700"
                                : contract.status === "healthy"
                                  ? "bg-green-100 text-green-700"
                                  : contract.status === "warning"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                          }`}
                        >
                          {!contract.isActive ||
                          contract.isActive === "false" ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" /> Not Monitored
                            </>
                          ) : contract.isPaused === true ||
                            contract.isPaused === "true" ? (
                            <>
                              <Snowflake className="w-3 h-3 mr-1" /> Frozen
                            </>
                          ) : contract.status === "healthy" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" /> Healthy
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />{" "}
                              {contract.status || "Unknown"}
                            </>
                          )}
                        </span>
                        {!contract.isActive || contract.isActive === "false" ? (
                          <button
                            onClick={() => handleResumeMonitoring(contract.id)}
                            className="text-green-500 hover:text-green-700 text-xs px-2 py-1 rounded hover:bg-green-50 flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Resume
                          </button>
                        ) : contract.isPaused === true ||
                          contract.isPaused === "true" ? (
                          <button
                            onClick={() => handleResumeMonitoring(contract.id)}
                            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Unfreeze
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStopMonitoring(contract.id)}
                            className="text-orange-500 hover:text-orange-700 text-xs px-2 py-1 rounded hover:bg-orange-50 flex items-center gap-1"
                          >
                            <Pause className="w-3 h-3" />
                            Pause
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alerts View - Mobile */}
        {mobileView === "alerts" && (
          <div className="bg-white rounded-lg border p-4">
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
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  maxLength="100"
                  autoComplete="off"
                  spellCheck="false"
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
                        className="text-orange-500 hover:text-orange-600 mt-2 text-sm"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p>No recent alerts</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Use demo controls to test alerts
                      </p>
                      <button
                        onClick={() => setMobileView("add")}
                        className="text-orange-500 hover:text-orange-600 mt-2 text-sm"
                      >
                        Go to Demo Controls
                      </button>
                    </div>
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
                      <div className="flex items-start flex-1">
                        <span className="text-xl mr-3 mt-1">{alert.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                            Contract: {alert.contract}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2">
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
        )}

        {/* Desktop Layout - Hidden on Mobile */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Add Contract */}
            <div className="space-y-6">
              {/* Add Contract Form */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Add Contract
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Address *
                    </label>
                    <input
                      type="text"
                      value={contractAddress}
                      onChange={handleContractAddressChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        contractAddress &&
                        !validateContractAddress(contractAddress)
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                      maxLength="29"
                      autoComplete="off"
                      spellCheck="false"
                      required
                    />
                    {contractAddress &&
                      !validateContractAddress(contractAddress) && (
                        <p className="text-red-500 text-xs mt-1">
                          Invalid format. Use: xxxxx-xxxxx-xxxxx-xxxxx-xxx
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nickname (Optional)
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={handleNicknameChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        nickname && !validateNickname(nickname)
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., Main DEX Contract"
                      maxLength="50"
                      autoComplete="off"
                      spellCheck="true"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discord Webhook URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={discordWebhook}
                      onChange={handleDiscordWebhookChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        discordWebhook &&
                        !validateDiscordWebhook(discordWebhook)
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="https://discord.com/api/webhooks/..."
                      maxLength="200"
                      autoComplete="url"
                      spellCheck="false"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get notified in Discord when alerts are triggered
                    </p>
                  </div>

                  <button
                    onClick={handleStartMonitoring}
                    disabled={loading || !isFormValid()}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      loading || !isFormValid()
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                    type="button"
                  >
                    {loading ? "Processing..." : "Start Monitoring"}
                  </button>
                </div>
              </div>

              {/* Demo Controls */}
              <DemoControls
                onTrigger={(alertType) => {
                  const alertMessages = {
                    test: "🧪 Demo test alert generated!",
                    balance: "🚨 Demo balance drop alert created!",
                    activity: "⚠️ Demo high activity alert triggered!",
                  };

                  const message =
                    alertMessages[alertType] || "Demo alert triggered!";
                  showToast(message, "success");

                  const demoAlert = {
                    id: Date.now(),
                    icon:
                      alertType === "balance"
                        ? "🚨"
                        : alertType === "activity"
                          ? "⚠️"
                          : "🧪",
                    title: `Demo ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} Alert`,
                    description: `This is a demonstration alert for ${alertType} monitoring`,
                    contract: contractAddress || "demo-contract",
                    nickname: "Demo Contract",
                    timestamp: "Just now",
                    severity: alertType === "balance" ? "danger" : "warning",
                    rule: `Demo ${alertType} Rule`,
                    category: alertType,
                  };

                  setAlerts((prev) => [demoAlert, ...prev]);
                }}
              />
            </div>

            {/* Right Panel - Monitored Contracts & Alerts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Monitored Contracts */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Smart Contract Monitoring
                  </h2>
                  <span className="text-sm text-gray-500">
                    Total: {uniqueContracts.length}
                  </span>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab("monitored")}
                    className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "monitored"
                        ? "border-orange-500 text-orange-600 bg-orange-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Monitored (
                    {
                      uniqueContracts.filter((c) =>
                        c.isActive !== undefined
                          ? c.isActive === true || c.isActive === "true"
                          : c.status !== "inactive" && c.status !== "paused"
                      ).length
                    }
                    )
                  </button>
                  <button
                    onClick={() => setActiveTab("not-monitored")}
                    className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "not-monitored"
                        ? "border-gray-500 text-gray-600 bg-gray-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Pause className="w-4 h-4 inline mr-1" />
                    Not Monitored (
                    {
                      uniqueContracts.filter((c) =>
                        c.isActive !== undefined
                          ? !(c.isActive === true || c.isActive === "true")
                          : c.status === "inactive" || c.status === "paused"
                      ).length
                    }
                    )
                  </button>
                </div>

                {loading ? (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500">Loading contracts...</p>
                  </div>
                ) : filteredContracts.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    {activeTab === "monitored" ? (
                      <>
                        <p className="text-gray-500">
                          No contracts currently being monitored
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add a contract address above to start monitoring
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500">No frozen contracts</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Frozen contracts will appear here
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract.uniqueKey}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 ${
                                !contract.isActive ||
                                contract.isActive === "false"
                                  ? "bg-gray-500"
                                  : contract.isPaused === true ||
                                      contract.isPaused === "true"
                                    ? "bg-orange-500"
                                    : contract.status === "healthy"
                                      ? "bg-green-500"
                                      : contract.status === "warning"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                              }`}
                            ></div>
                            <div>
                              <p className="font-medium">
                                {contract.nickname ||
                                  `Contract ${contract.id?.substring(0, 8)}...`}
                              </p>
                              <p className="text-sm text-gray-600 font-mono">
                                {contract.id}
                              </p>
                              <p className="text-xs text-gray-500">
                                Added {contract.addedAt} • Last check:{" "}
                                {contract.lastCheck}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                                !contract.isActive ||
                                contract.isActive === "false"
                                  ? "bg-gray-100 text-gray-700"
                                  : contract.isPaused === true ||
                                      contract.isPaused === "true"
                                    ? "bg-orange-100 text-orange-700"
                                    : contract.status === "healthy"
                                      ? "bg-green-100 text-green-700"
                                      : contract.status === "warning"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                              }`}
                            >
                              {!contract.isActive ||
                              contract.isActive === "false" ? (
                                <>
                                  <Pause className="w-3 h-3" /> Not Monitored
                                </>
                              ) : contract.isPaused === true ||
                                contract.isPaused === "true" ? (
                                <>
                                  <Snowflake className="w-3 h-3" /> Frozen
                                </>
                              ) : contract.status === "healthy" ? (
                                <>
                                  <CheckCircle className="w-3 h-3" /> Healthy
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3" />{" "}
                                  {contract.status || "Unknown"}
                                </>
                              )}
                            </span>
                            {!contract.isActive ||
                            contract.isActive === "false" ? (
                              <button
                                onClick={() =>
                                  handleResumeMonitoring(contract.id)
                                }
                                className="text-green-500 hover:text-green-700 text-sm px-2 py-1 rounded hover:bg-green-50 flex items-center gap-1"
                              >
                                ▶️ Resume
                              </button>
                            ) : contract.isPaused === true ||
                              contract.isPaused === "true" ? (
                              <button
                                onClick={() =>
                                  handleResumeMonitoring(contract.id)
                                }
                                className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                              >
                                ❄️ Unfreeze
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStopMonitoring(contract.id)
                                }
                                className="text-orange-500 hover:text-orange-700 text-sm px-2 py-1 rounded hover:bg-orange-50 flex items-center gap-1"
                              >
                                🧊 Freeze
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      maxLength="100"
                      autoComplete="off"
                      spellCheck="false"
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
                            <span className="text-xl mr-3 mt-1">
                              {alert.icon}
                            </span>
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
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

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

      {/* Chat Interface Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Chat with AI Agent</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-4">
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Chat interface would be integrated here
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Connect with your AI monitoring agent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t mt-12 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <p>© 2025 Canary Contract Guardian</p>
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
    </div>
  );
}

export default CanaryContractGuardian;
