import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Pause,
  Snowflake,
  Activity,
  Shield,
  Eye,
  Star,
  User,
} from "lucide-react";
import AgentService from "../services/AgentService";
import ChatInterface from "./ChatInterface";
import Toast from "./Toast";
import DynamicFloatingAlertSystem from "./FloatingAlert";
import Footer from "./Footer";
import Auth from "./Auth";
import agentService from "../services/AgentService";

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

// Typewriter Component for animated text
function TypewriterText() {
  const [text, setText] = useState("");
  const fullText = "Protect Your Contracts";

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent leading-tight text-start">
      {text}
      <span className="animate-pulse">|</span>
    </h1>
  );
}

// Scrolling Header Component
function ScrollingHeader({
  onChatClick,
  agentStatus,
  isLoggedIn,
  onTryNowClick,
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/30 dark:bg-gray-900/30 backdrop-blur-3xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`transition-all duration-300 ${scrolled ? "" : "hidden sm:block"}`}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <img
                src="/canary-bird-logo.png"
                alt="Canary Bird Logo"
                style={{
                  width: scrolled ? "30px" : "60px",
                  height: "auto",
                  transition: "width 0.3s ease",
                }}
              />
              <div className="flex flex-col">
                <h1
                  className={`font-bold text-gray-900 dark:text-white transition-all duration-300 ${
                    scrolled ? "text-lg" : "text-2xl"
                  }`}
                >
                  Canary Contract Guardian
                </h1>
                {!scrolled && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Smart contract monitoring made simple
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onChatClick}
              className="bg-[#f5f5f5] dark:bg-gray-700 hover:border-orange-600 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span
                className={`transition-all duration-300 ${scrolled ? "hidden sm:inline" : "inline"}`}
              >
                Chat with AI Agent
              </span>
            </button>
            <button
              onClick={isLoggedIn ? onTryNowClick : onTryNowClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <User />
              {isLoggedIn ? "Profile" : "Unlock Full Features"}
            </button>
            <div
              className={`flex items-center transition-all duration-300 ${
                agentStatus.connected ? "text-green-600" : "text-red-500"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  agentStatus.connected
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm transition-all duration-300 ${scrolled ? "hidden lg:inline" : "inline"}`}
              >
                {agentStatus.connected ? "Agent Online" : "Agent Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Hero Section Component
function HeroSection() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const scrollToAddContract = () => {
    const element = document.querySelector("[data-add-contract]");
    if (element) {
      const headerHeight = 20; // Adjust this value based on your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const features = [
    {
      icon: Shield,
      text: "Advanced Security Monitoring",
      color: "text-blue-500",
    },
    {
      icon: Eye,
      text: "Real-time Contract Surveillance",
      color: "text-green-500",
    },
    {
      icon: Bell,
      text: "Instant Alert Notifications",
      color: "text-orange-500",
    },
    { icon: Activity, text: "Performance Analytics", color: "text-purple-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with animated gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto px-4 text-center mt-20 w-[90%]">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side - Text content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <TypewriterText />

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0 leading-relaxed text-start">
                Advanced AI-powered monitoring that watches your smart contracts
                24/7, alerting you to potential risks before they become
                problems.
              </p>
            </div>

            {/* Rotating features */}
            <div className="flex items-center justify-center lg:justify-start gap-3 h-16">
              <div className="flex items-center gap-3 transition-all duration-500">
                {React.createElement(features[currentFeature].icon, {
                  className: `w-6 h-6 ${features[currentFeature].color}`,
                })}
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {features[currentFeature].text}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Visual elements */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              {/* Monitoring visualization */}
              <div className="w-80 h-80 mx-auto flex items-center justify-center">
                {/* Radar rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-96 h-96 border border-orange-200 rounded-full animate-ping"></div>
                  <div
                    className="absolute w-80 h-80 border border-orange-300 rounded-full animate-ping"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute w-64 h-64 border border-orange-400 rounded-full animate-ping"
                    style={{ animationDelay: "2s" }}
                  ></div>
                </div>

                {/* Central monitoring icon */}
                <div className="flex flex-col items-center justify-center">
                  <img
                    src="/shield.webp"
                    alt="Canary Shield"
                    className="w-20 h-20 lg:w-40 lg:h-40"
                  />
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4" />
                    Your Smart Contract Guardian
                  </div>
                </div>

                {/* Floating status indicators */}
                <div
                  className="absolute top-8 right-8 
                bg-green-100 text-green-700 
                px-3 py-1 rounded-full text-sm font-medium
                opacity-50 hover:opacity-100
                backdrop-blur-sm hover:backdrop-blur-0
                transition-all duration-300 animate-slow-bounce"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  All Secure
                </div>

                <div
                  className="absolute bottom-10 left-2 
                bg-blue-100 text-blue-700 
                px-3 py-1 rounded-full text-sm font-medium
                opacity-50 hover:opacity-100
                backdrop-blur-sm hover:backdrop-blur-0
                transition-all duration-300 animate-slow-bounce"
                >
                  <Activity className="w-4 h-4 inline mr-1" />
                  Monitoring
                </div>

                <div
                  className="absolute top-16 left-16 
                bg-orange-100 text-orange-700 
                px-3 py-1 rounded-full text-sm font-medium
                opacity-50 hover:opacity-100
                backdrop-blur-sm hover:backdrop-blur-0
                transition-all duration-300 animate-slow-bounce"
                >
                  <Bell className="w-4 h-4 inline mr-1" />
                  Alert Ready
                </div>

                <div
                  className="absolute bottom-2 right-16 
                bg-purple-100 text-purple-700 
                px-3 py-1 rounded-full text-sm font-medium
                opacity-50 hover:opacity-100
                backdrop-blur-sm hover:backdrop-blur-0
                transition-all duration-300 animate-slow-bounce"
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Analytics
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* CTA Buttons */}
        <button
          onClick={scrollToAddContract}
          className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex text-center gap-2 group justify-center"
        >
          Start Free!
        </button>
      </div>
    </div>
  );
}

function CanaryContractGuardian() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // False: show login functionality
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState(null);
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
  const [activeTab, setActiveTab] = useState("monitored"); // 'monitored' or 'not-monitored'
  const [contractSearchTerm, setContractSearchTerm] = useState(""); // Add this with other state variables
  const addContractRef = useRef(null); // for scrolling to add contract

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Add handler function for Try Now button
  const handleTryNowClick = () => {
    setShowLoginModal(true);
  };

  // Handle successful login
  const handleLogin = (user) => {
    setUserData(user);
    setIsLoggedIn(true);
    showToast(`Welcome back, ${user.name}!`, "success");
  };

  // Input validation functions
  const validateContractAddress = (address) => {
    // IC canister format: xxxxx-xxxxx-xxxxx-xxxxx-xxx (lowercase letters and numbers)
    const canisterPattern =
      /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
    return canisterPattern.test(address);
  };

  const validateDiscordWebhook = (url) => {
    if (!url) return true; // Optional field
    const discordPattern =
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
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
      .replace(/[<>\"'&]/g, "")
      .slice(0, maxLength)
      .trim();
  };

  // Enhanced input handlers with validation
  const handleContractAddressChange = (e) => {
    const value = e.target.value;
    // Convert to lowercase and only allow letters, numbers, and hyphens
    const filtered = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    // Limit to IC canister ID max length
    const limited = filtered.slice(0, 29);
    setContractAddress(limited);
  };

  const handleNicknameChange = (e) => {
    const value = sanitizeInput(e.target.value, 50);
    // Only allow alphanumeric, spaces, hyphens, underscores
    const filtered = value.replace(/[^a-zA-Z0-9\s\-_]/g, "");
    setNickname(filtered);
  };

  const handleDiscordWebhookChange = (e) => {
    const value = sanitizeInput(e.target.value, 200);
    setDiscordWebhook(value);
  };

  const handleSearchChange = (e) => {
    const value = sanitizeInput(e.target.value, 100);
    // Allow alphanumeric, spaces, and basic punctuation for search
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
    if (now - lastSubmitTime < 3000) {
      // 3 second cooldown
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
      showToast(
        "Invalid contract address format. Expected: xxxxx-xxxxx-xxxxx-xxxxx-xxx (letters, numbers, hyphens only)",
        "error"
      );
      return;
    }

    if (nickname && !validateNickname(nickname)) {
      showToast(
        "Invalid nickname. Use only letters, numbers, spaces, hyphens, and underscores (max 50 chars)",
        "error"
      );
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

  // Handle freezing a contract from monitoring
  const handleStopMonitoring = async (contractId) => {
    try {
      // Instead of removing, we'll freeze the contract
      const result = await AgentService.pauseMonitoring(contractId);
      if (result.success) {
        showToast("🧊 Contract monitoring frozen successfully", "success");

        // Refresh monitoring data
        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }
      } else {
        showToast(result.message || "Failed to freeze monitoring", "error");
      }
    } catch (error) {
      console.error("Error freezing monitoring:", error);
      showToast("❌ Error freezing monitoring", "error");
    }
  };

  const handleUnfreezeMonitoring = async (contractId) => {
    try {
      // Unfreeze the contract by resuming monitoring
      const result = await AgentService.resumeMonitoring(contractId);
      if (result.success) {
        showToast("❄️ Contract monitoring unfrozen successfully", "success");

        // Refresh monitoring data
        const monitoring = await AgentService.getMonitoringData();
        if (monitoring) {
          setMonitoringData(monitoring);
        }
      } else {
        showToast(result.message || "Failed to unfreeze monitoring", "error");
      }
    } catch (error) {
      console.error("Error unfreezing monitoring:", error);
      showToast("❌ Error unfreezing monitoring", "error");
    }
  };

  const handleResumeMonitoring = async (contractId) => {
    try {
      const result = await AgentService.resumeMonitoring(contractId);
      console.log("[ResumeMonitoring] API Response:", result);
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
        const refreshFromBackend = async (attempt = 1) => {
          try {
            const monitoring = await AgentService.getMonitoringData();
            console.log(
              `[ResumeMonitoring] Backend contracts after refresh (attempt ${attempt}):`,
              monitoring.contracts
            );
            if (monitoring) {
              setMonitoringData(monitoring);
              const updatedContract = monitoring.contracts.find(
                (c) => c.id === contractId
              );
              const isProperlyResumed =
                updatedContract &&
                (updatedContract.isActive === true ||
                  updatedContract.isActive === "true") &&
                (updatedContract.isPaused === false ||
                  updatedContract.isPaused === "false");
              if (!isProperlyResumed && attempt < 5) {
                setTimeout(
                  () => refreshFromBackend(attempt + 1),
                  1000 * attempt
                );
              } else {
                console.log(
                  `[ResumeMonitoring] Final contract state:`,
                  updatedContract
                );
              }
            }
          } catch (error) {
            console.error(
              `[ResumeMonitoring] Backend refresh attempt ${attempt} failed:`,
              error
            );
            if (attempt < 3) {
              setTimeout(() => refreshFromBackend(attempt + 1), 2000);
            }
          }
        };
        setTimeout(() => refreshFromBackend(1), 200);
      } else {
        showToast(result.message || "Failed to resume monitoring", "error");
        console.error("[ResumeMonitoring] Resume failed:", result);
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
        // Debug logging to understand contract data structure
        console.log("Contract data:", contract);
        acc.push({ ...contract, uniqueKey: `${contract.id}-${index}` });
      }
      return acc;
    },
    []
  );

  // New handler for contract search
  const handleContractSearchChange = (e) => {
    const value = sanitizeInput(e.target.value, 100);
    const filtered = value.replace(/[^a-zA-Z0-9\s\-_\.]/g, "");
    setContractSearchTerm(filtered);
  };

  // Enhanced contract filtering with search functionality
  const filteredContracts = uniqueContracts.filter((contract) => {
    // Filter by tab (monitored vs not monitored)
    const isMonitored =
      contract.isActive !== undefined
        ? contract.isActive === true || contract.isActive === "true"
        : contract.status !== "inactive" && contract.status !== "paused";

    const matchesTab = activeTab === "monitored" ? isMonitored : !isMonitored;

    if (!matchesTab) return false;

    // Apply search filter for contracts
    if (contractSearchTerm.trim() === "") return true;

    const searchLower = contractSearchTerm.toLowerCase();

    // Search in nickname (if exists)
    const nicknameMatch = contract.nickname
      ? contract.nickname.toLowerCase().includes(searchLower)
      : false;

    // Search in contract address/ID
    const addressMatch = contract.id
      ? contract.id.toLowerCase().includes(searchLower)
      : false;

    return nicknameMatch || addressMatch;
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.severity !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.timeRange !== "all") count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <ScrollingHeader
        agentStatus={agentStatus}
        onChatClick={() => setShowChat(true)}
        isLoggedIn={isLoggedIn}
        onTryNowClick={handleTryNowClick}
      />

      {/* Hero Section - Only show when not logged in */}
      {!isLoggedIn && <HeroSection />}

      <div className={isLoggedIn ? "pt-[100px]" : ""}>
        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-5">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Contracts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {monitoringData.stats.totalContracts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Healthy</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {monitoringData.stats.healthyContracts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg mr-3">
                <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Alerts Today</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {monitoringData.stats.alertsToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Last Check</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {agentStatus.connected ? "30s ago" : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
          {/* Left Panel - Add Contract */}
          <div className="space-y-6">
            {/* Add Contract Form */}
            <div
              ref={addContractRef}
              data-add-contract
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <FileText className="w-5 h-5" />
                Add Contract
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Address *
                  </label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={handleContractAddressChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      contractAddress && !validateContractAddress(contractAddress)
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                    maxLength="29"
                    pattern="[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}"
                    title="Letters, numbers, and hyphens only (automatically converted to lowercase)"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                  {contractAddress &&
                    !validateContractAddress(contractAddress) && (
                      <p className="text-red-500 text-xs mt-1">
                        Invalid format. Use: xxxxx-xxxxx-xxxxx-xxxxx-xxx (letters,
                        numbers, and hyphens only)
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
                    pattern="[a-zA-Z0-9\s\-_]{1,50}"
                    title="Letters, numbers, spaces, hyphens, and underscores only (max 50 chars)"
                    autoComplete="off"
                    spellCheck="true"
                  />
                  {nickname && !validateNickname(nickname) && (
                    <p className="text-red-500 text-xs mt-1">
                      Use only letters, numbers, spaces, hyphens, and underscores
                      (max 50 characters)
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
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
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
                <div style={{ display: "none" }} aria-hidden="true">
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
          </div>

          {/* Right Panel - Monitored Contracts & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monitored Contracts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <BarChart3 className="w-5 h-5" />
                  Smart Contract Monitoring
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {uniqueContracts.length}
                </span>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                <button
                  onClick={() => setActiveTab("monitored")}
                  className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "monitored"
                      ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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

              {/* Contract Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search contracts by nickname or address..."
                    value={contractSearchTerm}
                    onChange={handleContractSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    maxLength="100"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {contractSearchTerm && (
                    <button
                      onClick={() => setContractSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {contractSearchTerm && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Showing {filteredContracts.length} contract
                    {filteredContracts.length !== 1 ? "s" : ""} matching "
                    {contractSearchTerm}"
                  </p>
                )}
              </div>

              {loading ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading contracts...</p>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  {activeTab === "monitored" ? (
                    <>
                      <p className="text-gray-500 dark:text-gray-400">
                        No contracts currently being monitored
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Add a contract address above to start monitoring
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 dark:text-gray-400">No frozen contracts</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Frozen contracts will appear here
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3 grid grid-cols-2 gap-3">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract.uniqueKey}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
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
                          {!contract.isActive || contract.isActive === "false" ? (
                            <button
                              onClick={() => handleResumeMonitoring(contract.id)}
                              className="text-green-500 hover:text-green-700 text-sm px-2 py-1 rounded hover:bg-green-50 flex items-center gap-1"
                            >
                              ▶️ Resume
                            </button>
                          ) : contract.isPaused === true ||
                            contract.isPaused === "true" ? (
                            isLoggedIn && (
                              <button
                                onClick={() =>
                                  handleUnfreezeMonitoring(contract.id)
                                }
                                className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                              >
                                ❄️ Unfreeze
                              </button>
                            )
                          ) : (
                            isLoggedIn && (
                              <button
                                onClick={() => handleStopMonitoring(contract.id)}
                                className="text-orange-500 hover:text-orange-700 text-sm px-2 py-1 rounded hover:bg-orange-50 flex items-center gap-1"
                              >
                                🛑 Stop Monitor
                              </button>
                            )
                          )}
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

      {/* Chat Interface Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chat with AI Agent</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors"
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

      {/* Recent Alert */}
      <DynamicFloatingAlertSystem agentService={agentService} />

      {/* Login Modal */}
      <Auth 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      {/* Footer */}
      <Footer />

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
