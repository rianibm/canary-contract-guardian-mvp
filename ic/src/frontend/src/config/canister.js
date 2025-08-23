import { Actor, HttpAgent } from "@dfinity/agent";

// Canister configuration
export const canisterConfig = {
  canisterId: process.env.REACT_APP_CANISTER_ID,
  host:
    process.env.NODE_ENV === "production"
      ? "https://ic0.app"
      : "http://localhost:4943", // Updated to match dfx default port
};

// IDL Factory updated to match main.mo and Types.mo
const idlFactory = ({ IDL }) => {
  // ============================================================================
  // TYPE DEFINITIONS MATCHING Types.mo
  // ============================================================================

  const ContractStatus = IDL.Variant({
    healthy: IDL.Null,
    warning: IDL.Null,
    critical: IDL.Null,
    offline: IDL.Null, // Added offline status from Types.mo
  });

  const AlertSeverity = IDL.Variant({
    info: IDL.Null,
    warning: IDL.Null,
    danger: IDL.Null,
    critical: IDL.Null,
  });

  const RuleType = IDL.Variant({
    balanceCheck: IDL.Null,
    transactionVolume: IDL.Null,
    functionCall: IDL.Null,
    custom: IDL.Null,
  });

  // AlertData for structured alert information
  const AlertData = IDL.Variant({
    balanceChange: IDL.Record({
      previousBalance: IDL.Float64,
      currentBalance: IDL.Float64,
      percentageChange: IDL.Float64,
    }),
    transactionSpike: IDL.Record({
      transactionCount: IDL.Nat,
      timeWindow: IDL.Nat,
      normalVolume: IDL.Nat,
    }),
    functionCall: IDL.Record({
      functionName: IDL.Text,
      caller: IDL.Text,
      gasUsed: IDL.Opt(IDL.Nat),
    }),
    custom: IDL.Record({
      details: IDL.Text,
    }),
  });

  // Contract record matching main.mo
  const Contract = IDL.Record({
    id: IDL.Nat,
    address: IDL.Text,
    nickname: IDL.Text,
    status: ContractStatus,
    addedAt: IDL.Int,
    lastCheck: IDL.Int,
    alertCount: IDL.Nat,
    isActive: IDL.Bool, // Added from main.mo
    isPaused: IDL.Bool, // Added from main.mo
    quarantinedAddresses: IDL.Vec(IDL.Text), // Added from main.mo
  });

  // Alert record matching main.mo
  const Alert = IDL.Record({
    id: IDL.Nat,
    contractId: IDL.Nat,
    contractAddress: IDL.Text,
    contractNickname: IDL.Text,
    ruleId: IDL.Nat,
    ruleName: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    severity: IDL.Text, // Keep as text for compatibility with frontend
    timestamp: IDL.Int,
    acknowledged: IDL.Bool,
    data: IDL.Opt(AlertData), // Added optional alert data
  });

  const ApiResponse = (T) =>
    IDL.Variant({
      ok: T,
      err: IDL.Text,
    });

  const SystemStats = IDL.Record({
    totalContracts: IDL.Nat,
    activeContracts: IDL.Opt(IDL.Nat), // Made optional as per Types.mo
    totalAlerts: IDL.Nat,
    activeAlerts: IDL.Nat,
    acknowledgedAlerts: IDL.Opt(IDL.Nat), // Added from Types.mo
    systemStatus: IDL.Text,
    lastUpdate: IDL.Opt(IDL.Int), // Added from Types.mo
  });

  const MonitoringRule = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    description: IDL.Text,
    ruleType: RuleType, // Updated to use RuleType variant
    enabled: IDL.Bool,
    threshold: IDL.Opt(IDL.Float64), // Added threshold
    timeWindow: IDL.Opt(IDL.Nat), // Added timeWindow
  });

  // Health status for health check
  const HealthStatus = IDL.Record({
    status: IDL.Text,
    timestamp: IDL.Int,
    canisterPrincipal: IDL.Text,
    memoryUsage: IDL.Opt(IDL.Nat),
    uptime: IDL.Opt(IDL.Int),
  });

  // Canister info for version endpoint
  const CanisterInfo = IDL.Record({
    name: IDL.Text,
    version: IDL.Text,
    description: IDL.Text,
    features: IDL.Vec(IDL.Text),
    supportedRules: IDL.Opt(IDL.Vec(IDL.Text)), // Made optional
  });

  // ============================================================================
  // SERVICE DEFINITION MATCHING main.mo
  // ============================================================================

  return IDL.Service({
    // Contract Management
    addContract: IDL.Func([IDL.Text, IDL.Text], [ApiResponse(Contract)], []),
    getContracts: IDL.Func([], [IDL.Vec(Contract)], ["query"]),
    getContract: IDL.Func([IDL.Nat], [ApiResponse(Contract)], ["query"]),
    removeContract: IDL.Func([IDL.Nat], [ApiResponse(IDL.Text)], []),
    updateContractStatus: IDL.Func(
      [IDL.Nat, ContractStatus],
      [ApiResponse(Contract)],
      []
    ),

    // Alert Management
    createAlert: IDL.Func(
      [IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
      [ApiResponse(Alert)],
      []
    ),
    getAlerts: IDL.Func([], [IDL.Vec(Alert)], ["query"]),
    getContractAlerts: IDL.Func([IDL.Nat], [IDL.Vec(Alert)], ["query"]),
    getRecentAlerts: IDL.Func([], [IDL.Vec(Alert)], ["query"]),
    acknowledgeAlert: IDL.Func([IDL.Nat], [ApiResponse(Alert)], []),

    // Monitoring Rules
    getMonitoringRules: IDL.Func([], [IDL.Vec(MonitoringRule)], ["query"]),

    // Pause & Quarantine Functions (Barry's Feature from main.mo)
    pauseContract: IDL.Func([IDL.Nat], [ApiResponse(Contract)], []),
    resumeContract: IDL.Func([IDL.Nat], [ApiResponse(Contract)], []),
    quarantineAddress: IDL.Func(
      [IDL.Nat, IDL.Text],
      [ApiResponse(Contract)],
      []
    ),
    unquarantineAddress: IDL.Func(
      [IDL.Nat, IDL.Text],
      [ApiResponse(Contract)],
      []
    ),
    isPaused: IDL.Func([IDL.Nat], [IDL.Bool], ["query"]),
    isQuarantined: IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], ["query"]),

    // Demo Functions
    triggerDemoAlert: IDL.Func([IDL.Nat, IDL.Text], [ApiResponse(Alert)], []),
    initializeDemoData: IDL.Func([], [IDL.Text], []),

    // System Functions
    getSystemStats: IDL.Func([], [SystemStats], ["query"]),
    healthCheck: IDL.Func([], [HealthStatus], ["query"]), // Updated return type
    getVersion: IDL.Func([], [CanisterInfo], ["query"]), // Updated return type
  });
};

