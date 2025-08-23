// API service for communicating with the AI agent via uAgents REST endpoints
class AgentService {
  constructor() {
    this.baseUrl = "http://127.0.0.1:8001"; // Direct connection to uAgent REST endpoints
    this.agentAddress = null;
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
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          contracts: data.contracts || [],
          alerts: data.alerts || [],
          stats: data.stats || {
            totalContracts: 0,
            healthyContracts: 0,
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

  extractContractId(text) {
    const canisterPattern =
      /[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}/;
    const match = text.match(canisterPattern);
    return match ? match[0] : null;
  }

  // Start monitoring a contract using the agent's monitor endpoint
  async startMonitoring(contractId, nickname = null) {
    try {
      const response = await fetch(`${this.baseUrl}/monitor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_id: contractId,
          nickname: nickname,
        }),
      });

      if (response.ok) {
        const data = await response.json();
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
}

// Export singleton instance
export default new AgentService();
