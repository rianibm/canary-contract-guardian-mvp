# Canary Contract Guardian Agent

🐦 **AI-Enhanced Smart Contract Security Monitor for Internet Computer Protocol (ICP)**

A sophisticated agent that provides 24/7 surveillance of blockchain smart contracts with real-time security alerts, ASI:One AI-powered recommendations, and advanced threat detection capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Security Rules](#security-rules)
- [Integration](#integration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

The Canary Contract Guardian Agent is an intelligent monitoring system designed specifically for Internet Computer Protocol (ICP) smart contracts. It combines traditional rule-based monitoring with advanced AI capabilities powered by ASI:One to provide comprehensive security surveillance.

### Key Capabilities

- **🔍 Real-time Contract Monitoring**: Continuous surveillance of smart contract activities
- **🤖 ASI:One AI Enhancement**: Intelligent threat detection and contextual recommendations
- **🚨 Instant Alert System**: Discord webhook integration for immediate notifications
- **📊 Cross-Rule Correlation**: Advanced pattern recognition for complex multi-vector attacks
- **🌐 Agentverse Integration**: Global discoverability and enhanced connectivity with mailbox support
- **💬 Natural Language Interface**: Chat-based contract management with AI enhancement
- **🔄 Adaptive Learning**: Smart thresholds that adjust to contract behavior patterns
- **🛡️ Comprehensive Rule Set**: 8 advanced security monitoring rules with intelligent correlation

## Features

### Security Monitoring Rules

1. **Balance Drop Detection**
   - Monitors for >50% balance decreases with adaptive thresholds
   - Learning system based on 5-point historical averages
   - Correlation with ownership changes for critical alerts

2. **High Transaction Volume**
   - Tracks unusual transaction frequency (>10 per hour)
   - Pattern analysis for coordinated attacks
   - Time-window correlation with other suspicious activities

3. **Suspicious Function Calls**
   - Monitors admin/upgrade function executions
   - Permission escalation detection
   - Critical function tracking (emergencyWithdraw, startUpgrade)

4. **Ownership Change Monitoring**
   - Critical alerts for admin role modifications
   - Multi-signature requirement changes
   - Governance attack detection with immediate escalation

5. **Cross-Rule Correlation**
   - Multi-vector attack detection within 10-minute windows
   - Complex threat pattern recognition
   - Adaptive severity escalation based on rule combinations

6. **Gas Usage Anomalies**
   - Detects >3× median gas consumption based on 10-point history
   - Reentrancy attack signatures and DoS attempt identification
   - MEV exploitation pattern detection

7. **Reentrancy Detection**
   - Recursive call pattern analysis within 60-second windows
   - State inconsistency monitoring during call execution
   - Call depth tracking for sophisticated attack detection

8. **Flash Loan Monitoring**
   - Large loan detection with rapid transaction chain analysis
   - Price manipulation correlation and MEV exploitation patterns
   - Integration with cross-rule correlation for comprehensive detection

### AI Enhancement Features

- **ASI:One Integration**: Advanced natural language processing for intelligent, contextual responses
- **Smart Local Responses**: Comprehensive fallback system with expert security knowledge when ASI:One unavailable
- **Context-Aware Analysis**: Situation-specific recommendations tailored to contract types and threats
- **Adaptive Learning**: Thresholds automatically adjust based on individual contract behavior patterns
- **Pattern Recognition**: Advanced threat signature detection using historical attack analysis
- **Intelligent Correlation**: AI-powered analysis of multi-vector attacks and complex threat patterns
- **Expert Knowledge Base**: Built-in security expertise covering all major attack vectors and defense strategies

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Canary Agent Core                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ ASI:One     │  │ Agentverse  │  │ REST API    │     │
│  │ Client      │  │ Mailbox     │  │ Endpoints   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Contract    │  │ Monitoring  │  │ Discord     │     │
│  │ Monitor     │  │ Rules (8)   │  │ Notifier    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Canister Client (ICP Integration)           │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Overview

- **`agent.py`**: Main agent orchestrator with Agentverse integration and ASI:One enhancement
- **`asi_client.py`**: ASI:One API client for AI-enhanced responses with intelligent fallbacks
- **`canister_client.py`**: ICP canister communication interface with error handling
- **`contract_monitor.py`**: Core monitoring logic with 8-rule correlation and alert coordination
- **`monitoring_rules.py`**: Advanced security rule definitions with adaptive thresholds
- **`discord_notifier.py`**: Enhanced alert delivery system with rich formatting and context

## Installation

### Prerequisites

- Python 3.8+
- Internet Computer SDK (dfx)
- Active ICP canister deployment
- Discord webhook URL (for notifications)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd canary-contract-guardian-mvp
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# ICP Canister Configuration
CANISTER_ID=rdmx6-jaaaa-aaaah-qcaiq-cai
BASE_URL=http://127.0.0.1:4943

# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# Monitoring Configuration
MONITORING_INTERVAL=300  # 5 minutes in seconds

# Agent Configuration
AGENT_NAME=CanaryGuardian
AGENT_SEED=canary_guardian_secret_seed

# ASI:One AI Configuration (Optional)
AGENTVERSE_API_KEY=your_agentverse_api_key  # For enhanced AI responses
ASI_MODEL_ENDPOINT=https://api.asi.one/v1/models  # ASI:One API endpoint

# Agentverse Configuration (Optional)
AGENTVERSE_MAILBOX=true  # Enable mailbox for persistent communication

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=canary_agent.log
```

### Discord Webhook Setup

1. Create a Discord server or use an existing one
2. Go to Server Settings → Integrations → Webhooks
3. Create a new webhook and copy the URL
4. Add the URL to your `.env` file

### ASI:One API Setup

1. Sign up for ASI:One API access
2. Obtain your API key
3. Configure the endpoint and key in `.env`
4. The agent will fallback to smart local responses if ASI:One is unavailable

## Usage

### Starting the Agent

```bash
# Activate virtual environment
source venv/bin/activate

# Start the agent
python fetch/agent/agent.py
```

### Chat Commands

The agent supports natural language commands with ASI:One AI enhancement:

```
# Advanced monitoring commands
"monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"
"enable comprehensive surveillance for contract rdmx6-jaaaa-aaaah-qcaiq-cai"

# Security analysis commands  
"check this smart contract for security issues"
"analyze contract rdmx6-jaaaa-aaaah-qcaiq-cai for unusual activity"
"perform security audit on my contract"

# Status and management
"what's the status of my contracts?"
"show me all monitored contracts and their health"
"give me a security report"

# Advanced queries
"explain reentrancy attacks and how you detect them"
"what should I do if ownership changes?"
"how does cross-rule correlation work?"
"what are the current threat patterns you're monitoring?"

# Control commands
"stop monitoring rdmx6-jaaaa-aaaah-qcaiq-cai"
"pause monitoring for contract rdmx6-jaaaa-aaaah-qcaiq-cai"
"clear all monitoring data"

# Help and information
"help" or "commands" - Get available commands
"info" - Learn about AI capabilities and features
"rules" - View all 8 monitoring rules and thresholds
```

### REST API Usage

The agent exposes REST endpoints for frontend integration:

```bash
# Health check
curl http://localhost:8001/

# Get agent status
curl http://localhost:8001/status

# Start monitoring (POST)
curl -X POST http://localhost:8001/monitor/add \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "rdmx6-jaaaa-aaaah-qcaiq-cai", "nickname": "My Contract"}'

# Chat with agent (POST)
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"}'
```

## API Reference

### REST Endpoints

#### Health Check
- **GET** `/` - Returns comprehensive agent health status and capabilities

#### Monitoring
- **GET** `/status` - Get detailed monitoring status with contract health and alert summaries  
- **POST** `/monitor/add` - Start comprehensive monitoring for a contract with all 8 rules
- **POST** `/monitor/remove` - Stop monitoring a contract and clear associated data
- **POST** `/monitor/pause` - Temporarily pause contract monitoring without data loss
- **POST** `/monitor/resume` - Resume paused contract monitoring
- **POST** `/clear` - Clear monitoring data with optional filtering by contract or timeframe

#### Communication
- **POST** `/chat` - Send chat message to agent with ASI:One AI enhancement
- **GET** `/alerts` - Get recent security alerts with correlation analysis and recommendations

### Request/Response Models

```python
# Enhanced Chat Request
{
  "message": "monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai with full security analysis",
  "timestamp": "2025-08-26T10:00:00Z",
  "context": {
    "user_preferences": "high_sensitivity",
    "contract_type": "defi"
  }
}

# Monitor Request with Options
{
  "contract_id": "rdmx6-jaaaa-aaaah-qcaiq-cai",
  "nickname": "My DeFi Contract",
  "monitoring_options": {
    "rules": ["all"],  // or specific rule IDs
    "sensitivity": "high",
    "alert_threshold": "warning"
  }
}

# Enhanced Status Response
{
  "contracts": [
    {
      "id": "rdmx6-jaaaa-aaaah-qcaiq-cai",
      "nickname": "My Contract",
      "status": "healthy",
      "isActive": true,
      "isPaused": false,
      "lastCheck": "2025-08-26T10:30:00Z",
      "ruleStatus": {
        "balance_monitoring": "active",
        "transaction_analysis": "active",
        "admin_functions": "active",
        "ownership_changes": "active",
        "cross_correlation": "active",
        "gas_analysis": "active", 
        "reentrancy_detection": "active",
        "flash_loan_monitoring": "active"
      },
      "threatLevel": "low",
      "recentAlerts": 0
    }
  ],
  "stats": {
    "totalContracts": 1,
    "healthyContracts": 1,
    "alertsToday": 0,
    "activeRules": 8,
    "correlationWindows": 5,
    "aiEnhanced": true
  },
  "systemHealth": {
    "asi_one_status": "connected",
    "agentverse_status": "connected",
    "discord_status": "connected",
    "monitoring_active": true
  }
}

# Alert Response with Correlation
{
  "alerts": [
    {
      "id": "alert_001",
      "contractId": "rdmx6-jaaaa-aaaah-qcaiq-cai",
      "rule": "balance_drop",
      "severity": "danger",
      "timestamp": "2025-08-26T10:25:00Z",
      "description": "60% balance decrease detected",
      "correlations": [
        {
          "rule": "ownership_change",
          "timeWindow": "8 minutes ago",
          "severity": "critical"
        }
      ],
      "aiRecommendations": [
        "Immediately verify legitimacy of ownership change",
        "Consider pausing contract operations if possible",
        "Review admin transaction history"
      ]
    }
  ],
  "correlationAnalysis": {
    "activeWindows": 2,
    "riskLevel": "elevated",
    "recommendedActions": [...]
  }
}
```

## Security Rules

### Rule Evaluation Logic

Each monitoring rule is evaluated with the following framework:

```python
class MonitoringRule:
    def evaluate(self, contract_data: Dict, historical_data: List[Dict]) -> List[Dict]:
        """
        Returns list of violations with structure:
        {
            "rule_name": str,
            "severity": "warning|danger|critical",
            "description": str,
            "recommendation": str,
            "data": Dict  # Supporting evidence
        }
        """
```

### Critical Alert Correlations

The agent uses intelligent correlation to detect sophisticated attacks:

- **Balance Drop + Ownership Change** (within 10 minutes) → **CRITICAL** (potential hostile takeover)
- **High Gas Usage + Flash Loan Activity** → **DANGER** (major exploit attempt)
- **Admin Function Changes + Transaction Spikes** → **WARNING** (coordinated attack)
- **Reentrancy Pattern + Balance Manipulation** → **CRITICAL** (active exploitation)
- **Multiple Rule Violations** (within correlation window) → **Escalated severity**

### Adaptive Thresholds

The system continuously learns and adapts:

- **Balance monitoring**: Adjusts based on 5-point historical average and contract type
- **Gas usage**: Uses rolling median of last 10 data points with standard deviation analysis
- **Transaction volume**: Adapts to contract's normal activity patterns over time
- **Function call patterns**: Learns normal admin behavior vs. suspicious activities
- **Temporal patterns**: Understands regular vs. irregular timing patterns

## Integration

### Agentverse Integration

The agent is configured for comprehensive Agentverse connectivity:

```python
agent = Agent(
    name="canary-guardian",
    mailbox=True,  # Persistent communication
    agentverse={
        "use_mailbox": True,
        "http_digest_auth": False, 
        "use_websockets": True,
        "metadata": {
            "name": "Canary Contract Guardian",
            "description": "AI-Enhanced Smart Contract Security Monitor",
            "capabilities": [
                "contract_monitoring",
                "threat_detection", 
                "ai_analysis",
                "cross_rule_correlation",
                "adaptive_learning"
            ]
        }
    }
)
```

### Frontend Integration

The agent provides REST APIs that can be consumed by web frontends:

```javascript
// Example frontend integration
const response = await fetch('http://localhost:8001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai'
  })
});