// Create agent and actor
let actor = null;

export const initializeActor = async () => {
  try {
    const agent = new HttpAgent({
      host: canisterConfig.host,
      // Disable certificate verification for local development
      ...(process.env.NODE_ENV !== "production" && {
        verifyQuerySignatures: false,
      }),
    });

    // For local development, fetch root key
    if (process.env.NODE_ENV !== "production") {
      await agent.fetchRootKey();
    }

    actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: canisterConfig.canisterId,
    });

    console.log("✅ Actor initialized successfully");
    return actor;
  } catch (error) {
    console.error("❌ Error initializing actor:", error);
    throw error;
  }
};

export const getActor = () => {
  if (!actor) {
    throw new Error("Actor not initialized. Call initializeActor() first.");
  }
  return actor;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to format timestamp (nanoseconds to date)
const formatTimestamp = (nanoseconds) => {
  if (!nanoseconds) return new Date().toLocaleString();

  try {
    // Convert nanoseconds to milliseconds
    const milliseconds = Number(nanoseconds) / 1_000_000;
    const date = new Date(milliseconds);
    return date.toLocaleString();
  } catch (error) {
    console.warn("Error formatting timestamp:", error);
    return new Date().toLocaleString();
  }
};

// Helper function to handle API response variants
const handleApiResponse = (result) => {
  if (result && typeof result === "object") {
    if ("ok" in result) {
      return { success: true, data: result.ok };
    } else if ("err" in result) {
      return { success: false, error: result.err };
    }
  }
  return { success: true, data: result };
};

// Helper function to convert ContractStatus variant to string
const parseContractStatus = (status) => {
  if (typeof status === "object" && status !== null) {
    const statusKey = Object.keys(status)[0];
    return statusKey || "unknown";
  }
  return status || "unknown";
};

// Helper function to create ContractStatus variant for updates
const createContractStatusVariant = (status) => {
  const statusMap = {
    healthy: { healthy: null },
    warning: { warning: null },
    critical: { critical: null },
    offline: { offline: null },
  };
  return statusMap[status] || { healthy: null };
};

// ============================================================================
// API WRAPPER FUNCTIONS
// ============================================================================

export const contractAPI = {
  // Add a new contract
  addContract: async (address, nickname) => {
    try {
      console.log("Adding contract:", { address, nickname });
      const result = await getActor().addContract(address, nickname);
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        // Format the contract data with proper status parsing
        const contract = {
          ...response.data,
          id: Number(response.data.id),
          addedAt: formatTimestamp(response.data.addedAt),
          lastCheck: formatTimestamp(response.data.lastCheck),
          alertCount: Number(response.data.alertCount),
          status: parseContractStatus(response.data.status),
          isActive: Boolean(response.data.isActive),
          isPaused: Boolean(response.data.isPaused),
          quarantinedAddresses: response.data.quarantinedAddresses || [],
        };
        return { success: true, data: contract };
      }

      return response;
    } catch (error) {
      console.error("Error adding contract:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all contracts
  getContracts: async () => {
    try {
      console.log("Fetching contracts...");
      const contracts = await getActor().getContracts();

      // Format contract data with proper parsing
      const formattedContracts = contracts.map((contract) => ({
        id: Number(contract.id),
        address: contract.address,
        nickname: contract.nickname,
        addedAt: formatTimestamp(contract.addedAt),
        lastCheck: formatTimestamp(contract.lastCheck),
        alertCount: Number(contract.alertCount),
        status: parseContractStatus(contract.status),
        isActive: Boolean(contract.isActive),
        isPaused: Boolean(contract.isPaused),
        quarantinedAddresses: contract.quarantinedAddresses || [],
      }));

      console.log("✅ Contracts fetched:", formattedContracts);
      return { success: true, data: formattedContracts };
    } catch (error) {
      console.error("Error fetching contracts:", error);
      return { success: false, error: error.message };
    }
  },

  // Get a specific contract
  getContract: async (contractId) => {
    try {
      console.log("Fetching contract:", contractId);
      const result = await getActor().getContract(Number(contractId));
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const contract = {
          id: Number(response.data.id),
          address: response.data.address,
          nickname: response.data.nickname,
          addedAt: formatTimestamp(response.data.addedAt),
          lastCheck: formatTimestamp(response.data.lastCheck),
          alertCount: Number(response.data.alertCount),
          status: parseContractStatus(response.data.status),
          isActive: Boolean(response.data.isActive),
          isPaused: Boolean(response.data.isPaused),
          quarantinedAddresses: response.data.quarantinedAddresses || [],
        };
        return { success: true, data: contract };
      }

      return response;
    } catch (error) {
      console.error("Error fetching contract:", error);
      return { success: false, error: error.message };
    }
  },

  // Remove a contract
  removeContract: async (contractId) => {
    try {
      console.log("Removing contract:", contractId);
      const result = await getActor().removeContract(Number(contractId));
      return handleApiResponse(result);
    } catch (error) {
      console.error("Error removing contract:", error);
      return { success: false, error: error.message };
    }
  },

  // Update contract status
  updateContractStatus: async (contractId, status) => {
    try {
      console.log("Updating contract status:", { contractId, status });
      const statusVariant = createContractStatusVariant(status);
      const result = await getActor().updateContractStatus(
        Number(contractId),
        statusVariant
      );
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const contract = {
          ...response.data,
          id: Number(response.data.id),
          addedAt: formatTimestamp(response.data.addedAt),
          lastCheck: formatTimestamp(response.data.lastCheck),
          alertCount: Number(response.data.alertCount),
          status: parseContractStatus(response.data.status),
          isActive: Boolean(response.data.isActive),
          isPaused: Boolean(response.data.isPaused),
        };
        return { success: true, data: contract };
      }

      return response;
    } catch (error) {
      console.error("Error updating contract status:", error);
      return { success: false, error: error.message };
    }
  },

  // Pause contract (Barry's feature)
  pauseContract: async (contractId) => {
    try {
      console.log("Pausing contract:", contractId);
      const result = await getActor().pauseContract(Number(contractId));
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const contract = {
          ...response.data,
          id: Number(response.data.id),
          status: parseContractStatus(response.data.status),
          isPaused: Boolean(response.data.isPaused),
        };
        return { success: true, data: contract };
      }

      return response;
    } catch (error) {
      console.error("Error pausing contract:", error);
      return { success: false, error: error.message };
    }
  },

  // Resume contract (Barry's feature)
  resumeContract: async (contractId) => {
    try {
      console.log("Resuming contract:", contractId);
      const result = await getActor().resumeContract(Number(contractId));
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const contract = {
          ...response.data,
          id: Number(response.data.id),
          status: parseContractStatus(response.data.status),
          isPaused: Boolean(response.data.isPaused),
        };
        return { success: true, data: contract };
      }

      return response;
    } catch (error) {
      console.error("Error resuming contract:", error);
      return { success: false, error: error.message };
    }
  },

  // Check if contract is paused
  isPaused: async (contractId) => {
    try {
      const result = await getActor().isPaused(Number(contractId));
      return { success: true, data: Boolean(result) };
    } catch (error) {
      console.error("Error checking pause status:", error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  // Create alert
  createAlert: async (contractId, ruleId, title, description, severity) => {
    try {
      console.log("Creating alert:", {
        contractId,
        ruleId,
        title,
        description,
        severity,
      });
      const result = await getActor().createAlert(
        Number(contractId),
        Number(ruleId),
        title,
        description,
        severity
      );
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const alert = {
          ...response.data,
          id: Number(response.data.id),
          contractId: Number(response.data.contractId),
          ruleId: Number(response.data.ruleId),
          timestamp: formatTimestamp(response.data.timestamp),
          timestampRaw: response.data.timestamp,
          acknowledged: Boolean(response.data.acknowledged),
        };
        return { success: true, data: alert };
      }

      return response;
    } catch (error) {
      console.error("Error creating alert:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all alerts
  getAlerts: async () => {
    try {
      console.log("Fetching alerts...");
      const alerts = await getActor().getAlerts();

      // Format alert data
      const formattedAlerts = alerts.map((alert) => ({
        id: Number(alert.id),
        contractId: Number(alert.contractId),
        contractAddress: alert.contractAddress,
        contractNickname: alert.contractNickname,
        ruleId: Number(alert.ruleId),
        ruleName: alert.ruleName,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        timestamp: formatTimestamp(alert.timestamp),
        timestampRaw: alert.timestamp,
        acknowledged: Boolean(alert.acknowledged),
        data: alert.data?.[0] || null, // Extract optional data
      }));

      console.log("✅ Alerts fetched:", formattedAlerts);
      return { success: true, data: formattedAlerts };
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return { success: false, error: error.message };
    }
  },

  // Get recent alerts
  getRecentAlerts: async () => {
    try {
      console.log("Fetching recent alerts...");
      const alerts = await getActor().getRecentAlerts();

      const formattedAlerts = alerts.map((alert) => ({
        id: Number(alert.id),
        contractId: Number(alert.contractId),
        contractAddress: alert.contractAddress,
        contractNickname: alert.contractNickname,
        ruleId: Number(alert.ruleId),
        ruleName: alert.ruleName,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        timestamp: formatTimestamp(alert.timestamp),
        timestampRaw: alert.timestamp,
        acknowledged: Boolean(alert.acknowledged),
        data: alert.data?.[0] || null,
      }));

      console.log("✅ Recent alerts fetched:", formattedAlerts);
      return { success: true, data: formattedAlerts };
    } catch (error) {
      console.error("Error fetching recent alerts:", error);
      return { success: false, error: error.message };
    }
  },

  // Acknowledge an alert
  acknowledgeAlert: async (alertId) => {
    try {
      console.log("Acknowledging alert:", alertId);
      const result = await getActor().acknowledgeAlert(Number(alertId));
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const alert = {
          ...response.data,
          id: Number(response.data.id),
          contractId: Number(response.data.contractId),
          ruleId: Number(response.data.ruleId),
          timestamp: formatTimestamp(response.data.timestamp),
          acknowledged: Boolean(response.data.acknowledged),
        };
        return { success: true, data: alert };
      }

      return response;
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      return { success: false, error: error.message };
    }
  },

  // Trigger demo alert
  triggerDemoAlert: async (contractId, alertType) => {
    try {
      console.log("Triggering demo alert:", { contractId, alertType });
      const result = await getActor().triggerDemoAlert(
        Number(contractId),
        alertType
      );
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        const alert = {
          ...response.data,
          id: Number(response.data.id),
          contractId: Number(response.data.contractId),
          ruleId: Number(response.data.ruleId),
          timestamp: formatTimestamp(response.data.timestamp),
          acknowledged: Boolean(response.data.acknowledged),
        };
        return { success: true, data: alert };
      }

      return response;
    } catch (error) {
      console.error("Error triggering demo alert:", error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================================
  // SYSTEM FUNCTIONS
  // ============================================================================

  // Get system stats
  getSystemStats: async () => {
    try {
      console.log("Fetching system stats...");
      const stats = await getActor().getSystemStats();

      const formattedStats = {
        totalContracts: Number(stats.totalContracts),
        activeContracts: stats.activeContracts?.[0]
          ? Number(stats.activeContracts[0])
          : undefined,
        activeAlerts: Number(stats.activeAlerts),
        totalAlerts: Number(stats.totalAlerts),
        acknowledgedAlerts: stats.acknowledgedAlerts?.[0]
          ? Number(stats.acknowledgedAlerts[0])
          : undefined,
        systemStatus: stats.systemStatus,
        lastUpdate: stats.lastUpdate?.[0]
          ? formatTimestamp(stats.lastUpdate[0])
          : undefined,
      };

      console.log("✅ System stats fetched:", formattedStats);
      return { success: true, data: formattedStats };
    } catch (error) {
      console.error("Error fetching system stats:", error);
      return { success: false, error: error.message };
    }
  },

  // Initialize demo data
  initializeDemoData: async () => {
    try {
      console.log("Initializing demo data...");
      const result = await getActor().initializeDemoData();
      console.log("✅ Demo data initialized:", result);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error initializing demo data:", error);
      return { success: false, error: error.message };
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      console.log("Performing health check...");
      const result = await getActor().healthCheck();

      const healthData = {
        status: result.status,
        timestamp: formatTimestamp(result.timestamp),
        canisterPrincipal: result.canisterPrincipal,
        memoryUsage: result.memoryUsage?.[0]
          ? Number(result.memoryUsage[0])
          : undefined,
        uptime: result.uptime?.[0]
          ? formatTimestamp(result.uptime[0])
          : undefined,
      };

      console.log("✅ Health check completed:", healthData);
      return { success: true, data: healthData };
    } catch (error) {
      console.error("Error performing health check:", error);
      return { success: false, error: error.message };
    }
  },

  // Get version info
  getVersion: async () => {
    try {
      console.log("Fetching version info...");
      const result = await getActor().getVersion();

      const versionData = {
        name: result.name,
        version: result.version,
        description: result.description,
        features: result.features || [],
        supportedRules: result.supportedRules?.[0] || [],
      };

      console.log("✅ Version info fetched:", versionData);
      return { success: true, data: versionData };
    } catch (error) {
      console.error("Error fetching version info:", error);
      return { success: false, error: error.message };
    }
  },

  // Get monitoring rules
  getMonitoringRules: async () => {
    try {
      console.log("Fetching monitoring rules...");
      const rules = await getActor().getMonitoringRules();

      const formattedRules = rules.map((rule) => ({
        id: Number(rule.id),
        name: rule.name,
        description: rule.description,
        ruleType: rule.ruleType ? Object.keys(rule.ruleType)[0] : "custom",
        enabled: Boolean(rule.enabled),
        threshold: rule.threshold?.[0] ? Number(rule.threshold[0]) : undefined,
        timeWindow: rule.timeWindow?.[0]
          ? Number(rule.timeWindow[0])
          : undefined,
      }));

      console.log("✅ Monitoring rules fetched:", formattedRules);
      return { success: true, data: formattedRules };
    } catch (error) {
      console.error("Error fetching monitoring rules:", error);
      return { success: false, error: error.message };
    }
  },
};
