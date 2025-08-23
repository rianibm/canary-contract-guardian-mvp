import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  X,
  Filter,
} from "lucide-react";
import AgentService from "../services/AgentService";
import ChatInterface from "./ChatInterface";
import ManualTrigger from "./ManualTrigger";
import Toast from "./Toast";

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
  const [activeTab, setActiveTab] = useState('monitored'); // 'monitored' or 'not-monitored'

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Input validation functions
  const validateContractAddress = (address) => {
    // IC canister format: xxxxx-xxxxx-xxxxx-xxxxx-xxx (lowercase letters and numbers)
    const canisterPattern = /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
    return canisterPattern.test(address);
  };

  const validateDiscordWebhook = (url) => {
    if (!url) return true; // Optional field
    const discordPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
    return discordPattern.test(url);
  };

  const validateNickname = (nickname) => {
    if (!nickname) return true; // Optional field
    // Only allow alphanumeric, spaces, hyphens, and underscores, max 50 chars
    const nicknamePattern = /^[a-zA-Z0-9\s\-_]{1,50}$/;
    return nicknamePattern.test(nickname);
  };

  const sanitizeInput = (input, maxLength = 100) => {
    // Remove potential XSS characters and limit length
    return input
      .replace(/[<>\"'&]/g, '')
      .slice(0, maxLength)
      .trim();
  };

  // Enhanced input handlers with validation
  const handleContractAddressChange = (e) => {
    const value = e.target.value;
    // Convert to lowercase and only allow letters, numbers, and hyphens
    const filtered = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    // Limit to IC canister ID max length
    const limited = filtered.slice(0, 29);
    setContractAddress(limited);
  };

  const handleNicknameChange = (e) => {
    const value = sanitizeInput(e.target.value, 50);
    // Only allow alphanumeric, spaces, hyphens, underscores
    const filtered = value.replace(/[^a-zA-Z0-9\s\-_]/g, '');
    setNickname(filtered);
  };

  const handleDiscordWebhookChange = (e) => {
    const value = sanitizeInput(e.target.value, 200);
    setDiscordWebhook(value);
  };

  const handleSearchChange = (e) => {
    const value = sanitizeInput(e.target.value, 100);
    // Allow alphanumeric, spaces, and basic punctuation for search
    const filtered = value.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
    setSearchTerm(filtered);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      contractAddress.trim() &&
      validateContractAddress(contractAddress.trim()) &&
      (nickname === '' || validateNickname(nickname)) &&
      (discordWebhook === '' || validateDiscordWebhook(discordWebhook))
    );
  };

  // Fetch data from AgentService
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check agent status
        const status = await AgentService.checkAgentStatus();
        setAgentStatus(status);

        // Get monitoring data
        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }

        // Get alerts
        const alertsData = await AgentService.getAlerts();
        setAlerts(alertsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle starting monitoring for a contract
  const handleStartMonitoring = async () => {
    // Rate limiting - prevent spam submissions
    const now = Date.now();
    if (now - lastSubmitTime < 3000) { // 3 second cooldown
      showToast("Please wait before submitting again", "error");
      return;
    }
    setLastSubmitTime(now);

    // Validation checks
    if (!contractAddress.trim()) {
      showToast("Please enter a contract address", "error");
      return;
    }

    if (!validateContractAddress(contractAddress.trim())) {
      showToast("Invalid contract address format. Expected: xxxxx-xxxxx-xxxxx-xxxxx-xxx (letters, numbers, hyphens only)", "error");
      return;
    }

    if (nickname && !validateNickname(nickname)) {
      showToast("Invalid nickname. Use only letters, numbers, spaces, hyphens, and underscores (max 50 chars)", "error");
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
        
        // Refresh monitoring data
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

  // Handle removing a contract from monitoring
  const handleStopMonitoring = async (contractId) => {
    try {
      // Instead of removing, we'll pause the contract
      const result = await AgentService.pauseMonitoring(contractId);
      if (result.success) {
        showToast("✅ Contract monitoring paused successfully", "success");
        
        // Refresh monitoring data
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
      // Resume monitoring by resuming the paused contract
      const result = await AgentService.resumeMonitoring(contractId);
      if (result.success) {
        showToast("✅ Contract monitoring resumed successfully", "success");
        
        // Refresh monitoring data
        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }
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
  const uniqueContracts = monitoringData.contracts.reduce((acc, contract, index) => {
    const existingContract = acc.find(c => c.id === contract.id);
    if (!existingContract) {
      acc.push({ ...contract, uniqueKey: `${contract.id}-${index}` });
    }
    return acc;
  }, []);

  // Filter contracts based on active tab
  const filteredContracts = uniqueContracts.filter(contract => {
    const isActive = contract.status !== 'inactive' && contract.status !== 'paused';
    
    if (activeTab === 'monitored') {
      return isActive;
    } else {
      return !isActive;
    }
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
            <button 
              onClick={() => setShowChat(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              💬 Chat with AI Agent
            </button>
            <div className="flex items-center text-green-600">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                agentStatus.connected ? "bg-green-500" : "bg-red-500"
              }`}></div>
              {agentStatus.connected ? "Agent Online" : "Agent Offline"}
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
              <p className="text-2xl font-bold">{monitoringData.stats.totalContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Healthy</p>
              <p className="text-xl font-bold text-green-600">{monitoringData.stats.healthyContracts}</p>
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
              <p className="text-2xl font-bold text-red-600">{monitoringData.stats.alertsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">⏰</div>
            <div>
              <p className="text-gray-600 text-sm">Last Check</p>
              <p className="text-lg font-bold text-purple-600">
                {agentStatus.connected ? "30s ago" : "Unknown"}
              </p>
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
                  Contract Address *
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={handleContractAddressChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    contractAddress && !validateContractAddress(contractAddress) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                  maxLength="29"
                  pattern="[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}"
                  title="Letters, numbers, and hyphens only (automatically converted to lowercase)"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
                {contractAddress && !validateContractAddress(contractAddress) && (
                  <p className="text-red-500 text-xs mt-1">
                    Invalid format. Use: xxxxx-xxxxx-xxxxx-xxxxx-xxx (letters, numbers, and hyphens only)
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
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Main DEX Contract"
                  maxLength="50"
                  pattern="[a-zA-Z0-9\s\-_]{1,50}"
                  title="Letters, numbers, spaces, hyphens, and underscores only (max 50 chars)"
                  autoComplete="off"
                  spellCheck="true"
                />
                {nickname && !validateNickname(nickname) && (
                  <p className="text-red-500 text-xs mt-1">
                    Use only letters, numbers, spaces, hyphens, and underscores (max 50 characters)
                  </p>
                )}
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
                    discordWebhook && !validateDiscordWebhook(discordWebhook) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="https://discord.com/api/webhooks/..."
                  maxLength="200"
                  pattern="https://discord\.com/api/webhooks/\d+/[A-Za-z0-9_-]+"
                  title="Discord webhook URL format"
                  autoComplete="url"
                  spellCheck="false"
                />
                {discordWebhook && !validateDiscordWebhook(discordWebhook) && (
                  <p className="text-red-500 text-xs mt-1">
                    Invalid Discord webhook URL format
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Get notified in Discord when alerts are triggered
                </p>
              </div>

              {/* Honeypot field for bot prevention */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label>If you are human, leave this field blank</label>
                <input
                  type="text"
                  name="website"
                  value=""
                  onChange={() => {}}
                  tabIndex="-1"
                  autoComplete="off"
                />
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

          {/* Manual/Demo Controls */}
          <ManualTrigger 
            showToast={showToast}
            onTrigger={(alertType) => {
              // Handle demo trigger events
              const alertMessages = {
                'test': '🧪 Demo test alert generated!',
                'balance': '🚨 Demo balance drop alert created!',
                'transaction': '⚠️ Demo high activity alert triggered!',
              };
              
              const message = alertMessages[alertType] || '✅ Demo alert triggered!';
              showToast(message, 'success');
              
              // Optionally add demo alert to the alerts list
              const demoAlert = {
                id: Date.now(),
                icon: alertType === 'balance' ? '🚨' : alertType === 'transaction' ? '⚠️' : '🧪',
                title: `Demo ${alertType.charAt(0).toUpperCase() + alertType.slice(1)} Alert`,
                description: `This is a demonstration alert for ${alertType} monitoring`,
                contract: contractAddress || 'demo-contract',
                nickname: 'Demo Contract',
                timestamp: 'Just now',
                severity: alertType === 'balance' ? 'danger' : 'warning',
                rule: `Demo ${alertType} Rule`,
                category: alertType,
              };
              
              setAlerts(prev => [demoAlert, ...prev]);
            }}
          />
        </div>

        {/* Right Panel - Monitored Contracts & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monitored Contracts */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center">
                📊 Smart Contract Monitoring
              </h2>
              <span className="text-sm text-gray-500">
                Total: {uniqueContracts.length}
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('monitored')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'monitored'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✅ Monitored ({uniqueContracts.filter(c => c.status !== 'inactive' && c.status !== 'paused').length})
              </button>
              <button
                onClick={() => setActiveTab('not-monitored')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'not-monitored'
                    ? 'border-gray-500 text-gray-600 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⏸️ Not Monitored ({uniqueContracts.filter(c => c.status === 'inactive' || c.status === 'paused').length})
              </button>
            </div>

            {loading ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">Loading contracts...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                {activeTab === 'monitored' ? (
                  <>
                    <p className="text-gray-500">No contracts currently being monitored</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add a contract address above to start monitoring
                    </p>
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
                  <div key={contract.uniqueKey} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          contract.status === "healthy" ? "bg-green-500" : 
                          contract.status === "warning" ? "bg-yellow-500" : 
                          contract.status === "inactive" || contract.status === "paused" ? "bg-gray-500" :
                          "bg-red-500"
                        }`}></div>
                        <div>
                          <p className="font-medium">
                            {contract.nickname || `Contract ${contract.id?.substring(0, 8)}...`}
                          </p>
                          <p className="text-sm text-gray-600 font-mono">
                            {contract.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added {contract.addedAt} • Last check: {contract.lastCheck}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                          contract.status === "healthy" ? "bg-green-100 text-green-700" :
                          contract.status === "warning" ? "bg-yellow-100 text-yellow-700" : 
                          contract.status === "inactive" || contract.status === "paused" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {contract.status === "healthy" ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : contract.status === "inactive" || contract.status === "paused" ? (
                            <span className="w-4 h-4 mr-1">⏸️</span>
                          ) : (
                            <AlertTriangle className="w-4 h-4 mr-1" />
                          )}
                          {contract.status === "inactive" || contract.status === "paused" ? "Paused" : 
                           contract.status || "Unknown"}
                        </span>
                        {contract.status === "inactive" || contract.status === "paused" ? (
                          <button
                            onClick={() => handleResumeMonitoring(contract.id)}
                            className="text-green-500 hover:text-green-700 text-sm px-2 py-1 rounded hover:bg-green-50 flex items-center gap-1"
                          >
                            ▶️ Resume
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStopMonitoring(contract.id)}
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 flex items-center gap-1"
                          >
                            ⏸️ Pause
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

      {/* Chat Interface Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Chat with AI Agent</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface 
                isConnected={agentStatus.connected}
                onSendMessage={(message) => {
                  // Optional: handle message in dashboard if needed
                  console.log("Message sent:", message);
                }}
              />
            </div>
          </div>
        </div>
      )}

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