const result = await response.json();
console.log(result.response);
```

### Discord Integration

Alerts are automatically sent to Discord with enhanced formatting and AI context:

```
🚨 CRITICAL ALERT: Multi-Vector Attack Detected
Contract: My DeFi Contract (rdmx6-jaaaa-aaaah-qcaiq-cai)
Primary Rule: Balance Drop Detection (75% decrease)
Correlated Rules: Ownership Change (8 minutes ago)
Severity: CRITICAL
Time: 2025-08-26 10:30:00 UTC

🧠 AI Analysis:
This pattern matches known hostile takeover signatures. The combination of
significant balance drop with recent ownership changes suggests potential
exploitation or unauthorized access.

📋 Immediate Actions Required:
1. Verify legitimacy of ownership change transaction
2. Pause contract operations immediately if possible
3. Review all admin transactions in the last 30 minutes
4. Check for unauthorized function calls or upgrades
5. Consider emergency response protocols

🔗 Related Patterns:
- Similar attacks detected in Q3 2024 on 3 other contracts
- Average response time for successful mitigation: 12 minutes
- Recommended: Enable 2FA for all admin operations

💡 AI Recommendation:
Based on contract behavior analysis, this appears to be an active exploit.
Immediate intervention recommended within the next 5 minutes.
```

## Development

### Project Structure

```
fetch/agent/
├── agent.py              # Main agent with Agentverse + ASI:One integration
├── asi_client.py         # ASI:One API client with intelligent fallbacks
├── canister_client.py    # ICP canister communication with enhanced error handling
├── contract_monitor.py   # Core monitoring logic with 8-rule correlation
├── discord_notifier.py   # Enhanced alert delivery system with AI context
├── monitoring_rules.py   # Advanced security rule definitions with adaptive learning
└── README.md            # This comprehensive documentation
```

### Adding New Monitoring Rules

1. **Define the rule in `monitoring_rules.py`:**

```python
async def check_custom_rule(self, contract_id: str, contract_data: Dict) -> List[Dict]:
    """Custom security rule implementation"""
    violations = []
    
    # Your rule logic here
    if condition_met:
        violations.append({
            "rule_name": "Custom Rule Name",
            "severity": "warning",  # warning|danger|critical
            "description": "Description of the violation",
            "recommendation": "What the user should do",
            "data": {"supporting": "evidence"}
        })
    
    return violations
