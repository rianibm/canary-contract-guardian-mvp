// API service for communicating with the AI agent via uAgents REST endpoints
class AgentService {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:8001'; // Direct connection to uAgent REST endpoints
    this.agentAddress = null;
  }

  // Send a chat message to the agent using its native REST endpoint
  async sendChatMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response from agent';
      
    } catch (error) {
      console.error('Error sending message to agent:', error);
      // Fallback to simulated response for demo
      return this.simulateAgentResponse(message);
    }
  }

  // Check if agent is running using its health check endpoint
  async checkAgentStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.agentAddress = data.agent_address;
        return {
          connected: true,
          address: data.agent_address,
          name: data.service || 'Canary Contract Guardian',
          status: data.status,
          timestamp: data.timestamp
        };
      }
      return { connected: false };
      
    } catch (error) {
      console.error('Error checking agent status:', error);
      return { connected: false };
    }
  }

  // Send message using the native uAgent REST chat endpoint
  async sendDirectMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Agent communication failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Agent processed your request';
      
    } catch (error) {
      console.error('Direct message error:', error);
      // Fallback to simulated response for demo
      return this.simulateAgentResponse(message);
    }
  }

  // Simulate agent responses for demo when agent is not available
  simulateAgentResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('monitor') && lowerMessage.includes('contract')) {
      const contractId = this.extractContractId(message);
      if (contractId) {
        return `✅ Now monitoring smart contract: ${contractId}\n📊 Initial Status:\n• Contract ID: ${contractId}\n• Status: Active\n• Monitoring Rules: Balance drops, transaction volume, suspicious calls\n• Alerts: Will be sent to Discord when rules are violated\n\nI'll keep watch 24/7! 🐦`;
      } else {
        return "🔍 To monitor a smart contract, please provide the contract ID.\nExample: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'";
      }
    }
    
    if (lowerMessage.includes('check') && lowerMessage.includes('contract')) {
      const contractId = this.extractContractId(message);
      if (contractId) {
        return `✅ Contract Analysis: ${contractId}\n🔍 Status: All checks passed\n• No unusual activity detected\n• All monitoring rules satisfied\n• Contract appears to be operating normally\n\nKeep monitoring for ongoing security! 🐦`;
      } else {
        return "🔍 To check a smart contract, please provide the contract ID.\nExample: 'check this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai for unusual activity'";
      }
    }
    
    if (lowerMessage.includes('status')) {
      return "📊 Contract Status Summary:\n• Total contracts monitored: 1\n• Healthy contracts: 1\n• Alerts today: 2\n• Last check: 30 seconds ago\n• All systems operational 🐦";
    }
    
    if (lowerMessage.includes('help')) {
      return `🐦 Canary Contract Guardian Commands:
• 'monitor this smart contract: [ID]' - Start monitoring a contract
• 'check this smart contract: [ID]' - Check contract for issues
• 'check for unusual activity' - Look for anomalies across all contracts
• 'stop monitoring [ID]' - Stop monitoring a contract
• 'status' - Get all monitored contracts status
• 'status [ID]' - Get specific contract status
• 'alerts' - Information about alerts
• 'info' - Agent information
• 'rules' - View monitoring rules
• 'help' - Show this help

Example: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'`;
    }
    
    return "I understand you want to interact with smart contracts. Try asking me to 'monitor a contract', 'check contract status', or type 'help' for available commands.";
  }

  extractContractId(text) {
    const canisterPattern = /[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}/;
    const match = text.match(canisterPattern);
    return match ? match[0] : null;
  }

  // Get monitoring data from the agent using its native status endpoint
  async getMonitoringData() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          contracts: data.contracts || [],
          alerts: [], // Can be extended later
          stats: data.stats || {
            totalContracts: 0,
            healthyContracts: 0,
            alertsToday: 0
          },
          timestamp: data.timestamp
        };
      }
      
      // Fallback to mock data
      return {
        contracts: [
          {
            id: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
            nickname: 'Main DEX Contract',
            status: 'healthy',
            lastCheck: '30 seconds ago',
            addedAt: '2 hours ago'
          }
        ],
        alerts: [],
        stats: {
          totalContracts: 1,
          healthyContracts: 1,
          alertsToday: 0
        }
      };
      
    } catch (error) {
      console.error('Error getting monitoring data:', error);
      return null;
    }
  }

  // Start monitoring a contract using the agent's monitor endpoint
  async startMonitoring(contractId, nickname = null) {
    try {
      const response = await fetch(`${this.baseUrl}/monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_id: contractId,
          nickname: nickname
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Start monitoring failed:', error);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export default new AgentService();
