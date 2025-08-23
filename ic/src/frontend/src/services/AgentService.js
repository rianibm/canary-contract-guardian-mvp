// API service for communicating with the AI agent via uAgents REST endpoints
class AgentService {
  constructor() {
    this.baseUrl = "http://127.0.0.1:8001"; // Direct connection to uAgent REST endpoints
    this.agentAddress = null;
    console.log("AgentService initialized with baseUrl:", this.baseUrl);
  }

  // Send a chat message to the agent using its native REST endpoint
  async sendChatMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "No response from agent";
    } catch (error) {
      console.error("Error sending message to agent:", error);
      // Fallback to simulated response for demo
      return this.simulateAgentResponse(message);
    }
  }

  // Check if agent is running using its health check endpoint
  async checkAgentStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.agentAddress = data.agent_address;
        return {
          connected: true,
          address: data.agent_address,
          name: data.service || "Canary Contract Guardian",
          status: data.status,
          timestamp: data.timestamp,
        };
      }
      return { connected: false };
    } catch (error) {
      console.error("Error checking agent status:", error);
      return { connected: false };
    }
  }

  // Send message using the native uAgent REST chat endpoint
  async sendDirectMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent communication failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "Agent processed your request";
    } catch (error) {
      console.error("Direct message error:", error);
      // Fallback to simulated response for demo
      return this.simulateAgentResponse(message);
    }
  }

  // Simulate agent responses for demo when agent is not available
  // Simulate agent responses for demo when agent is not available
  simulateAgentResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("monitor") && lowerMessage.includes("contract")) {
      const contractId = this.extractContractId(message);
      if (contractId) {
        return {
          response: `✅ Now monitoring smart contract: ${contractId}`,
          contracts: [
            {
              id: contractId,
              nickname: "Demo Contract",
              status: "active",
              lastCheck: "just now",
              addedAt: new Date().toISOString(),
            },
          ],
          stats: {
            totalContracts: 1,
            healthyContracts: 1,
            alertsToday: 0,
          },
        };
      } else {
        return { response: "🔍 Please provide the contract ID." };
      }
    }

    if (lowerMessage.includes("check") && lowerMessage.includes("contract")) {
      const contractId = this.extractContractId(message);
      if (contractId) {
        return {
          response: `✅ Contract ${contractId} is healthy`,
          contracts: [
            {
              id: contractId,
              nickname: "Checked Contract",
              status: "healthy",
              lastCheck: "just now",
              addedAt: new Date().toISOString(),
            },
          ],
          stats: {
            totalContracts: 1,
            healthyContracts: 1,
            alertsToday: 0,
          },
        };
      } else {
        return { response: "🔍 Please provide the contract ID." };
      }
    }

    if (lowerMessage.includes("status")) {
      return {
        response: "📊 Demo contract status summary",
        contracts: [
          {
            id: "rdmx6-jaaaa-aaaah-qcaiq-cai",
            nickname: "Main DEX Contract",
            status: "healthy",
            lastCheck: "30 seconds ago",
            addedAt: "2 hours ago",
          },
        ],
        stats: {
          totalContracts: 1,
          healthyContracts: 1,
          alertsToday: 2,
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (lowerMessage.includes("help")) {
      return {
        response: `🐦 Canary Contract Guardian Commands:
• 'monitor this smart contract: [ID]'
• 'check this smart contract: [ID]'
• 'status'
• 'alerts'
• 'rules'
• 'help'`,
      };
    }

    return {
      response:
        "I understand you want to interact with smart contracts. Try asking me to 'monitor', 'check status', or type 'help'.",
    };
  }

  // Get monitoring data from the agent using its native status endpoint
  async getMonitoringData() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove duplicate contracts by ID
        const uniqueContracts = data.contracts ? 
          data.contracts.filter((contract, index, arr) => 
            index === arr.findIndex(c => c.id === contract.id)
          ) : [];
        
        return {
          contracts: uniqueContracts,
          alerts: data.alerts || [],
          stats: data.stats || {
            totalContracts: uniqueContracts.length,
            healthyContracts: uniqueContracts.filter(c => c.status === 'healthy').length,
            alertsToday: 0,
          },
          timestamp: data.timestamp,
        };
      }

      // ✅ fallback in same shape as real agent
      return {
        contracts: [
          {
            id: "rdmx6-jaaaa-aaaah-qcaiq-cai",
            nickname: "Main DEX Contract",
            status: "healthy",
            lastCheck: "30 seconds ago",
            addedAt: "2 hours ago",
          },
        ],
        alerts: [],
        stats: {
          totalContracts: 1,
          healthyContracts: 1,
          alertsToday: 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting monitoring data:", error);
      return null;
    }
  }

  // Get recent alerts from the agent
  async getAlerts() {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        return data.alerts || [];
      }

      // Fallback demo alerts when agent is not available
      return [
        {
          id: 1,
          icon: "⚠️",
          title: "High Transaction Volume",
          description: "Detected 47 transactions in last hour (normal: 8/hour)",
          contract: "rdmx6-jaaaa-aaaah-qcaiq-cai",
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
          contract: "rdmx6-jaaaa-aaaah-qcaiq-cai",
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
          contract: "rdmx6-jaaaa-aaaah-qcaiq-cai",
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
          contract: "rdmx6-jaaaa-aaaah-qcaiq-cai",
          nickname: "Main DEX Contract",
          timestamp: "12 minutes ago",
          severity: "info",
          rule: "State Change Monitor",
          category: "state",
        },
      ];
    } catch (error) {
      console.error("Error getting alerts:", error);
      return [];
    }
  }

  // Clear all monitored contracts
  async clearAllContracts() {
    try {
      const response = await fetch(`${this.baseUrl}/monitor/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Clear all contracts failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  // Stop monitoring specific contract
  async stopMonitoring(contractId) {
    try {
      const response = await fetch(`${this.baseUrl}/monitor/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_id: contractId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Stop monitoring failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  // Pause monitoring for a specific contract
  async pauseMonitoring(contractId) {
    try {
      const response = await fetch(`${this.baseUrl}/monitor/pause`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_id: contractId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Pause monitoring failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  // Resume monitoring for a specific contract
  async resumeMonitoring(contractId) {
    try {
      const response = await fetch(`${this.baseUrl}/monitor/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_id: contractId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Resume monitoring failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  extractContractId(text) {
    const canisterPattern =
      /[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}/;
    const match = text.match(canisterPattern);
    return match ? match[0] : null;
  }

  // Start monitoring a contract using the agent's monitor endpoint
  async startMonitoring(contractId, nickname = null) {
    try {
      console.log("Starting monitoring for:", contractId, "with nickname:", nickname);
      console.log("Using endpoint:", `${this.baseUrl}/monitor/add`);
      
      const response = await fetch(`${this.baseUrl}/monitor/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          contract_id: contractId,
          nickname: nickname,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Start monitoring failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  // Trigger manual check of all monitored contracts
  async triggerManualCheck() {
    try {
      console.log("Triggering manual check");
      
      const response = await fetch(`${this.baseUrl}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          action: "manual_check",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Manual check response:", data);
        return { success: true, ...data };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Manual check failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  // Clear all alerts
  async clearAlerts() {
    try {
      console.log("Clearing all alerts");
      
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          action: "clear_all",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Clear alerts response:", data);
        return { success: true, ...data };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Clear alerts failed:", error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }
}

// Export singleton instance
const agentService = new AgentService();
export default agentService;
