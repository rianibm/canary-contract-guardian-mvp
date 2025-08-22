import { Actor, HttpAgent } from "@dfinity/agent";

// Canister configuration
export const canisterConfig = {
  canisterId: process.env.REACT_APP_CANISTER_ID,
  host:
    process.env.NODE_ENV === "production"
      ? "https://ic0.app"
      : "http://localhost:4943", // Updated to match dfx default port
};

// IDL Factory berdasarkan main.mo yang ada
const idlFactory = ({ IDL }) => {
  const ContractStatus = IDL.Variant({
    healthy: IDL.Null,
    warning: IDL.Null,
    critical: IDL.Null,
  });

  const Contract = IDL.Record({
    id: IDL.Nat,
    address: IDL.Text,
    nickname: IDL.Text,
    status: ContractStatus,
    addedAt: IDL.Int,
    lastCheck: IDL.Int,
    alertCount: IDL.Nat,
  });

  const Alert = IDL.Record({
    id: IDL.Nat,
    contractId: IDL.Nat,
    contractAddress: IDL.Text,
    contractNickname: IDL.Text,
    ruleId: IDL.Nat,
    ruleName: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    severity: IDL.Text,
    timestamp: IDL.Int,
    acknowledged: IDL.Bool,
  });

  const ApiResponse = (T) =>
    IDL.Variant({
      ok: T,
      err: IDL.Text,
    });

  const SystemStats = IDL.Record({
    totalContracts: IDL.Nat,
    activeAlerts: IDL.Nat,
    totalAlerts: IDL.Nat,
    systemStatus: IDL.Text,
  });

  const MonitoringRule = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    description: IDL.Text,
    enabled: IDL.Bool,
  });

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

    // Demo Functions
    triggerDemoAlert: IDL.Func([IDL.Nat, IDL.Text], [ApiResponse(Alert)], []),
    initializeDemoData: IDL.Func([], [IDL.Text], []),

    // System Functions
    getSystemStats: IDL.Func([], [SystemStats], ["query"]),
    healthCheck: IDL.Func(
      [],
      [
        IDL.Record({
          status: IDL.Text,
          timestamp: IDL.Int,
          canisterPrincipal: IDL.Text,
        }),
      ],
      ["query"]
    ),
    getVersion: IDL.Func(
      [],
      [
        IDL.Record({
          name: IDL.Text,
          version: IDL.Text,
          description: IDL.Text,
          features: IDL.Vec(IDL.Text),
        }),
      ],
      ["query"]
    ),
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

// Helper function untuk format timestamp
const formatTimestamp = (nanoseconds) => {
  const milliseconds = Number(nanoseconds) / 1_000_000;
  const date = new Date(milliseconds);
  return date.toLocaleString();
};

// Helper function untuk handle API response
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

// API wrapper functions
export const contractAPI = {
  // Add a new contract
  addContract: async (address, nickname) => {
    try {
      console.log("Adding contract:", { address, nickname });
      const result = await getActor().addContract(address, nickname);
      const response = handleApiResponse(result);

      if (response.success && response.data) {
        // Format the contract data
        const contract = {
          ...response.data,
          addedAt: formatTimestamp(response.data.addedAt),
          lastCheck: formatTimestamp(response.data.lastCheck),
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

      // Format contract data
      const formattedContracts = contracts.map((contract) => ({
        ...contract,
        id: Number(contract.id),
        addedAt: formatTimestamp(contract.addedAt),
        lastCheck: formatTimestamp(contract.lastCheck),
        alertCount: Number(contract.alertCount),
        status: Object.keys(contract.status)[0], // Extract variant key
      }));

      console.log("✅ Contracts fetched:", formattedContracts);
      return { success: true, data: formattedContracts };
    } catch (error) {
      console.error("Error fetching contracts:", error);
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

  // Get all alerts
  getAlerts: async () => {
    try {
      console.log("Fetching alerts...");
      const alerts = await getActor().getAlerts();

      // Format alert data
      const formattedAlerts = alerts.map((alert) => ({
        ...alert,
        id: Number(alert.id),
        contractId: Number(alert.contractId),
        ruleId: Number(alert.ruleId),
        timestamp: formatTimestamp(alert.timestamp),
        timestampRaw: alert.timestamp,
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
        ...alert,
        id: Number(alert.id),
        contractId: Number(alert.contractId),
        ruleId: Number(alert.ruleId),
        timestamp: formatTimestamp(alert.timestamp),
        timestampRaw: alert.timestamp,
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
      return handleApiResponse(result);
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
        };
        return { success: true, data: alert };
      }

      return response;
    } catch (error) {
      console.error("Error triggering demo alert:", error);
      return { success: false, error: error.message };
    }
  },

  // Get system stats
  getSystemStats: async () => {
    try {
      console.log("Fetching system stats...");
      const stats = await getActor().getSystemStats();

      const formattedStats = {
        totalContracts: Number(stats.totalContracts),
        activeAlerts: Number(stats.activeAlerts),
        totalAlerts: Number(stats.totalAlerts),
        systemStatus: stats.systemStatus,
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
        ...result,
        timestamp: formatTimestamp(result.timestamp),
      };

      console.log("✅ Health check completed:", healthData);
      return { success: true, data: healthData };
    } catch (error) {
      console.error("Error performing health check:", error);
      return { success: false, error: error.message };
    }
  },

  // Get monitoring rules
  getMonitoringRules: async () => {
    try {
      console.log("Fetching monitoring rules...");
      const rules = await getActor().getMonitoringRules();

      const formattedRules = rules.map((rule) => ({
        ...rule,
        id: Number(rule.id),
      }));

      console.log("✅ Monitoring rules fetched:", formattedRules);
      return { success: true, data: formattedRules };
    } catch (error) {
      console.error("Error fetching monitoring rules:", error);
      return { success: false, error: error.message };
    }
  },
};