```

2. **Register the rule in `check_all_rules` method:**

```python
async def check_all_rules(self, contract_id: str, contract_data: Dict) -> List[Dict]:
    all_violations = []
    
    # Add your new rule
    all_violations.extend(await self.check_custom_rule(contract_id, contract_data))
    
    return all_violations
```

### Testing

```bash
# Run integration tests
python test_integration.py

# Test individual components
python test_dummy_contract.py

# Test agent endpoints
python test_uagent_endpoints.py
```

### Logging

The agent uses structured logging with multiple levels:

```python
import logging

logger = logging.getLogger("CanaryAgent")
logger.info("Info message")
logger.warning("Warning message") 
logger.error("Error message")
logger.debug("Debug message")
```

Logs are written to both console and `canary_agent.log` file.

## Troubleshooting

### Common Issues

#### 1. Agent Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Verify dependencies
pip install -r requirements.txt

# Check environment variables
cat .env
```

#### 2. Canister Connection Failed
```bash
# Verify dfx is running
dfx start

# Check canister status
dfx canister status backend

# Verify canister ID in .env
echo $CANISTER_ID
```

#### 3. Discord Notifications Not Working
```bash
# Test webhook URL manually
curl -X POST $DISCORD_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

#### 4. ASI:One API Issues
```bash
# Check API key
echo $AGENTVERSE_API_KEY

# Test endpoint connectivity
curl -H "Authorization: Bearer $AGENTVERSE_API_KEY" \
  $ASI_MODEL_ENDPOINT/chat/completions
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
export LOG_LEVEL=DEBUG
python fetch/agent/agent.py
```

### Performance Optimization

For high-volume monitoring:

1. **Increase monitoring interval**: Set `MONITORING_INTERVAL=600` (10 minutes)
2. **Optimize rule evaluation**: Disable heavy rules for non-critical contracts
3. **Use connection pooling**: The agent automatically pools HTTP connections
4. **Monitor memory usage**: Use `htop` or similar tools

### Contact & Support

- **Repository**: [GitHub Repository]
- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Additional docs in `/docs` folder
- **Community**: Join the Discord server for support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🐦 Canary Contract Guardian - Your AI-Powered Smart Contract Security Sentinel**

*Powered by ASI:One AI • Built for Internet Computer Protocol • Connected via Agentverse*
